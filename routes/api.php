<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\Klook\KlookApiController;
use App\Http\Controllers\Api\Klook\KlookTestController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\HotelBookingController;
use App\Http\Controllers\Api\RatehawkWebhookController;
use App\Http\Controllers\Api\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Webhook routes (no auth required)
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handleWebhook']);

// Protected authentication routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Booking routes
    Route::apiResource('bookings', BookingController::class);
    Route::post('/bookings/{id}/complete', [BookingController::class, 'completeBooking']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::get('/bookings-statistics', [BookingController::class, 'statistics']);

    // Payment routes
    Route::apiResource('payments', PaymentController::class)->only(['index', 'show']);
    Route::post('/payments/create-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);
    Route::post('/payments/{id}/refund', [PaymentController::class, 'createRefund']);
    Route::get('/payment-methods', [PaymentController::class, 'getPaymentMethods']);
    Route::get('/stripe-key', [PaymentController::class, 'getStripeKey']);
    Route::get('/payments-statistics', [PaymentController::class, 'statistics']);
});

// Klook API routes
Route::prefix('klook')->group(function () {
    // Test routes
    Route::get('/test', [KlookTestController::class, 'testAll']);
    Route::get('/test/categories', [KlookTestController::class, 'testCategories']);
    Route::get('/test/activities', [KlookTestController::class, 'testActivities']);

    // Categories
    Route::get('/categories', [KlookApiController::class, 'getCategories']);

    // Activities
    Route::get('/activities', [KlookApiController::class, 'getActivities']);
    Route::get('/activities/{activityId}', [KlookApiController::class, 'getActivityDetail']);

    // Schedules
    Route::get('/schedules', [KlookApiController::class, 'getSchedules']);

    // Pricing
    Route::get('/msp/{productId}', [KlookApiController::class, 'getMinimumSellingPrice']);
    Route::get('/otherinfo/{productId}', [KlookApiController::class, 'getOtherInfo']);

    // Orders
    Route::post('/availability/check', [KlookApiController::class, 'checkAvailability']);
    Route::post('/availability/check-direct', [KlookApiController::class, 'checkAvailabilityDirect']);

    Route::post('/orders/validate', [KlookApiController::class, 'validateOrder']);
    Route::post('/orders', [KlookApiController::class, 'createOrder']);
    Route::get('/orders/{orderId}', [KlookApiController::class, 'getOrderDetail']);

    // Balance Pay
    Route::post('/pay/balance/{orderNo}', [KlookApiController::class, 'payWithBalance']);

    // Get Bookings List
    Route::get('/bookings', [KlookApiController::class, 'getBookings']);

    // Resend Voucher 
    Route::post('/orders/{orderId}/resend-voucher', [KlookApiController::class, 'resendVoucher']);

    // Query Balance
    Route::get('/balance', [KlookApiController::class, 'getBalance']);

    // Order Cancellation
    Route::post('/orders/{orderId}/cancel/apply', [KlookApiController::class, 'applyOrderCancellation']);

    // Cancellation Status
    Route::get('/orders/{order_id}/cancel/status', [KlookApiController::class, 'getOrderCancellationStatus']);

    // Checkout without DB
    Route::post('/activity/checkout', [KlookApiController::class, 'checkoutWithoutDb']);

    // Activities booking initiate
    Route::post('/activities-booking/initiate', [KlookApiController::class, 'initiateBooking']);
});

Route::middleware('auth:sanctum')->group(function () {
    // ... other routes ...

    // Klook specific payment routes (protected)
    Route::prefix('klook')->group(function () {
        Route::post('/payment-intent', [PaymentController::class, 'createKlookPaymentIntent']);
        Route::post('/confirm-payment', [PaymentController::class, 'confirmKlookPayment']);
        Route::get('/order-status/{orderId}', [PaymentController::class, 'getKlookOrderStatus']);
        // Klook payment flow routes
        Route::post('/complete-payment-flow', [PaymentController::class, 'completeKlookPaymentFlow']);
        Route::post('/apply-cancellation', [PaymentController::class, 'applyCancellation']);
        Route::get('/cancellation-status/{orderId}', [PaymentController::class, 'getCancellationStatus']);

        // Voucher download
        Route::get('/bookings/{bookingId}/voucher', [PaymentController::class, 'downloadVoucher']);

        // Additional Klook routes
        Route::post('/resend-voucher/{orderId}', [KlookApiController::class, 'resendVoucher']);
        Route::get('/balance', [KlookApiController::class, 'getBalance']);
        
        // Complete booking data for PDF generation
        Route::get('/booking-data/{orderId}', [PaymentController::class, 'getCompleteBookingData']);
        
        // Test routes (for development only)
        Route::post('/test/balance-payment', [PaymentController::class, 'testBalancePayment']);
        Route::post('/manual-complete-payment', [PaymentController::class, 'manualCompletePayment']);
    });
});



Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);

// Test endpoint for complete flow (for development/testing only)
Route::post('/test/complete-flow', [StripeWebhookController::class, 'testCompleteFlow']);

// Webhook simulation endpoint (for development/testing only)
Route::post('/test/simulate-webhook', [StripeWebhookController::class, 'simulateWebhook']);

// Hotel (Ratehawk) API routes
Route::prefix('hotels')->group(function () {
    // Public hotel search and information endpoints
    Route::post('/search', [HotelController::class, 'search']);
    Route::post('/search/coordinates', [HotelController::class, 'searchByCoordinates']);
    Route::get('/suggest', [HotelController::class, 'suggestRegions']);
    Route::get('/filters', [HotelController::class, 'getFilterValues']);
    Route::get('/{hotelId}/details', [HotelController::class, 'getHotelDetails']);
    Route::get('/{hotelId}/page', [HotelController::class, 'getHotelPage']);
    Route::get('/{hotelId}/reviews', [HotelController::class, 'getHotelReviews']);
    Route::post('/prebook', [HotelController::class, 'prebook']);
    
    // Authenticated booking endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::prefix('bookings')->group(function () {
            Route::post('/create-form', [HotelBookingController::class, 'createBookingForm']);
            Route::post('/finish', [HotelBookingController::class, 'finishBooking']);
            Route::get('/{partnerOrderId}/status', [HotelBookingController::class, 'getBookingStatus']);
            Route::post('/{partnerOrderId}/cancel', [HotelBookingController::class, 'cancelBooking']);
            Route::get('/', [HotelBookingController::class, 'getUserBookings']);
        });
    });
});

// Ratehawk webhook endpoints (no authentication required)
Route::prefix('webhooks')->group(function () {
    Route::prefix('ratehawk')->group(function () {
        Route::post('/booking-status', [RatehawkWebhookController::class, 'handleBookingStatus']);
        Route::post('/booking-changes', [RatehawkWebhookController::class, 'handleBookingChanges']);
    });
});

// Database Categories Routes
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'getCategories']);
    Route::get('/level/{level}', [CategoryController::class, 'getCategoriesByLevel']);
    Route::get('/search', [CategoryController::class, 'searchCategories']);
    Route::get('/hierarchy/{categoryId}', [CategoryController::class, 'getCategoryHierarchy']);
});

// Test route for debugging
Route::get('/test-categories', function () {
    try {
        $mainCategories = \App\Models\Category::where('level', 'main')->limit(3)->get();
        return response()->json([
            'success' => true,
            'count' => $mainCategories->count(),
            'categories' => $mainCategories->map(function($cat) {
                return [
                    'id' => $cat->category_id,
                    'name' => $cat->name
                ];
            })
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
});

// Simple categories endpoint for testing
Route::get('/simple-categories', function () {
    try {
        $mainCategories = \App\Models\Category::where('level', 'main')
            ->orderBy('sort_order')
            ->get();

        $categories = $mainCategories->map(function ($mainCategory) {
            $categoryData = [
                'id' => $mainCategory->category_id,
                'name' => $mainCategory->name,
                'sub_category' => []
            ];

            // Get sub-categories for this main category
            $subCategories = \App\Models\Category::where('main_category_id', $mainCategory->category_id)
                ->where('level', 'sub')
                ->orderBy('sort_order')
                ->get();

            foreach ($subCategories as $subCategory) {
                $subCategoryData = [
                    'id' => $subCategory->category_id,
                    'name' => $subCategory->name,
                    'leaf_category' => []
                ];

                // Get leaf categories for this sub-category
                $leafCategories = \App\Models\Category::where('parent_id', $subCategory->category_id)
                    ->where('level', 'leaf')
                    ->orderBy('sort_order')
                    ->get();

                foreach ($leafCategories as $leafCategory) {
                    $subCategoryData['leaf_category'][] = [
                        'id' => $leafCategory->category_id,
                        'name' => $leafCategory->name
                    ];
                }

                $categoryData['sub_category'][] = $subCategoryData;
            }

            return $categoryData;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'success' => true,
                'categories' => $categories
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch categories from database',
            'error' => $e->getMessage()
        ], 500);
    }
});

// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Backend is running',
        'timestamp' => now(),
        'cors_enabled' => true
    ]);
});
