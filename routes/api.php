<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Klook\KlookApiController;
use App\Http\Controllers\Api\Klook\KlookTestController;
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
Route::post('/webhooks/stripe', [PaymentController::class, 'stripeWebhook']);

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
