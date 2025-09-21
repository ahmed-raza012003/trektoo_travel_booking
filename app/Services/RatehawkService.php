<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

/**
 * Ratehawk (Emerging Travel Group) API Service
 * 
 * Comprehensive service for interacting with the Ratehawk API
 * Based on official documentation: https://docs.emergingtravel.com/docs/overview/
 */
class RatehawkService
{
    private string $apiKey;
    private string $apiUser;
    private string $baseUrl;
    private int $timeout;
    private int $retryAttempts;
    private int $retryDelay;
    private bool $enableCaching;
    private bool $enableLogging;

    public function __construct()
    {
        $this->apiKey = config('ratehawk.api_key');
        $this->apiUser = config('ratehawk.api_user');
        $this->baseUrl = config('ratehawk.base_url');
        $this->timeout = config('ratehawk.timeout');
        $this->retryAttempts = config('ratehawk.retry_attempts');
        $this->retryDelay = config('ratehawk.retry_delay');
        $this->enableCaching = config('ratehawk.enable_caching', true);
        $this->enableLogging = config('ratehawk.enable_logging', true);

        if (!$this->apiKey || !$this->apiUser) {
            throw new \Exception('Ratehawk API credentials not configured');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | HOTEL SEARCH METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Search hotels by region
     * Endpoint: /search/serp/region/
     */
    public function searchHotelsByRegion(array $params): array
    {
        $validator = Validator::make($params, [
            'checkin' => 'required|date|after:today',
            'checkout' => 'required|date|after:checkin',
            'adults' => 'required|integer|min:1|max:6',
            'children' => 'nullable|array|max:4',
            'children.*' => 'integer|min:0|max:17',
            'residency' => 'required|string|size:2',
            'region_id' => 'required|string',
            'language' => 'nullable|string|size:2',
            'currency' => 'nullable|string|size:3',
            'hotels_limit' => 'nullable|integer|max:100',
            'sort_by' => 'nullable|in:price,rating,distance',
            'sort_order' => 'nullable|in:asc,desc'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors()->toArray());
        }

        $searchParams = [
            'checkin' => $params['checkin'],
            'checkout' => $params['checkout'],
            'residency' => strtolower($params['residency']),
            'language' => $params['language'] ?? config('ratehawk.default_language'),
            'guests' => [[
                'adults' => $params['adults'],
                'children' => $params['children'] ?? []
            ]],
            'region_id' => $params['region_id'],
            'hotels_limit' => $params['hotels_limit'] ?? 50,
            'currency' => $params['currency'] ?? config('ratehawk.default_currency')
        ];

        if (isset($params['sort_by'])) {
            $searchParams['sort'] = [
                'by' => $params['sort_by'],
                'order' => $params['sort_order'] ?? 'asc'
            ];
        }

        return $this->makeRequest('/search/serp/region/', $searchParams);
    }

    /**
     * Search hotels by coordinates
     * Endpoint: /search/serp/geo/
     */
    public function searchHotelsByCoordinates(array $params): array
    {
        $validator = Validator::make($params, [
            'checkin' => 'required|date|after:today',
            'checkout' => 'required|date|after:checkin',
            'adults' => 'required|integer|min:1|max:6',
            'children' => 'nullable|array|max:4',
            'children.*' => 'integer|min:0|max:17',
            'residency' => 'required|string|size:2',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50', // km
            'language' => 'nullable|string|size:2',
            'currency' => 'nullable|string|size:3',
            'hotels_limit' => 'nullable|integer|max:100'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors()->toArray());
        }

        $searchParams = [
            'checkin' => $params['checkin'],
            'checkout' => $params['checkout'],
            'residency' => strtolower($params['residency']),
            'language' => $params['language'] ?? config('ratehawk.default_language'),
            'guests' => [[
                'adults' => $params['adults'],
                'children' => $params['children'] ?? []
            ]],
            'geo' => [
                'latitude' => $params['latitude'],
                'longitude' => $params['longitude'],
                'radius' => $params['radius'] ?? 10
            ],
            'hotels_limit' => $params['hotels_limit'] ?? 50,
            'currency' => $params['currency'] ?? config('ratehawk.default_currency')
        ];

        return $this->makeRequest('/search/serp/geo/', $searchParams);
    }

    /**
     * Search hotels by specific hotel IDs
     * Endpoint: /search/serp/hotels/
     */
    public function searchHotelsByIds(array $params): array
    {
        $validator = Validator::make($params, [
            'checkin' => 'required|date|after:today',
            'checkout' => 'required|date|after:checkin',
            'adults' => 'required|integer|min:1|max:6',
            'children' => 'nullable|array|max:4',
            'children.*' => 'integer|min:0|max:17',
            'residency' => 'required|string|size:2',
            'ids' => 'required|array|min:1|max:200',
            'ids.*' => 'string',
            'language' => 'nullable|string|size:2',
            'currency' => 'nullable|string|size:3'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors()->toArray());
        }

        $searchParams = [
            'checkin' => $params['checkin'],
            'checkout' => $params['checkout'],
            'residency' => strtolower($params['residency']),
            'language' => $params['language'] ?? config('ratehawk.default_language'),
            'guests' => [[
                'adults' => $params['adults'],
                'children' => $params['children'] ?? []
            ]],
            'ids' => $params['ids'],
            'currency' => $params['currency'] ?? config('ratehawk.default_currency')
        ];

        return $this->makeRequest('/search/serp/hotels/', $searchParams);
    }

    /*
    |--------------------------------------------------------------------------
    | HOTEL INFORMATION METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Get hotel information
     * Endpoint: /hotel/info/
     */
    public function getHotelInfo(string $hotelId, string $language = null): array
    {
        $cacheKey = "hotel_info_{$hotelId}_{$language}";
        
        if ($this->enableCaching && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $params = [
            'id' => $hotelId,
            'language' => $language ?? config('ratehawk.default_language')
        ];

        $result = $this->makeRequest('/hotel/info/', $params);

        if ($result['success'] && $this->enableCaching) {
            Cache::put($cacheKey, $result, config('ratehawk.hotel_details_cache_ttl'));
        }

        return $result;
    }

    /**
     * Get hotel page with rooms and pricing
     * Endpoint: /search/hp/
     */
    public function getHotelPage(string $hotelId, array $params): array
    {
        $validator = Validator::make($params, [
            'checkin' => 'required|date|after:today',
            'checkout' => 'required|date|after:checkin',
            'adults' => 'required|integer|min:1|max:6',
            'children' => 'nullable|array|max:4',
            'children.*' => 'integer|min:0|max:17',
            'residency' => 'required|string|size:2',
            'language' => 'nullable|string|size:2',
            'currency' => 'nullable|string|size:3',
            'rooms' => 'nullable|integer|min:1|max:10'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors()->toArray());
        }

        $searchParams = [
            'checkin' => $params['checkin'],
            'checkout' => $params['checkout'],
            'residency' => strtolower($params['residency']),
            'language' => $params['language'] ?? config('ratehawk.default_language'),
            'guests' => [[
                'adults' => $params['adults'],
                'children' => $params['children'] ?? []
            ]],
            'id' => $hotelId,
            'currency' => $params['currency'] ?? config('ratehawk.default_currency'),
            'rooms' => $params['rooms'] ?? 1
        ];

        return $this->makeRequest('/search/hp/', $searchParams);
    }

    /**
     * Get hotel reviews
     * Endpoint: /hotel/reviews/
     */
    public function getHotelReviews(string $hotelId, array $params = []): array
    {
        $searchParams = array_merge([
            'id' => $hotelId,
            'language' => config('ratehawk.default_language')
        ], $params);

        return $this->makeRequest('/hotel/reviews/', $searchParams);
    }

    /*
    |--------------------------------------------------------------------------
    | BOOKING METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Prebook hotel room
     * Endpoint: /hotel/prebook
     */
    public function prebookHotel(string $hash): array
    {
        if (empty($hash)) {
            return $this->errorResponse('Hash is required for prebooking');
        }

        return $this->makeRequest('/hotel/prebook', ['hash' => $hash]);
    }

    /**
     * Create booking form
     * Endpoint: /hotel/order/booking/form/
     */
    public function createBookingForm(array $params): array
    {
        $validator = Validator::make($params, [
            'partner_order_id' => 'required|string|max:255',
            'book_hash' => 'required|string',
            'language' => 'nullable|string|size:2',
            'user_ip' => 'nullable|ip'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors()->toArray());
        }

        $formParams = [
            'partner_order_id' => $params['partner_order_id'],
            'book_hash' => $params['book_hash'],
            'language' => $params['language'] ?? config('ratehawk.default_language'),
            'user_ip' => $params['user_ip'] ?? request()->ip()
        ];

        return $this->makeRequest('/hotel/order/booking/form/', $formParams);
    }

    /**
     * Finish booking
     * Endpoint: /hotel/order/booking/finish/
     */
    public function finishBooking(array $params): array
    {
        $validator = Validator::make($params, [
            'user' => 'required|array',
            'user.email' => 'required|email',
            'user.phone' => 'nullable|string',
            'user.comment' => 'nullable|string',
            'partner' => 'required|array',
            'partner.partner_order_id' => 'required|string',
            'language' => 'nullable|string|size:2',
            'rooms' => 'required|array|min:1',
            'rooms.*.guests' => 'required|array',
            'payment_type' => 'required|array',
            'payment_type.type' => 'required|in:deposit,prepaid,pay_at_property',
            'payment_type.amount' => 'required|numeric|min:0',
            'payment_type.currency_code' => 'required|string|size:3',
            'upsell_data' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors()->toArray());
        }

        $bookingParams = [
            'user' => $params['user'],
            'partner' => $params['partner'],
            'language' => $params['language'] ?? config('ratehawk.default_language'),
            'rooms' => $params['rooms'],
            'payment_type' => $params['payment_type'],
            'upsell_data' => $params['upsell_data'] ?? []
        ];

        return $this->makeRequest('/hotel/order/booking/finish/', $bookingParams);
    }

    /**
     * Get booking status
     * Endpoint: /hotel/order/booking/finish/status/
     */
    public function getBookingStatus(string $partnerOrderId): array
    {
        if (empty($partnerOrderId)) {
            return $this->errorResponse('Partner order ID is required');
        }

        return $this->makeRequest('/hotel/order/booking/finish/status/', [
            'partner_order_id' => $partnerOrderId
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ORDER MANAGEMENT METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Get order information
     * Endpoint: /hotel/order/info/
     */
    public function getOrderInfo(array $params = []): array
    {
        $defaultParams = [
            'ordering' => [
                'ordering_type' => 'desc',
                'ordering_by' => 'created_at'
            ],
            'pagination' => [
                'page_size' => 10,
                'page_number' => 1
            ],
            'search' => [],
            'language' => config('ratehawk.default_language')
        ];

        $searchParams = array_merge($defaultParams, $params);

        return $this->makeRequest('/hotel/order/info/', $searchParams);
    }

    /**
     * Cancel order
     * Endpoint: /hotel/order/cancel/
     */
    public function cancelOrder(string $partnerOrderId): array
    {
        if (empty($partnerOrderId)) {
            return $this->errorResponse('Partner order ID is required');
        }

        return $this->makeRequest('/hotel/order/cancel/', [
            'partner_order_id' => $partnerOrderId
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UTILITY METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Get regions/cities for autocomplete
     * Endpoint: /search/suggest/
     */
    public function suggestRegions(string $query, array $params = []): array
    {
        $searchParams = array_merge([
            'query' => $query,
            'language' => config('ratehawk.default_language')
        ], $params);

        return $this->makeRequest('/search/suggest/', $searchParams);
    }

    /**
     * Get filter values for search
     * Endpoint: /search/filters/
     */
    public function getFilterValues(array $params): array
    {
        return $this->makeRequest('/search/filters/', $params);
    }

    /*
    |--------------------------------------------------------------------------
    | PRIVATE METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Make HTTP request to Ratehawk API
     */
    private function makeRequest(string $endpoint, array $data = []): array
    {
        $attempts = 0;
        $lastError = null;

        while ($attempts < $this->retryAttempts) {
            try {
                if ($this->enableLogging) {
                    Log::info('Ratehawk API Request', [
                        'endpoint' => $endpoint,
                        'attempt' => $attempts + 1,
                        'data' => $this->sanitizeLogData($data)
                    ]);
                }

                $response = Http::withBasicAuth($this->apiKey, $this->apiUser)
                    ->timeout($this->timeout)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                        'User-Agent' => 'Trektoo-Travel-Booking/1.0'
                    ])
                    ->post($this->baseUrl . $endpoint, $data);

                if ($response->successful()) {
                    $responseData = $response->json();
                    
                    if ($this->enableLogging) {
                        Log::info('Ratehawk API Response', [
                            'endpoint' => $endpoint,
                            'status' => $response->status(),
                            'response_size' => strlen($response->body())
                        ]);
                    }

                    return $this->handleSuccessfulResponse($responseData);
                }

                $lastError = "HTTP {$response->status()}: {$response->body()}";

            } catch (\Exception $e) {
                $lastError = $e->getMessage();
                
                if ($this->enableLogging) {
                    Log::error('Ratehawk API Request Failed', [
                        'endpoint' => $endpoint,
                        'attempt' => $attempts + 1,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $attempts++;
            
            if ($attempts < $this->retryAttempts) {
                usleep($this->retryDelay * 1000); // Convert to microseconds
            }
        }

        return $this->errorResponse(
            "API request failed after {$this->retryAttempts} attempts",
            ['last_error' => $lastError]
        );
    }

    /**
     * Handle successful API response
     */
    private function handleSuccessfulResponse(array $responseData): array
    {
        if (isset($responseData['status']) && $responseData['status'] === 'ok') {
            return [
                'success' => true,
                'data' => $responseData['data'] ?? $responseData,
                'status' => $responseData['status'],
                'message' => $responseData['message'] ?? 'Success'
            ];
        }

        return [
            'success' => false,
            'error' => $responseData['error'] ?? 'Unknown error',
            'data' => $responseData,
            'status' => $responseData['status'] ?? 'error'
        ];
    }

    /**
     * Create error response
     */
    private function errorResponse(string $message, array $details = []): array
    {
        return [
            'success' => false,
            'error' => $message,
            'details' => $details
        ];
    }

    /**
     * Sanitize data for logging (remove sensitive information)
     */
    private function sanitizeLogData(array $data): array
    {
        $sensitiveKeys = ['password', 'token', 'secret', 'key', 'hash'];
        
        foreach ($sensitiveKeys as $key) {
            if (isset($data[$key])) {
                $data[$key] = '***REDACTED***';
            }
        }

        return $data;
    }

    /**
     * Get authentication headers
     */
    public function getAuthHeaders(): array
    {
        return [
            'Authorization' => 'Basic ' . base64_encode($this->apiKey . ':' . $this->apiUser)
        ];
    }
}
