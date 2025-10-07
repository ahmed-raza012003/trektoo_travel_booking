# Ratehawk API Testing Guide

## Overview
This guide provides comprehensive testing instructions for the Trektoo Ratehawk API integration. The API collection is based on actual data from your database and includes all available endpoints.

## Database Summary
- **Regions**: 20 regions available
- **Hotels**: 679,000 hotels in database
- **Sample Regions**: Macau (MO), Republic of North Macedonia (MK), Maldives (MV), etc.
- **Sample Hotels**: Isanborei Homestay 2, Hotel Route-Inn Oshu, Koh Jum Beach Villas, etc.

## Environment Setup

### 1. Base URL
```
http://localhost:8000
```

### 2. Authentication
Most endpoints require Bearer token authentication. Use the login endpoint to get your token.

## API Endpoints Testing

### Authentication Flow

#### 1. Register User
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### 2. Login User
```http
POST /api/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response includes auth token - save this for authenticated requests**

### Hotel Search Endpoints

#### 1. Search Hotels by Region
```http
POST /api/hotels/search
Content-Type: application/json

{
  "checkin": "2024-02-15",
  "checkout": "2024-02-17",
  "adults": 2,
  "children": [8, 12],
  "residency": "US",
  "region_id": "104",
  "language": "en",
  "currency": "USD",
  "hotels_limit": 20,
  "sort_by": "price",
  "sort_order": "asc"
}
```

**Available Region IDs from your database:**
- 104: Macau (MO)
- 105: Republic of North Macedonia (MK)
- 109: Maldives (MV)
- 112: Northern Mariana Islands (MP)
- 13: Bahamas (BS)
- 131: New Caledonia (NC)
- 28: Burundi (BI)
- 33: Cayman Islands (KY)
- 4: Andorra (AD)
- 40: Republic of the Congo (CG)

#### 2. Search Hotels by Coordinates
```http
POST /api/hotels/search/coordinates
Content-Type: application/json

{
  "checkin": "2024-02-15",
  "checkout": "2024-02-17",
  "adults": 2,
  "children": [],
  "residency": "US",
  "latitude": 22.1987,
  "longitude": 113.5439,
  "radius": 10,
  "language": "en",
  "currency": "USD",
  "hotels_limit": 20
}
```

#### 3. Suggest Regions
```http
GET /api/hotels/suggest?query=Macau&language=en&limit=10
```

#### 4. Get Filter Values
```http
GET /api/hotels/filters
```

### Hotel Information Endpoints

#### 1. Get Hotel Details
```http
GET /api/hotels/{hotelId}/details?language=en
```

**Available Hotel IDs from your database:**
- `_0x2bba1`: Isanborei Homestay 2
- `isanborei_homestay_8_2`: Isanborei Homestay 8
- `_0x7d635`: Isanborei Homestay 1
- `hotel_routeinn_oshu`: Hotel Route-Inn Oshu (3 stars)
- `koh_jum_beach_villas`: Koh Jum Beach Villas (4 stars)
- `hotel_sagar_3`: Hotel Sagar (2 stars)
- `villa_arjuna`: Villa Arjuna (3 stars)
- `bay_of_stars`: Bay of Stars
- `lanta_wild_beach_resort`: Lanta Wild Beach Resort (2 stars)
- `shizutetsu_hotel_prezio_shizuokaekikita`: Shizutetsu Hotel Prezio Shizuoka Station Kita (3 stars)

#### 2. Get Hotel Page (with rooms and pricing)
```http
GET /api/hotels/{hotelId}/page?checkin=2024-02-15&checkout=2024-02-17&adults=2&children=8,12&residency=US&language=en&currency=USD&rooms=1
```

#### 3. Get Hotel Reviews
```http
GET /api/hotels/{hotelId}/reviews?language=en&page=1&limit=10
```

#### 4. Prebook Hotel
```http
POST /api/hotels/prebook
Content-Type: application/json

{
  "hash": "prebook_hash_12345"
}
```

### Hotel Booking Endpoints (Authenticated)

#### 1. Create Booking Form
```http
POST /api/hotels/bookings/create-form
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "book_hash": "book_hash_12345",
  "user_info": {
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "first_name": "John",
    "last_name": "Doe"
  },
  "payment_type": {
    "type": "prepaid",
    "amount": 150.00,
    "currency_code": "USD"
  },
  "language": "en"
}
```

#### 2. Finish Booking
```http
POST /api/hotels/bookings/finish
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "partner_order_id": "THB-ABC12345-1704067200",
  "payment_method_id": "pm_1234567890",
  "rooms": [
    {
      "guests": [
        {
          "first_name": "John",
          "last_name": "Doe",
          "is_child": false,
          "age": null
        },
        {
          "first_name": "Jane",
          "last_name": "Doe",
          "is_child": true,
          "age": 8
        }
      ]
    }
  ],
  "upsell_data": {},
  "user_comment": "Please provide early check-in if possible"
}
```

#### 3. Get Booking Status
```http
GET /api/hotels/bookings/{partnerOrderId}/status
Authorization: Bearer {your_token}
```

#### 4. Cancel Booking
```http
POST /api/hotels/bookings/{partnerOrderId}/cancel
Authorization: Bearer {your_token}
Content-Type: application/json

{}
```

#### 5. Get User Bookings
```http
GET /api/hotels/bookings?per_page=15
Authorization: Bearer {your_token}
```

### Webhook Endpoints

#### 1. Ratehawk Booking Status Webhook
```http
POST /api/webhooks/ratehawk/booking-status
Content-Type: application/json
X-Ratehawk-Signature: sha256=webhook_signature_here

{
  "partner_order_id": "THB-ABC12345-1704067200",
  "status": "confirmed",
  "ratehawk_order_id": "RH123456789",
  "message": "Booking confirmed successfully"
}
```

#### 2. Ratehawk Booking Changes Webhook
```http
POST /api/webhooks/ratehawk/booking-changes
Content-Type: application/json

{
  "partner_order_id": "THB-ABC12345-1704067200",
  "booking_data": {
    "updated_checkin": "2024-02-16",
    "updated_checkout": "2024-02-18"
  },
  "rate_info": {
    "updated_price": 160.00,
    "currency": "USD"
  }
}
```

### System Endpoints

#### 1. Health Check
```http
GET /api/health
```

## Testing Scenarios

### 1. Complete Booking Flow
1. Register/Login user
2. Search hotels by region
3. Get hotel details
4. Get hotel page with pricing
5. Create booking form
6. Finish booking
7. Check booking status
8. Cancel booking (optional)

### 2. Search Testing
1. Test different region IDs
2. Test coordinate-based search
3. Test different date ranges
4. Test different guest configurations
5. Test sorting options

### 3. Error Handling
1. Test with invalid hotel IDs
2. Test with invalid region IDs
3. Test with invalid dates
4. Test with missing required fields
5. Test with expired tokens

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "errors": { ... }
}
```

## Notes

1. **Authentication**: Most endpoints require Bearer token authentication
2. **Rate Limiting**: Be aware of API rate limits
3. **Data Validation**: All inputs are validated according to business rules
4. **Error Handling**: Comprehensive error handling with detailed messages
5. **Webhooks**: Webhook endpoints don't require authentication but may require signature verification

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check if auth token is valid and included
2. **422 Validation Error**: Check request body format and required fields
3. **404 Not Found**: Verify hotel/region IDs exist in database
4. **500 Internal Server Error**: Check server logs for detailed error information

### Debug Tips
1. Use the health check endpoint to verify API availability
2. Check response headers for additional information
3. Review server logs for detailed error traces
4. Test with minimal data first, then add complexity




