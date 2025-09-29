<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RatehawkService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

/**
 * Hotel Controller
 * 
 * Handles hotel search, details, and information endpoints
 * Based on Ratehawk API documentation: https://docs.emergingtravel.com/docs/overview/
 */
class HotelController extends Controller
{
    public function __construct(
        private RatehawkService $ratehawkService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | HOTEL SEARCH ENDPOINTS
    |--------------------------------------------------------------------------
    */

    /**
     * Search hotels by region
     * POST /api/hotels/search
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'checkin' => 'required|date|after:today',
            'checkout' => 'required|date|after:checkin',
            'adults' => 'required|integer|min:1|max:' . config('ratehawk.max_guests_per_room', 6),
            'children' => 'nullable|array|max:' . config('ratehawk.max_children_per_room', 4),
            'children.*' => 'integer|min:0|max:17',
            'residency' => 'required|string|size:2',
            'region_id' => 'required|string',
            'language' => 'nullable|string|size:2',
            'currency' => 'nullable|string|size:3',
            'hotels_limit' => 'nullable|integer|max:100',
            'sort_by' => 'nullable|in:price,rating,distance',
            'sort_order' => 'nullable|in:asc,desc'
        ], [
            'checkin.after' => 'Check-in date must be in the future',
            'checkout.after' => 'Check-out date must be after check-in date',
            'checkout.before' => 'Maximum booking period is ' . config('ratehawk.max_booking_days', 30) . ' days',
            'adults.max' => 'Maximum ' . config('ratehawk.max_guests_per_room', 6) . ' adults per room',
            'children.max' => 'Maximum ' . config('ratehawk.max_children_per_room', 4) . ' children per room',
            'residency.size' => 'Residency must be a 2-letter country code',
            'hotels_limit.max' => 'Maximum 100 hotels can be returned per search'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Additional validation for maximum booking period
        $checkin = \Carbon\Carbon::parse($request->checkin);
        $checkout = \Carbon\Carbon::parse($request->checkout);
        $maxDays = (int)config('ratehawk.max_booking_days', 30);
        
        if ($checkin->diffInDays($checkout) > $maxDays) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'checkout' => ["Maximum booking period is {$maxDays} days"]
                ]
            ], 422);
        }

        try {
            $result = $this->ratehawkService->searchHotelsByRegion($request->all());

            if (isset($result['success']) && $result['success'] || isset($result['status']) && $result['status'] === 'ok') {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Hotels found successfully',
                    'meta' => [
                        'total_hotels' => count($result['data']['hotels'] ?? []),
                        'search_params' => $request->only(['checkin', 'checkout', 'adults', 'children', 'residency', 'region_id'])
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Hotel search failed',
                'error' => $result['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Hotel search error', [
                'request' => $request->all(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while searching hotels'
            ], 500);
        }
    }

    /**
     * Search hotels by coordinates
     * POST /api/hotels/search/coordinates
     */
    public function searchByCoordinates(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'checkin' => 'required|date|after:today',
            'checkout' => 'required|date|after:checkin',
            'adults' => 'required|integer|min:1|max:' . config('ratehawk.max_guests_per_room', 6),
            'children' => 'nullable|array|max:' . config('ratehawk.max_children_per_room', 4),
            'children.*' => 'integer|min:0|max:17',
            'residency' => 'required|string|size:2',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'language' => 'nullable|string|size:2',
            'currency' => 'nullable|string|size:3',
            'hotels_limit' => 'nullable|integer|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Additional validation for maximum booking period
        $checkin = \Carbon\Carbon::parse($request->checkin);
        $checkout = \Carbon\Carbon::parse($request->checkout);
        $maxDays = (int)config('ratehawk.max_booking_days', 30);
        
        if ($checkin->diffInDays($checkout) > $maxDays) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'checkout' => ["Maximum booking period is {$maxDays} days"]
                ]
            ], 422);
        }

        try {
            $result = $this->ratehawkService->searchHotelsByCoordinates($request->all());

            if (isset($result['success']) && $result['success'] || isset($result['status']) && $result['status'] === 'ok') {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Hotels found successfully',
                    'meta' => [
                        'total_hotels' => count($result['data']['hotels'] ?? []),
                        'search_params' => $request->only(['checkin', 'checkout', 'adults', 'children', 'residency', 'latitude', 'longitude'])
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Hotel search failed',
                'error' => $result['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Hotel coordinate search error', [
                'request' => $request->all(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while searching hotels'
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | HOTEL INFORMATION ENDPOINTS
    |--------------------------------------------------------------------------
    */

    /**
     * Get hotel details
     * GET /api/hotels/{hotelId}/details
     */
    public function getHotelDetails(Request $request, string $hotelId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'language' => 'nullable|string|size:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->ratehawkService->getHotelInfo(
                $hotelId, 
                $request->language
            );

            if (isset($result['success']) && $result['success'] || isset($result['status']) && $result['status'] === 'ok') {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Hotel details retrieved successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve hotel details',
                'error' => $result['error']
            ], 404);

        } catch (\Exception $e) {
            Log::error('Hotel details error', [
                'hotel_id' => $hotelId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while retrieving hotel details'
            ], 500);
        }
    }

    /**
     * Get hotel page with rooms and pricing
     * GET /api/hotels/{hotelId}/page
     */
    public function getHotelPage(Request $request, string $hotelId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'checkin' => 'required|date|after:today',
            'checkout' => 'required|date|after:checkin',
            'adults' => 'required|integer|min:1|max:' . config('ratehawk.max_guests_per_room', 6),
            'children' => 'nullable|array|max:' . config('ratehawk.max_children_per_room', 4),
            'children.*' => 'integer|min:0|max:17',
            'residency' => 'required|string|size:2',
            'language' => 'nullable|string|size:2',
            'currency' => 'nullable|string|size:3',
            'rooms' => 'nullable|integer|min:1|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->ratehawkService->getHotelPage($hotelId, $request->all());

            if (isset($result['success']) && $result['success'] || isset($result['status']) && $result['status'] === 'ok') {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Hotel page retrieved successfully',
                    'meta' => [
                        'hotel_id' => $hotelId,
                        'search_params' => $request->only(['checkin', 'checkout', 'adults', 'children', 'residency'])
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve hotel page',
                'error' => $result['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Hotel page error', [
                'hotel_id' => $hotelId,
                'request' => $request->all(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while retrieving hotel page'
            ], 500);
        }
    }

    /**
     * Get hotel reviews
     * GET /api/hotels/{hotelId}/reviews
     */
    public function getHotelReviews(Request $request, string $hotelId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'language' => 'nullable|string|size:2',
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $params = $request->only(['language', 'page', 'limit']);
            $result = $this->ratehawkService->getHotelReviews($hotelId, $params);

            if (isset($result['success']) && $result['success'] || isset($result['status']) && $result['status'] === 'ok') {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Hotel reviews retrieved successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve hotel reviews',
                'error' => $result['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Hotel reviews error', [
                'hotel_id' => $hotelId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while retrieving hotel reviews'
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | UTILITY ENDPOINTS
    |--------------------------------------------------------------------------
    */

    /**
     * Suggest regions/cities for autocomplete
     * GET /api/hotels/suggest
     */
    public function suggestRegions(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2|max:100',
            'language' => 'nullable|string|size:2',
            'limit' => 'nullable|integer|min:1|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->ratehawkService->suggestRegions(
                $request->query('query'),
                $request->only(['language', 'limit'])
            );

            if (isset($result['success']) && $result['success'] || isset($result['status']) && $result['status'] === 'ok') {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Suggestions retrieved successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve suggestions',
                'error' => $result['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Region suggestion error', [
                'query' => $request->query,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while retrieving suggestions'
            ], 500);
        }
    }

    /**
     * Get filter values for search
     * GET /api/hotels/filters
     */
    public function getFilterValues(Request $request): JsonResponse
    {
        try {
            $result = $this->ratehawkService->getFilterValues($request->all());

            if (isset($result['success']) && $result['success'] || isset($result['status']) && $result['status'] === 'ok') {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Filter values retrieved successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve filter values',
                'error' => $result['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Filter values error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while retrieving filter values'
            ], 500);
        }
    }

    /**
     * Prebook hotel room
     * POST /api/hotels/prebook
     */
    public function prebook(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'hash' => 'required|string|min:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->ratehawkService->prebookHotel($request->hash);

            if (isset($result['success']) && $result['success'] || isset($result['status']) && $result['status'] === 'ok') {
                return response()->json([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Hotel prebooked successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to prebook hotel',
                'error' => $result['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Hotel prebook error', [
                'hash' => $request->hash,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => 'An error occurred while prebooking hotel'
            ], 500);
        }
    }
}
