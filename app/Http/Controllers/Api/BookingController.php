<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\Payment\PaymentManager;
use App\Services\Klook\KlookApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends BaseController
{
    protected $paymentManager;
    protected $klookService;

    public function __construct(PaymentManager $paymentManager, KlookApiService $klookService)
    {
        $this->paymentManager = $paymentManager;
        $this->klookService = $klookService;
    }

    /**
     * Get user's bookings
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $query = $user->bookings()->with(['payments']);
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        $bookings = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return $this->successResponse($bookings);
    }

    /**
     * Get specific booking details
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();
        $booking = $user->bookings()->with(['payments'])->findOrFail($id);
        
        return $this->successResponse($booking);
    }

    /**
     * Create a new booking from Klook activity
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'activity_external_id' => 'required|string',
            'activity_name' => 'required|string',
            'activity_package_id' => 'required|string',
            'activity_date' => 'required|date',
            'adults' => 'required|integer|min:1',
            'children' => 'integer|min:0',
            'total_price' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'customer_info' => 'required|array',
            'booking_details' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            
            // Create booking
            $booking = Booking::create([
                'user_id' => $user->id,
                'type' => 'activity',
                'activity_external_id' => $request->activity_external_id,
                'activity_name' => $request->activity_name,
                'activity_package_id' => $request->activity_package_id,
                'activity_date' => $request->activity_date,
                'adults' => $request->adults,
                'children' => $request->children ?? 0,
                'guests' => $request->adults + ($request->children ?? 0),
                'total_price' => $request->total_price,
                'currency' => strtoupper($request->currency),
                'customer_info' => $request->customer_info,
                'booking_details' => $request->booking_details,
                'status' => 'pending',
            ]);

            DB::commit();

            return $this->successResponse($booking, 'Booking created successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Booking Creation Failed:', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to create booking', 500, $e->getMessage());
        }
    }

    /**
     * Complete booking with Klook API
     */
    public function completeBooking(Request $request, $id): JsonResponse
    {
        $request->validate([
            'payment_method' => 'required|string|in:stripe,klook_balance',
            'payment_data' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $booking = $user->bookings()->findOrFail($id);

            if ($booking->status !== 'pending') {
                return $this->errorResponse('Booking is not in pending status', 400);
            }

            // Create payment
            $payment = $this->paymentManager->createPayment($booking, [
                'amount' => $booking->total_price,
                'currency' => $booking->currency,
                'method' => $request->payment_method,
                'provider' => $request->payment_method === 'klook_balance' ? 'klook' : 'stripe',
                'customer_email' => $user->email,
                'customer_name' => $user->name,
                'billing_address' => $request->payment_data['billing_address'] ?? null,
            ]);

            // Process payment
            if ($request->payment_method === 'klook_balance') {
                // Handle Klook balance payment
                $result = $this->processKlookPayment($booking, $payment, $request->payment_data);
            } else {
                // Handle Stripe payment
                $result = $this->paymentManager->processPayment($payment);
            }

            if (!$result['success']) {
                DB::rollBack();
                return $this->errorResponse('Payment processing failed', 400, $result['error']);
            }

            DB::commit();

            return $this->successResponse([
                'booking' => $booking->fresh(),
                'payment' => $payment->fresh(),
                'payment_intent' => $result['client_secret'] ?? null,
            ], 'Booking completed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Booking Completion Failed:', [
                'booking_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to complete booking', 500, $e->getMessage());
        }
    }

    /**
     * Cancel a booking
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $booking = $user->bookings()->findOrFail($id);

            if (!in_array($booking->status, ['pending', 'confirmed'])) {
                return $this->errorResponse('Booking cannot be cancelled', 400);
            }

            // Cancel booking
            $booking->cancel();

            // Cancel Klook order if exists
            if ($booking->external_booking_id) {
                $this->cancelKlookOrder($booking);
            }

            // Refund payments if any
            $payments = $booking->payments()->where('status', 'paid')->get();
            foreach ($payments as $payment) {
                $this->paymentManager->createRefund($payment);
            }

            DB::commit();

            return $this->successResponse($booking->fresh(), 'Booking cancelled successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Booking Cancellation Failed:', [
                'booking_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to cancel booking', 500, $e->getMessage());
        }
    }

    /**
     * Process Klook balance payment
     */
    protected function processKlookPayment(Booking $booking, Payment $payment, array $paymentData): array
    {
        try {
            // Create order with Klook
            $orderData = [
                'agent_order_id' => $booking->agent_order_id ?? 'ORD_' . time() . '_' . $booking->id,
                'contact_info' => $booking->customer_info,
                'items' => $booking->booking_details['items'] ?? [],
            ];

            $klookResult = $this->klookService->createOrder($orderData);

            if (isset($klookResult['error'])) {
                return [
                    'success' => false,
                    'error' => $klookResult['error'],
                ];
            }

            $orderNo = $klookResult['data']['order_no'] ?? null;
            if (!$orderNo) {
                return [
                    'success' => false,
                    'error' => 'No order number returned from Klook',
                ];
            }

            // Pay with balance
            $payResult = $this->klookService->payWithBalance($orderNo);

            if (isset($payResult['error'])) {
                return [
                    'success' => false,
                    'error' => $payResult['error'],
                ];
            }

            // Update booking and payment
            $booking->update([
                'external_booking_id' => $orderNo,
                'agent_order_id' => $orderData['agent_order_id'],
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);

            $payment->update([
                'transaction_id' => $orderNo,
                'status' => 'paid',
                'paid_at' => now(),
                'provider_response' => $payResult,
            ]);

            return [
                'success' => true,
                'order_no' => $orderNo,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Cancel Klook order
     */
    protected function cancelKlookOrder(Booking $booking): void
    {
        try {
            if ($booking->external_booking_id) {
                $this->klookService->applyOrderCancellation($booking->external_booking_id, 1);
            }
        } catch (\Exception $e) {
            Log::error('Klook Order Cancellation Failed:', [
                'booking_id' => $booking->id,
                'external_booking_id' => $booking->external_booking_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get booking statistics
     */
    public function statistics(): JsonResponse
    {
        $user = Auth::user();
        
        $stats = [
            'total_bookings' => $user->bookings()->count(),
            'pending_bookings' => $user->bookings()->pending()->count(),
            'confirmed_bookings' => $user->bookings()->confirmed()->count(),
            'cancelled_bookings' => $user->bookings()->where('status', 'cancelled')->count(),
            'total_spent' => $user->bookings()->sum('total_price'),
            'recent_bookings' => $user->bookings()
                ->with(['payments'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return $this->successResponse($stats);
    }
}