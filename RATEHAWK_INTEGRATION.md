# Ratehawk Hotel Booking Integration

This document provides a comprehensive overview of the Ratehawk (Emerging Travel Group) hotel booking integration implemented in the Trektoo Travel Booking system.

## 📋 Overview

The Ratehawk integration provides a complete hotel booking system with:
- Hotel search by region, coordinates, or hotel IDs
- Detailed hotel information and pricing
- Complete booking flow with payment processing
- Order management and status tracking
- Webhook handling for real-time updates

## 🏗️ Architecture

### Core Components

1. **RatehawkService** - Main API service wrapper
2. **HotelController** - Hotel search and information endpoints
3. **HotelBookingController** - Booking management endpoints
4. **RatehawkWebhookController** - Webhook handling
5. **Models** - RatehawkOrder, HotelCache, updated Booking/Payment models
6. **Background Jobs** - Status checking and cleanup

### Database Schema

#### New Tables
- `ratehawk_orders` - Ratehawk-specific order data
- `hotel_cache` - Cached hotel information

#### Updated Tables
- `bookings` - Added hotel-specific fields
- `payments` - Added Ratehawk order references

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Ratehawk API Configuration
RATEHAWK_API_KEY=11231
RATEHAWK_API_USER=6f429e3c-b8ed-4eef-9f44-925dfbad759b
RATEHAWK_BASE_URL=https://api.worldota.net/api/b2b/v3

# Optional Configuration
RATEHAWK_COMMISSION_RATE=0.10
RATEHAWK_DEFAULT_CURRENCY=USD
RATEHAWK_DEFAULT_LANGUAGE=en
RATEHAWK_TIMEOUT=30
RATEHAWK_RETRY_ATTEMPTS=3
RATEHAWK_RETRY_DELAY=1000
RATEHAWK_CACHE_TTL=3600
RATEHAWK_HOTEL_CACHE_TTL=7200
RATEHAWK_MAX_BOOKING_DAYS=30
RATEHAWK_MAX_GUESTS_PER_ROOM=6
RATEHAWK_MAX_CHILDREN_PER_ROOM=4
RATEHAWK_PAYMENT_TIMEOUT=3600
RATEHAWK_BOOKING_EXPIRY=30
RATEHAWK_WEBHOOK_SECRET=your_webhook_secret
RATEHAWK_WEBHOOK_URL=https://your-domain.com/api/webhooks/ratehawk/booking-status
RATEHAWK_ENABLE_CACHING=true
RATEHAWK_ENABLE_LOGGING=true
RATEHAWK_ENABLE_WEBHOOKS=true
```

## 🚀 API Endpoints

### Public Hotel Search Endpoints

#### Search Hotels by Region
```http
POST /api/hotels/search
```

**Request Body:**
```json
{
  "checkin": "2025-02-01",
  "checkout": "2025-02-03",
  "adults": 2,
  "children": [8, 12],
  "residency": "US",
  "region_id": "region_123",
  "language": "en",
  "currency": "USD",
  "hotels_limit": 50,
  "sort_by": "price",
  "sort_order": "asc"
}
```

#### Search Hotels by Coordinates
```http
POST /api/hotels/search/coordinates
```

**Request Body:**
```json
{
  "checkin": "2025-02-01",
  "checkout": "2025-02-03",
  "adults": 2,
  "children": [8, 12],
  "residency": "US",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 10,
  "language": "en",
  "currency": "USD"
}
```

#### Get Hotel Details
```http
GET /api/hotels/{hotelId}/details?language=en
```

#### Get Hotel Page with Rooms
```http
GET /api/hotels/{hotelId}/page?checkin=2025-02-01&checkout=2025-02-03&adults=2&residency=US
```

#### Get Hotel Reviews
```http
GET /api/hotels/{hotelId}/reviews?language=en&page=1&limit=10
```

#### Suggest Regions
```http
GET /api/hotels/suggest?query=New York&language=en&limit=10
```

#### Get Filter Values
```http
GET /api/hotels/filters
```

#### Prebook Hotel
```http
POST /api/hotels/prebook
```

**Request Body:**
```json
{
  "hash": "booking_hash_from_hotel_page"
}
```

### Authenticated Booking Endpoints

#### Create Booking Form
```http
POST /api/hotels/bookings/create-form
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "book_hash": "booking_hash_from_prebook",
  "user_info": {
    "email": "user@example.com",
    "phone": "+1234567890",
    "first_name": "John",
    "last_name": "Doe"
  },
  "payment_type": {
    "type": "deposit",
    "amount": 150.00,
    "currency_code": "USD"
  },
  "language": "en"
}
```

#### Finish Booking
```http
POST /api/hotels/bookings/finish
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "partner_order_id": "THB-ABC12345-1234567890",
  "payment_method_id": "pm_card_visa",
  "rooms": [
    {
      "guests": [
        {
          "first_name": "John",
          "last_name": "Doe",
          "is_child": false
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
  "upsell_data": [],
  "user_comment": "Ground floor room preferred"
}
```

#### Get Booking Status
```http
GET /api/hotels/bookings/{partnerOrderId}/status
Authorization: Bearer {token}
```

#### Cancel Booking
```http
POST /api/hotels/bookings/{partnerOrderId}/cancel
Authorization: Bearer {token}
```

#### Get User Bookings
```http
GET /api/hotels/bookings?per_page=15
Authorization: Bearer {token}
```

### Webhook Endpoints

#### Booking Status Webhook
```http
POST /api/webhooks/ratehawk/booking-status
```

#### Booking Changes Webhook
```http
POST /api/webhooks/ratehawk/booking-changes
```

## 💳 Payment Integration

The system integrates with Stripe for payment processing:

1. **Payment Intent Creation** - Creates Stripe payment intent
2. **Payment Confirmation** - Confirms payment with Stripe
3. **Refund Processing** - Handles automatic refunds for cancellations/failures
4. **Webhook Handling** - Processes Stripe webhook events

## 🔄 Booking Flow

### Complete Booking Process

1. **Search Hotels** - User searches for hotels by region/coordinates
2. **Select Hotel** - User views hotel details and room options
3. **Prebook** - User prebooks to get pricing and availability
4. **Create Booking Form** - System creates booking form with Ratehawk
5. **Payment** - User completes payment with Stripe
6. **Finish Booking** - System confirms booking with Ratehawk
7. **Confirmation** - User receives booking confirmation

### Status Flow

```
pending → processing → confirmed
   ↓         ↓           ↓
expired   failed    cancelled
```

## 🎯 Background Jobs

### ProcessRatehawkBookingStatus
- Checks booking status with Ratehawk API
- Updates local order status
- Handles refunds for failed bookings
- Retries failed requests

### CleanupExpiredRatehawkOrders
- Marks expired orders as expired
- Runs periodically to clean up old orders

### SyncRatehawkHotelData
- Syncs hotel information from Ratehawk
- Caches hotel data for performance

## 🛠️ Console Commands

### Ratehawk Orders Management
```bash
# Check booking status
php artisan ratehawk:orders status-check --partner-order-id=THB-ABC12345-1234567890

# Check all pending orders
php artisan ratehawk:orders status-check

# Cleanup expired orders
php artisan ratehawk:orders cleanup

# List orders
php artisan ratehawk:orders list --status=pending --limit=10
```

## 📊 Caching Strategy

The system implements intelligent caching:

- **Hotel Information** - Cached for 2 hours
- **Search Results** - Cached for 1 hour
- **Hotel Pages** - Cached for 30 minutes
- **Reviews** - Cached for 4 hours

## 🔒 Security Features

- **API Authentication** - Basic auth with Ratehawk
- **Webhook Verification** - HMAC signature verification
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - Built-in retry logic with delays
- **Error Handling** - Graceful error handling and logging

## 📝 Logging

Comprehensive logging is implemented for:

- API requests and responses
- Booking status changes
- Payment processing
- Error conditions
- Webhook events

## 🚨 Error Handling

The system handles various error scenarios:

- **API Failures** - Automatic retries with exponential backoff
- **Payment Failures** - Automatic refund processing
- **Booking Failures** - Status updates and user notifications
- **Webhook Failures** - Logging and manual intervention support

## 🔧 Development Setup

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Run Migrations**
   ```bash
   php artisan migrate
   ```

3. **Configure Environment**
   - Add Ratehawk API credentials to `.env`
   - Configure Stripe keys
   - Set up webhook URLs

4. **Test Integration**
   ```bash
   # Test hotel search
   curl -X POST http://localhost:8000/api/hotels/search \
     -H "Content-Type: application/json" \
     -d '{"checkin":"2025-02-01","checkout":"2025-02-03","adults":2,"residency":"US","region_id":"test"}'
   ```

## 📚 API Documentation

For detailed API documentation, refer to:
- [Ratehawk API Documentation](https://docs.emergingtravel.com/docs/overview/)
- Internal API documentation in `api_collection_json/`

## 🎉 Features Implemented

✅ **Complete Hotel Search System**
- Search by region, coordinates, or hotel IDs
- Advanced filtering and sorting options
- Real-time availability checking

✅ **Comprehensive Hotel Information**
- Detailed hotel data with images and amenities
- Room types and pricing
- Guest reviews and ratings

✅ **Full Booking Flow**
- Prebooking with pricing
- Payment processing with Stripe
- Order confirmation and management

✅ **Robust Payment System**
- Stripe integration for secure payments
- Automatic refund handling
- Multiple payment types support

✅ **Real-time Status Updates**
- Webhook handling for instant updates
- Background job processing
- Comprehensive status tracking

✅ **Admin Tools**
- Console commands for order management
- Status checking and cleanup
- Detailed logging and monitoring

✅ **Performance Optimization**
- Intelligent caching system
- Database indexing
- API request optimization

✅ **Error Handling & Recovery**
- Comprehensive error handling
- Automatic retry mechanisms
- Graceful failure recovery

This integration provides a production-ready hotel booking system that's scalable, secure, and user-friendly.
