# Klook API Integration - Trektoo Travel Booking

## Overview
The Klook API has been successfully integrated into the Trektoo Travel Booking project. This integration provides comprehensive access to Klook's travel activities, booking management, and order processing capabilities.

## Project Structure

```
app/
├── Http/Controllers/Api/
│   ├── AuthController.php          # Authentication endpoints
│   ├── BaseController.php         # Base API controller with response helpers
│   └── Klook/
│       ├── KlookApiController.php # Main Klook API controller
│       └── KlookTestController.php # Klook testing endpoints
├── Services/Klook/
│   └── KlookApiService.php        # Klook API service layer
config/
└── klook.php                      # Klook configuration
```

## Configuration

### Environment Variables (.env)
```env
# Klook API Configuration
KLOOK_API_KEY=Y3nhQkK5nP2f6y0k7blt0fJWu9Xw3WDG
KLOOK_BASE_URL=https://sandbox-api.klktech.com/v3
KLOOK_LANGUAGE=en_US
```

### Configuration File (config/klook.php)
```php
return [
    'base_url' => env('KLOOK_BASE_URL', 'https://sandbox-api.klktech.com/v3'),
    'api_key'  => env('KLOOK_API_KEY', 'Y3nhQkK5nP2f6y0k7blt0fJWu9Xw3WDG'),
    'language' => env('KLOOK_LANGUAGE', 'en_US'),
    'timeout'  => 30,
];
```

## API Endpoints

### Base URL
```
http://localhost:8000/api/klook
```

### Test Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/test` | Test all Klook endpoints |
| GET | `/test/categories` | Test categories endpoint |
| GET | `/test/activities` | Test activities endpoint |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all activity categories |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activities` | Get activities with filters |
| GET | `/activities/{activityId}` | Get specific activity details |

**Query Parameters for `/activities`:**
- `limit` (optional): Number of results per page (default: 10)
- `page` (optional): Page number (default: 1)
- `city_ids` (optional): Comma-separated city IDs
- `country_ids` (optional): Comma-separated country IDs
- `category_ids` (optional): Comma-separated category IDs

### Schedules & Pricing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schedules` | Get price/inventory schedules |
| GET | `/msp/{productId}` | Get minimum selling price |
| GET | `/otherinfo/{productId}` | Get additional product info |

**Required Parameters for `/schedules`:**
- `sku_ids`: SKU IDs (comma-separated)
- `start_time`: Start date (Y-m-d format)
- `end_time`: End date (Y-m-d format)

### Orders & Booking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/availability/check` | Check availability |
| POST | `/availability/check-direct` | Direct availability check |
| POST | `/orders/validate` | Validate order |
| POST | `/orders` | Create order |
| GET | `/orders/{orderId}` | Get order details |
| POST | `/orders/{orderId}/cancel/apply` | Apply for cancellation |
| GET | `/orders/{order_id}/cancel/status` | Get cancellation status |

### Payment & Balance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pay/balance/{orderNo}` | Pay with balance |
| GET | `/balance` | Get account balance |

### Booking Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | Get bookings list |
| POST | `/orders/{orderId}/resend-voucher` | Resend voucher |
| POST | `/activity/checkout` | Complete checkout process |
| POST | `/activities-booking/initiate` | Initiate booking process |

## Request/Response Examples

### Get Categories
**Request:**
```http
GET /api/klook/categories
```

**Response:**
```json
{
    "success": true,
    "data": {
        "categories": [
            {
                "id": 1,
                "name": "Adventure",
                "description": "Adventure activities"
            }
        ]
    }
}
```

### Get Activities
**Request:**
```http
GET /api/klook/activities?limit=10&page=1&city_ids=1,2,3
```

**Response:**
```json
{
    "success": true,
    "data": {
        "activities": [
            {
                "id": 19,
                "title": "Tokyo City Tour",
                "description": "Explore Tokyo's highlights",
                "price": 50.00,
                "currency": "USD"
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 5,
            "total_items": 50
        }
    }
}
```

### Check Availability
**Request:**
```http
POST /api/klook/availability/check
Content-Type: application/json

{
    "package_id": 123,
    "start_time": "2025-09-20 10:00:00",
    "sku_list": [
        {
            "sku_id": 456,
            "count": 2
        }
    ]
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "package_id": 123,
                "start_time": "2025-09-20 10:00:00",
                "sku_list": [
                    {
                        "sku_id": 456,
                        "count": 2,
                        "price": "50.00",
                        "available": true
                    }
                ]
            }
        ]
    }
}
```

### Validate Order
**Request:**
```http
POST /api/klook/orders/validate
Content-Type: application/json

{
    "agent_order_id": "ORD_1234567890_1234",
    "contact_info": {
        "country": "US",
        "email": "customer@example.com",
        "first_name": "John",
        "family_name": "Doe",
        "mobile": "+1234567890"
    },
    "items": [
        {
            "package_id": 123,
            "start_time": "2025-09-20 10:00:00",
            "sku_list": [
                {
                    "sku_id": 456,
                    "count": 2,
                    "price": "50.00"
                }
            ]
        }
    ]
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "order_id": "ORD_1234567890_1234",
        "status": "validated",
        "total_amount": 100.00,
        "currency": "USD"
    }
}
```

## Error Handling

All endpoints follow the consistent error response format:

```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field_name": ["Error message"]
    }
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Testing

### Using Postman
1. Import the `Klook_API_Collection.postman_collection.json` file
2. Set the base URL to `http://localhost:8000/api/klook`
3. Test endpoints using the provided examples

### Test Endpoints
Start with the test endpoints to verify the integration:
- `GET /api/klook/test` - Tests all major endpoints
- `GET /api/klook/test/categories` - Tests categories
- `GET /api/klook/test/activities` - Tests activities

## Service Layer

The `KlookApiService` handles all API communication with Klook:

```php
use App\Services\Klook\KlookApiService;

$klookService = app(KlookApiService::class);

// Get categories
$categories = $klookService->getCategories();

// Get activities
$activities = $klookService->getActivities([
    'limit' => 10,
    'page' => 1,
    'city_ids' => '1,2,3'
]);

// Check availability
$availability = $klookService->checkAvailability([
    [
        'package_id' => 123,
        'start_time' => '2025-09-20 10:00:00',
        'sku_list' => [
            [
                'sku_id' => 456,
                'count' => 2,
                'price' => ''
            ]
        ]
    ]
]);
```

## Features

### ✅ Implemented Features
- **Categories**: Get all activity categories
- **Activities**: Browse and search activities with filters
- **Activity Details**: Get detailed information about specific activities
- **Schedules**: Get pricing and availability schedules
- **Order Management**: Validate, create, and manage orders
- **Availability Checking**: Real-time availability verification
- **Payment Processing**: Balance payment and order completion
- **Booking Management**: Complete booking workflow
- **Order Cancellation**: Apply for and track cancellations
- **Voucher Management**: Resend vouchers for confirmed orders
- **Account Balance**: Query available balance

### 🔧 Technical Features
- **Consistent Response Format**: All endpoints use BaseController helpers
- **Error Handling**: Comprehensive error handling and logging
- **Request Validation**: Input validation for all endpoints
- **Service Layer**: Clean separation of concerns
- **Configuration Management**: Environment-based configuration
- **Testing Endpoints**: Built-in testing capabilities

## Integration Notes

1. **Authentication**: Klook API uses API key authentication via headers
2. **Rate Limiting**: Be mindful of Klook's rate limits
3. **Sandbox Environment**: Currently configured for sandbox testing
4. **SSL**: SSL verification disabled for local development only
5. **Logging**: All API calls are logged for debugging

## Next Steps

1. **Production Configuration**: Update API key and base URL for production
2. **Error Monitoring**: Implement error monitoring and alerting
3. **Caching**: Add caching for frequently accessed data
4. **Rate Limiting**: Implement client-side rate limiting
5. **Documentation**: Generate API documentation using tools like Swagger

The Klook API integration is now fully functional and ready for use in the Trektoo Travel Booking application!
