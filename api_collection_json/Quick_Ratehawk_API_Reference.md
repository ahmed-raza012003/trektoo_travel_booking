# Quick Ratehawk API Reference

## 🚀 Quick Start Testing Flow

### 1. Authentication
```
POST /api/register → Get user
POST /api/login → Get {{auth_token}}
```

### 2. Hotel Search
```
GET /api/hotels/suggest?query=New York → Get region_id
POST /api/hotels/search → Search hotels by region
POST /api/hotels/search/coordinates → Search by lat/lng
```

### 3. Hotel Information
```
GET /api/hotels/{hotel_id}/details → Hotel details
GET /api/hotels/{hotel_id}/page → Rooms & pricing (get hash)
GET /api/hotels/{hotel_id}/reviews → Reviews
```

### 4. Booking Flow
```
POST /api/hotels/prebook → Prebook (get book_hash)
POST /api/hotels/bookings/create-form → Create booking (get partner_order_id)
POST /api/hotels/bookings/finish → Complete booking
```

### 5. Management
```
GET /api/hotels/bookings/{partner_order_id}/status → Check status
POST /api/hotels/bookings/{partner_order_id}/cancel → Cancel booking
GET /api/hotels/bookings → List user bookings
```

## 🔧 Key Variables to Track

| Variable | Source | Usage |
|----------|--------|-------|
| `{{auth_token}}` | Login response | Authentication |
| `region_id` | Suggest regions | Hotel search |
| `hotel_id` | Search results | Hotel details |
| `hash` | Hotel page response | Prebooking |
| `book_hash` | Prebook response | Booking form |
| `partner_order_id` | Create form response | Booking management |

## 📋 Essential Test Data

### Sample Request Bodies

**Hotel Search:**
```json
{
  "checkin": "2025-02-15",
  "checkout": "2025-02-17", 
  "adults": 2,
  "children": [8],
  "residency": "US",
  "region_id": "region_12345",
  "currency": "USD"
}
```

**Prebook:**
```json
{
  "hash": "booking_hash_from_hotel_page"
}
```

**Create Booking Form:**
```json
{
  "book_hash": "hash_from_prebook",
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
  }
}
```

**Finish Booking:**
```json
{
  "partner_order_id": "THB-ABC12345-1234567890",
  "payment_method_id": "pm_card_visa",
  "rooms": [{
    "guests": [{
      "first_name": "John",
      "last_name": "Doe",
      "is_child": false
    }]
  }]
}
```

## 🎯 Success Flow Checklist

- [ ] User registered/logged in
- [ ] Hotels found via search
- [ ] Hotel details retrieved
- [ ] Rooms and pricing displayed
- [ ] Prebooking successful
- [ ] Booking form created
- [ ] Payment processed
- [ ] Booking completed
- [ ] Status confirmed
- [ ] Webhooks working

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Invalid region_id | Use suggest regions first |
| Missing hash | Get from hotel page response |
| Auth token expired | Re-login and update variable |
| Payment failed | Check Stripe keys and payment method |
| Webhook not working | Verify signature and endpoint |

## 📊 Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## 🔗 Key Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/hotels/search` | Search hotels by region |
| POST | `/api/hotels/search/coordinates` | Search by coordinates |
| GET | `/api/hotels/suggest` | Get region suggestions |
| GET | `/api/hotels/{id}/details` | Hotel information |
| GET | `/api/hotels/{id}/page` | Rooms & pricing |
| POST | `/api/hotels/prebook` | Prebook hotel |
| POST | `/api/hotels/bookings/create-form` | Create booking |
| POST | `/api/hotels/bookings/finish` | Complete booking |
| GET | `/api/hotels/bookings/{id}/status` | Check status |
| POST | `/api/hotels/bookings/{id}/cancel` | Cancel booking |
| POST | `/api/webhooks/ratehawk/booking-status` | Webhook testing |

---

**File**: `Trektoo_Travel_Booking_API_Complete_with_Ratehawk.postman_collection.json`
**Guide**: `Ratehawk_Complete_Testing_Guide.md`
