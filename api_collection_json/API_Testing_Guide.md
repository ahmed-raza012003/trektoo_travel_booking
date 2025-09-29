# Complete Postman Testing Guide - Trektoo Travel Booking API

## 🚀 **Step-by-Step Testing Flow**

### **Prerequisites**
1. Import the `Trektoo_Travel_Booking_API.postman_collection.json` into Postman
2. Set up environment variables:
   - `base_url`: `http://localhost:8000`
   - `auth_token`: (will be set automatically after login)

---

## **Phase 1: Authentication Setup**

### **Step 1: Register a New User**
```http
POST {{base_url}}/api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com"
        },
        "token": "1|abc123...",
        "token_type": "Bearer"
    }
}
```

**Action:** Copy the `token` value and set it as `{{auth_token}}` in your environment variables.

### **Step 2: Login (Alternative)**
```http
POST {{base_url}}/api/login
Content-Type: application/json

{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

**Action:** Update `{{auth_token}}` with the new token if needed.

### **Step 3: Verify Authentication**
```http
GET {{base_url}}/api/profile
Authorization: Bearer {{auth_token}}
```

---

## **Phase 2: Explore Klook Activities**

### **Step 4: Get Categories**
```http
GET {{base_url}}/api/klook/categories
```

### **Step 5: Get Activities**
```http
GET {{base_url}}/api/klook/activities?limit=10&page=1
```

### **Step 6: Get Activity Details**
```http
GET {{base_url}}/api/klook/activities/19
```

**Note:** Use an activity ID from Step 5 response.

---

## **Phase 3: Check Availability & Pricing**

### **Step 7: Check Availability**
```http
POST {{base_url}}/api/klook/availability/check
Content-Type: application/json

[
    {
        "package_id": 91249,
        "start_time": "2025-09-20 10:00:00",
        "sku_list": [
            {
                "sku_id": 822428069529,
                "count": 2,
                "price": ""
            }
        ]
    }
]
```

### **Step 8: Get Schedules**
```http
GET {{base_url}}/api/klook/schedules?sku_ids=822428069529&start_time=2025-09-20&end_time=2025-09-25
```

### **Step 9: Get Minimum Selling Price**
```http
GET {{base_url}}/api/klook/msp/8000190401
```

---

## **Phase 4: Create Booking**

### **Step 10: Create Booking**
```http
POST {{base_url}}/api/bookings
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
    "activity_external_id": "19",
    "activity_name": "Universal Studios Singapore",
    "activity_package_id": "91249",
    "activity_date": "2025-09-20",
    "adults": 2,
    "children": 1,
    "total_price": 150.00,
    "currency": "USD",
    "customer_info": {
        "country": "US",
        "email": "john.doe@example.com",
        "first_name": "John",
        "family_name": "Doe",
        "mobile": "+1234567890"
    },
    "booking_details": {
        "items": [
            {
                "package_id": 91249,
                "start_time": "2025-09-20 10:00:00",
                "sku_list": [
                    {
                        "sku_id": 822428069529,
                        "count": 2,
                        "price": "75.00"
                    }
                ]
            }
        ]
    }
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Booking created successfully",
    "data": {
        "id": 1,
        "user_id": 1,
        "type": "activity",
        "activity_external_id": "19",
        "activity_name": "Universal Studios Singapore",
        "status": "pending",
        "total_price": "150.00",
        "currency": "USD"
    }
}
```

**Action:** Note the booking ID for next steps.

---

## **Phase 5: Payment Processing**

### **Step 11: Get Payment Methods**
```http
GET {{base_url}}/api/payment-methods
Authorization: Bearer {{auth_token}}
```

### **Step 12: Get Stripe Publishable Key**
```http
GET {{base_url}}/api/stripe-key
Authorization: Bearer {{auth_token}}
```

### **Step 13: Create Payment Intent (Stripe)**
```http
POST {{base_url}}/api/payments/create-intent
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
    "booking_id": 1,
    "amount": 150.00,
    "currency": "USD",
    "customer_email": "john.doe@example.com",
    "customer_name": "John Doe",
    "billing_address": "123 Main St, City, State 12345"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Payment intent created successfully",
    "data": {
        "payment": {
            "id": 1,
            "booking_id": 1,
            "amount": "150.00",
            "status": "processing"
        },
        "client_secret": "pi_1234567890_secret_abc123",
        "payment_intent_id": "pi_1234567890"
    }
}
```

**Action:** Note the `payment_intent_id` for confirmation.

### **Step 14: Complete Booking with Payment**
```http
POST {{base_url}}/api/bookings/1/complete
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
    "payment_method": "stripe",
    "payment_data": {
        "billing_address": "123 Main St, City, State 12345"
    }
}
```

---

## **Phase 6: Alternative Payment (Klook Balance)**

### **Step 15: Complete Booking with Klook Balance**
```http
POST {{base_url}}/api/bookings/1/complete
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
    "payment_method": "klook_balance",
    "payment_data": {
        "billing_address": "123 Main St, City, State 12345"
    }
}
```

---

## **Phase 7: Verify Results**

### **Step 16: Get Booking Details**
```http
GET {{base_url}}/api/bookings/1
Authorization: Bearer {{auth_token}}
```

### **Step 17: Get Payment Details**
```http
GET {{base_url}}/api/payments/1
Authorization: Bearer {{auth_token}}
```

### **Step 18: Get User Bookings**
```http
GET {{base_url}}/api/bookings?status=confirmed
Authorization: Bearer {{auth_token}}
```

### **Step 19: Get User Payments**
```http
GET {{base_url}}/api/payments?status=paid
Authorization: Bearer {{auth_token}}
```

---

## **Phase 8: Statistics & Management**

### **Step 20: Get Booking Statistics**
```http
GET {{base_url}}/api/bookings-statistics
Authorization: Bearer {{auth_token}}
```

### **Step 21: Get Payment Statistics**
```http
GET {{base_url}}/api/payments-statistics
Authorization: Bearer {{auth_token}}
```

---

## **Phase 9: Cancellation & Refunds**

### **Step 22: Cancel Booking**
```http
POST {{base_url}}/api/bookings/1/cancel
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
    "reason": "Change of plans"
}
```

### **Step 23: Create Refund**
```http
POST {{base_url}}/api/payments/1/refund
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
    "amount": 75.00,
    "reason": "Customer requested partial refund"
}
```

---

## **Phase 10: Klook Order Management**

### **Step 24: Get Klook Bookings**
```http
GET {{base_url}}/api/klook/bookings?order=created:desc
```

### **Step 25: Get Order Detail**
```http
GET {{base_url}}/api/klook/orders/ORD123456
```

### **Step 26: Resend Voucher**
```http
POST {{base_url}}/api/klook/orders/ORD123456/resend-voucher
```

---

## **🔧 Environment Variables Setup**

Create a new environment in Postman with these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:8000` | API base URL |
| `auth_token` | (auto-set) | Authentication token |

---

## **📝 Testing Notes**

1. **Start Laravel Server**: `php artisan serve`
2. **Database**: Ensure PostgreSQL is running and migrations are applied
3. **Stripe Keys**: Already configured in `.env`
4. **Klook API**: Using sandbox environment
5. **Token Management**: Update `{{auth_token}}` after login/register

---

## **🚨 Common Issues & Solutions**

### **Issue: "Address already in use"**
**Solution:** 
```bash
# Kill existing server
pkill -f "php artisan serve"
# Start new server
php artisan serve --host=0.0.0.0 --port=8000
```

### **Issue: Authentication errors**
**Solution:** 
- Check if token is properly set in environment
- Re-login to get fresh token
- Ensure `Authorization: Bearer {{auth_token}}` header is present

### **Issue: Klook API errors**
**Solution:**
- Check `.env` Klook API key configuration
- Verify sandbox environment is accessible
- Check activity/package IDs are valid

---

## **✅ Success Indicators**

- ✅ User registration/login works
- ✅ Klook activities can be fetched
- ✅ Booking creation successful
- ✅ Payment intent created
- ✅ Booking completion works
- ✅ Statistics endpoints return data
- ✅ Cancellation and refunds work

This guide covers the complete end-to-end flow from user registration to booking completion and management! 🎯
