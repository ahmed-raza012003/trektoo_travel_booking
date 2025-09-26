<?php

namespace App\Services\Klook;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class KlookApiService
{
    protected $client;
    protected $baseUrl;
    protected $apiKey;
    protected $language;

    public function __construct()
    {
        $this->baseUrl = config('klook.base_url', 'https://sandbox-api.klktech.com');
        $this->apiKey = config('klook.api_key', 'Y3nhQkK5nP2f6y0k7blt0fJWu9Xw3WDG');
        $this->language = config('klook.language', 'en_US');

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'verify'   => false, // disable SSL only in local dev
            'headers'  => [
                'X-API-KEY'       => $this->apiKey,
                'Accept-Language' => $this->language,
                'Content-Type'    => 'application/json',
            ],
        ]);
    }

    /**
     * Get categories
     */
    public function getCategories()
    {
        try {
            $response = $this->client->get('v3/products/categories');
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Categories: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get activities with filters
     */
    public function getActivities($params = [])
    {
        try {
            $queryParams = array_filter([
                'limit' => $params['limit'] ?? 10,
                'page' => $params['page'] ?? 1,
                'city_ids' => $params['city_ids'] ?? null,
                'country_ids' => $params['country_ids'] ?? null,
                'category_ids' => $params['category_ids'] ?? null,
            ]);

            $response = $this->client->get('v3/activities', [
                'query' => $queryParams
            ]);

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Activities: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get activity detail by ID
     */
    public function getActivityDetail($activityId)
    {
        try {
            $response = $this->client->get("v3/activities/{$activityId}");
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Activity Detail: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get price/inventory schedules
     */
    public function getSchedules($skuIds, $startTime, $endTime)
    {
        try {
            $sku_id = is_array($skuIds) ? implode(',', $skuIds) : $skuIds;

            $response = $this->client->get("v3/products/skus/$sku_id/schedules", [
                'query' => [
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                ]
            ]);

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Schedules: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get minimum selling price
     */
    public function getMinimumSellingPrice($productId)
    {
        try {
            $response = $this->client->get("v3/msp/{$productId}");
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - MSP: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get other info
     */
    public function getOtherInfo($productId)
    {
        try {
            $response = $this->client->get("v3/otherinfo/{$productId}/products");
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Other Info: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Validate order
     */
    public function validateOrder($orderData)
    {
        try {
            Log::info('Klook Order Validation Request:', $orderData);

            $response = $this->client->post('v3/orders/validation', [
                'headers' => [
                    'X-API-KEY' => $this->apiKey,
                    'Accept-Language' => 'en_US',
                ],
                'json' => $orderData
            ]);

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            // Get more detailed error information
            if ($e->hasResponse()) {
                $response = $e->getResponse();
                $body = $response->getBody()->getContents();
                Log::error('Klook API Error - Order Validation: ' . $body);
            } else {
                Log::error('Klook API Error - Order Validation: ' . $e->getMessage());
            }
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Check availability
     */
    public function checkAvailability(array $availabilityData)
    {
        try {
            // ✅ Log the exact payload being sent
            Log::info('Klook API - Availability Check Request:', [
                'url' => $this->baseUrl . '/v3/availability/check',
                'headers' => [
                    'X-API-KEY' => $this->apiKey,
                    'Accept-Language' => $this->language,
                    'Content-Type' => 'application/json',
                ],
                'payload' => $availabilityData
            ]);

            $response = $this->client->post('v3/availability/check', [
                'json' => $availabilityData,
                'headers' => [
                    'X-API-KEY' => $this->apiKey,
                    'Accept-Language' => $this->language,
                    'Content-Type' => 'application/json',
                ]
            ]);

            $result = json_decode($response->getBody(), true);

            // ✅ Log successful response
            Log::info('Klook API - Availability Check Success:', $result);

            return $result;
        } catch (RequestException $e) {
            $statusCode = $e->hasResponse() ? $e->getResponse()->getStatusCode() : 0;
            $responseBody = $e->hasResponse() ? (string) $e->getResponse()->getBody() : 'No response body';

            Log::error('Klook API Error - Availability Check:', [
                'status_code' => $statusCode,
                'message' => $e->getMessage(),
                'response_body' => $responseBody,
                'request_payload' => $availabilityData
            ]);

            // Try to parse the error response
            if ($e->hasResponse()) {
                $errorResponse = json_decode($responseBody, true);
                if ($errorResponse && isset($errorResponse['error'])) {
                    return [
                        'error' => $errorResponse['error']['message'] ?? $e->getMessage(),
                        'code' => $errorResponse['error']['code'] ?? 'unknown',
                        'status' => $statusCode
                    ];
                }
            }

            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Create order
     */
    public function createOrder($orderData)
    {
        try {
            $response = $this->client->post('v3/orders', [
                'json' => $orderData
            ]);

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Create Order: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Pay order with balance
     */
    public function payWithBalance($orderNo)
    {
        try {
            $response = $this->client->post("v3/pay/balance/{$orderNo}");

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Pay With Balance: ' . $e->getMessage());

            return [
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get bookings list
     */
    public function getBookings($params = [])
    {
        try {
            $queryParams = array_filter([
                'create_start' => $params['create_start'] ?? null,
                'create_end'   => $params['create_end'] ?? null,
                'order'        => $params['order'] ?? 'created:desc',
            ]);

            $response = $this->client->get('v2/bookings', [
                'query' => $queryParams
            ]);

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Get Bookings: ' . $e->getMessage());

            return [
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get order details
     */
    public function getOrderDetails($orderId)
    {
        try {
            $response = $this->client->get("v2/orders/{$orderId}");

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Get Order Details: ' . $e->getMessage());

            return [
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Resend voucher for confirmed orders
     */
    public function resendVoucher($orderId)
    {
        try {
            $response = $this->client->post("v2/orders/{$orderId}/resend_voucher");

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Resend Voucher: ' . $e->getMessage());

            return [
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Query available balance
     */
    public function getBalance()
    {
        try {
            $response = $this->client->get("v2/balance");

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Get Balance: ' . $e->getMessage());

            return [
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get order detail
     */
    public function getOrderDetail($orderId)
    {
        try {
            $response = $this->client->get("v2/orders/{$orderId}");
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('Klook API Error - Order Detail: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Apply for order cancellation
     */
    public function applyOrderCancellation(string $orderId, int $refundReasonId): array
    {
        try {
            $response = $this->client->post("v3/orders/{$orderId}/cancel/apply", [
                'headers' => [
                    'Accept' => 'application/json',
                ],
                'json' => [
                    'refund_reason_id' => $refundReasonId
                ]
            ]);

            $body = (string) $response->getBody();

            // Check if the response is JSON
            $decoded = json_decode($body, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error("Klook API Error - Expected JSON, got HTML: {$body}");
                return ['error' => 'Invalid response from Klook API (HTML returned)'];
            }

            return $decoded;
        } catch (RequestException $e) {
            Log::error("Klook API Error - Apply Order Cancellation: " . $e->getMessage());

            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get cancellation status for an order
     */
    public function getOrderCancellationStatus(string $orderId): array
    {
        try {
            $response = $this->client->get("v3/orders/{$orderId}/cancel/status", [
                'headers' => [
                    'Accept' => 'application/json',
                ]
            ]);

            $body = (string) $response->getBody();

            // Ensure response is JSON
            $decoded = json_decode($body, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error("Klook API Error - Expected JSON, got HTML: {$body}");
                return ['error' => 'Invalid response from Klook API (HTML returned)'];
            }

            return $decoded;
        } catch (RequestException $e) {
            Log::error("Klook API Error - Order Cancellation Status: " . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }
}
