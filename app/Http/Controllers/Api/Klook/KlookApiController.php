<?php

namespace App\Http\Controllers\Api\Klook;

use App\Http\Controllers\Api\BaseController;
use App\Services\Klook\KlookApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Str;

class KlookApiController extends BaseController
{
    protected $klookService;

    public function __construct(KlookApiService $klookService)
    {
        $this->klookService = $klookService;
    }

    /**
     * Get categories
     */
    public function getCategories(): JsonResponse
    {
        $result = $this->klookService->getCategories();

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Get activities with filters (uses database with API fallback)
     */
    public function getActivities(Request $request): JsonResponse
    {
        $params = $request->only(['limit', 'page', 'city_ids', 'country_ids', 'category_ids', 'category_id', 'search']);

        // Use database with API fallback
        $result = $this->klookService->getActivitiesWithFallback($params);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activities',
                'error' => $result['error']
            ], 500);
        }

        return response()->json($result);
    }

    /**
     * Get activity detail
     */
    public function getActivityDetail($activityId): JsonResponse
    {
        $result = $this->klookService->getActivityDetail($activityId);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity detail',
                'error' => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Get schedules
     */
    public function getSchedules(Request $request): JsonResponse
    {
        $request->validate([
            'sku_ids' => 'required',
            'start_time' => 'required|date',
            'end_time' => 'required|date'
        ]);

        $result = $this->klookService->getSchedules(
            $request->sku_ids,
            $request->start_time,
            $request->end_time
        );

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch schedules',
                'error' => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Get minimum selling price
     */
    public function getMinimumSellingPrice($productId): JsonResponse
    {
        $result = $this->klookService->getMinimumSellingPrice($productId);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch minimum selling price',
                'error' => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Get other info
     */
    public function getOtherInfo($productId): JsonResponse
    {
        $result = $this->klookService->getOtherInfo($productId);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch other info',
                'error' => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Validate order
     */
    public function validateOrder(Request $request): JsonResponse
    {
        $request->validate([
            'agent_order_id' => 'required|string',
            'contact_info' => 'required|array',
            'items' => 'required|array'
        ]);

        $result = $this->klookService->validateOrder($request->all());

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate order',
                'error' => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Check availability
     */
    // public function checkAvailability(Request $request): JsonResponse
    // {
    //     $request->validate([
    //         'package_id' => 'required|integer',
    //         'start_time' => 'required|date',
    //         'sku_list' => 'required|array'
    //     ]);

    //     $result = $this->klookService->checkAvailability($request->all());

    //     if (isset($result['error'])) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to check availability',
    //             'error' => $result['error']
    //         ], 500);
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'data' => $result
    //     ]);
    // }

    // In your KlookApiController.php
    public function checkAvailabilityDirect(Request $request): JsonResponse
    {
        try {
            // Get the raw JSON payload
            $payload = json_decode($request->getContent(), true);

            if (!$payload) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid JSON payload'
                ], 400);
            }

            // Validate the payload structure
            if (!is_array($payload) || empty($payload)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Payload must be a non-empty array'
                ], 400);
            }

            // Create a version of the payload without prices for Klook API
            $klookPayload = [];
            foreach ($payload as $index => $item) {
                $klookItem = [
                    'package_id' => $item['package_id'],
                    'start_time' => $item['start_time'],
                    'sku_list' => []
                ];

                foreach ($item['sku_list'] as $sku) {
                    // Send empty price to Klook to get current price
                    $klookSku = [
                        'sku_id' => $sku['sku_id'],
                        'count' => $sku['count'],
                        'price' => "" // Empty price to get current price from Klook
                    ];
                    $klookItem['sku_list'][] = $klookSku;
                }

                $klookPayload[] = $klookItem;
            }

            Log::info('Klook API - Availability Check Payload:', $klookPayload);

            // Call the Klook service
            $result = $this->klookService->checkAvailability($klookPayload);

            if (isset($result['error'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to check availability',
                    'error' => $result['error']
                ], 500);
            }

            // Compare prices if they were provided in the request
            $priceComparison = [];
            foreach ($payload as $index => $item) {
                foreach ($item['sku_list'] as $skuIndex => $sku) {
                    if (!empty($sku['price']) && isset($result['data'][$index]['sku_list'][$skuIndex]['price'])) {
                        $requestedPrice = (float) $sku['price'];
                        $currentPrice = (float) $result['data'][$index]['sku_list'][$skuIndex]['price'];

                        // Apply your markup to the current price for comparison
                        $currentPriceWithMarkup = $currentPrice * (1 + 0.15); // 15% markup

                        if ($requestedPrice > 0 && abs($requestedPrice - $currentPriceWithMarkup) > 0.01) {
                            return response()->json([
                                'success' => false,
                                'message' => "sku {$sku['sku_id']} participant time {$item['start_time']} price had changed, new price {$currentPrice}",
                                'current_price' => $currentPrice,
                                'current_price_with_markup' => $currentPriceWithMarkup
                            ], 400);
                        }

                        $priceComparison[] = [
                            'sku_id' => $sku['sku_id'],
                            'requested_price' => $requestedPrice,
                            'current_price' => $currentPrice,
                            'current_price_with_markup' => $currentPriceWithMarkup,
                            'price_match' => abs($requestedPrice - $currentPriceWithMarkup) <= 0.01
                        ];
                    }
                }
            }

            // Add price comparison to the response
            $result['price_comparison'] = $priceComparison;

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Direct Availability Check Exception:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during availability check',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkAvailability(Request $request): JsonResponse
    {
        // Validate the request data
        $request->validate([
            'package_id' => 'required|integer',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'sku_list' => 'required|array',
            'sku_list.*.sku_id' => 'required|integer',
            'sku_list.*.count' => 'required|integer',
        ]);

        // Prepare the payload as an array of objects
        $payload = [
            [
                'package_id' => $request->input('package_id'),
                'start_time' => $request->input('start_time'),
                'sku_list' => $request->input('sku_list')
            ]
        ];

        try {
            // Call the Klook service
            $result = $this->klookService->checkAvailability($payload);

            // Check for errors in the result
            if (isset($result['error'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to check availability',
                    'error' => $result['error']
                ], 500);
            }

            // Return the success response
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (RequestException $e) {
            // Log the error
            Log::error('Klook API Error - Availability Check: ' . $e->getMessage());

            // Return an error response
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during the availability check',
                'error' => $e->getMessage()
            ], 500);
        }
    }








    /**
     * Create order
     */
    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'agent_order_id' => 'required|string',
            'contact_info' => 'required|array',
            'items' => 'required|array'
        ]);

        $result = $this->klookService->createOrder($request->all());

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }




    /**
     * Pay with balance
     */
    public function payWithBalance($orderNo): JsonResponse
    {
        $result = $this->klookService->payWithBalance($orderNo);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to pay with balance',
                'error'   => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data'    => $result
        ]);
    }


    /**
     * Get bookings list
     */
    public function getBookings(Request $request): JsonResponse
    {
        $request->validate([
            'create_start' => 'nullable|date_format:Y-m-d H:i:s',
            'create_end'   => 'nullable|date_format:Y-m-d H:i:s',
            'order'        => 'nullable|in:created:asc,created:desc',
        ]);

        $params = $request->only(['create_start', 'create_end', 'order']);

        $result = $this->klookService->getBookings($params);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch bookings list',
                'error'   => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data'    => $result
        ]);
    }




    /**
     * Resend voucher
     */
    public function resendVoucher($orderId): JsonResponse
    {
        $result = $this->klookService->resendVoucher($orderId);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend voucher',
                'error'   => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data'    => $result
        ]);
    }


    /**
     * Get account balance
     */
    public function getBalance(): JsonResponse
    {
        $result = $this->klookService->getBalance();

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch balance',
                'error'   => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data'    => $result
        ]);
    }








    /**
     * Get order detail
     */
    public function getOrderDetail($orderId): JsonResponse
    {
        $result = $this->klookService->getOrderDetail($orderId);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order detail',
                'error' => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Cancel order
     */
    // public function cancelOrder($orderId): JsonResponse
    // {
    //     $result = $this->klookService->cancelOrder($orderId);

    //     if (isset($result['error'])) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to cancel order',
    //             'error' => $result['error']
    //         ], 500);
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'data' => $result
    //     ]);
    // }




    /**
     * Apply for order cancellation
     */
    public function applyOrderCancellation(Request $request, string $orderId): JsonResponse
    {
        // Validate the request
        $request->validate([
            'refund_reason_id' => 'required|integer|in:0,1,2,3,4,5,6,7,8,9,99',
        ]);

        $refundReasonId = $request->input('refund_reason_id');

        $result = $this->klookService->applyOrderCancellation($orderId, $refundReasonId);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply order cancellation',
                'error'   => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data'    => $result
        ]);
    }



    /**
     * Get cancellation status
     */
    public function getOrderCancellationStatus(string $orderId): JsonResponse
    {
        $result = $this->klookService->getOrderCancellationStatus($orderId);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order cancellation status',
                'error' => $result['error']
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }



    public function checkoutWithoutDb(Request $request): JsonResponse
    {
        try {
            // 1️⃣ Check Availability
            $availabilityPayload = [[
                'package_id' => $request->package_id,
                'start_time' => $request->start_time,
                'sku_list'   => $request->sku_list
            ]];

            $availability = $this->klookService->checkAvailability($availabilityPayload);

            if (isset($availability['error'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Availability check failed',
                    'error'   => $availability['error']
                ], 400);
            }

            // 2️⃣ Validate Order
            $validate = $this->klookService->validateOrder($request->only([
                'agent_order_id',
                'contact_info',
                'items'
            ]));

            if (isset($validate['error'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order validation failed',
                    'error'   => $validate['error']
                ], 400);
            }

            // 3️⃣ Create Order
            $create = $this->klookService->createOrder($request->only([
                'agent_order_id',
                'contact_info',
                'items'
            ]));

            if (isset($create['error']) || empty($create['data']['order_no'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order creation failed',
                    'error'   => $create['error'] ?? 'No order number returned'
                ], 400);
            }

            $orderNo = $create['data']['order_no'];

            // 4️⃣ Pay With Balance
            $pay = $this->klookService->payWithBalance($orderNo);

            if (isset($pay['error'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Wallet payment failed',
                    'error'   => $pay['error']
                ], 400);
            }

            return response()->json([
                'status' => true,
                'message' => 'Booking successful',
                'data' => [
                    'order_no' => $orderNo,
                    'url'      => url('/thank-you?order=' . $orderNo)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Unexpected error',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    public function initiateBooking(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'customer_info' => 'required|array',
                'booking_details' => 'required|array',
                'terms_accepted' => 'required|boolean'
            ]);

            // 1. Prepare Klook order validation payload
            $customerInfo = $request->input('customer_info');
            $bookingDetails = $request->input('booking_details');

            $klookValidationPayload = [
                'agent_order_id' => 'ORD_' . time() . '_' . rand(1000, 9999),
                'contact_info' => [
                    'country' => $customerInfo['country'],
                    'email' => $customerInfo['email'],
                    'first_name' => $customerInfo['first_name'],
                    'family_name' => $customerInfo['last_name'],
                    'mobile' => $customerInfo['phone']
                ],
                'items' => [
                    [
                        'package_id' => (int) $bookingDetails['package_id'],
                        'start_time' => $bookingDetails['schedule']['start_time'],
                        'sku_list' => [
                            [
                                'sku_id' => (int) $bookingDetails['schedule']['sku_id'],
                                'count' => (int) ($bookingDetails['adult_quantity'] + $bookingDetails['child_quantity']),
                                'price' => ""
                            ]
                        ],
                        'booking_extra_info' => $bookingDetails['extra_info']['booking_extra_info'] ?? [],
                        'unit_extra_info' => $bookingDetails['extra_info']['unit_extra_info'] ?? []
                    ]
                ]
            ];

            // 2. Validate order with Klook ONLY (no payment intent creation)
            $validationResult = $this->klookService->validateOrder($klookValidationPayload);

            if (isset($validationResult['error'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order validation failed',
                    'error' => $validationResult['error']
                ], 400);
            }

            // 3. Return validation success with agent_order_id for frontend to use
            // In your initiateBooking method
            return response()->json([
                'success' => true,
                'data' => [
                    'validation' => $validationResult,
                    'agent_order_id' => $klookValidationPayload['agent_order_id'],
                    'checkout_url' => '/activity-confirmation' // Change this key
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Booking Initiation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Booking validation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function createPaymentIntent($amount, $currency, $orderId)
    {
        // Implement your payment processor integration here
        // This is a placeholder - replace with Stripe, PayPal, etc.

        return [
            'id' => 'pi_' . Str::random(14),
            'amount' => $amount,
            'currency' => strtolower($currency),
            'order_id' => $orderId,
            'client_secret' => 'seti_' . Str::random(20) // For Stripe
        ];
    }
}
