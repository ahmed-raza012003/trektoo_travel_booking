# Quick API Reference - Copy & Paste Ready

## 🚀 **Environment Setup**
```
base_url: http://localhost:8000
auth_token: (auto-fill after login)
```

---

## **🔐 Authentication APIs**

### **1. Register User**
```
POST {{base_url}}/api/register
Content-Type: application/json
Accept: application/json

{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

### **2. Login User**
```
POST {{base_url}}/api/login
Content-Type: application/json
Accept: application/json

{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

### **3. Get Profile**
```
GET {{base_url}}/api/profile
Accept: application/json
Authorization: Bearer {{auth_token}}
```

---

## **🎯 Klook APIs**

### **4. Get Categories**
```
GET {{base_url}}/api/klook/categories
```

### **5. Get Activities**
```
GET {{base_url}}/api/klook/activities?limit=10&page=1
```

### **6. Get Activity Detail**
```
GET {{base_url}}/api/klook/activities/19
```

### **7. Check Availability**
```
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

### **8. Create Order**
```
POST {{base_url}}/api/klook/orders
Content-Type: application/json

[
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
```

---

## **📋 Booking APIs**

### **9. Create Booking**
```
POST {{base_url}}/api/bookings
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}

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
        "email": "customer@example.com",
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

### **10. Complete Booking**
```
POST {{base_url}}/api/bookings/1/complete
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}

{
    "payment_method": "stripe",
    "payment_data": {
        "billing_address": "123 Main St, City, State 12345"
    }
}
```

### **11. Get Booking Details**
```
GET {{base_url}}/api/bookings/1
Accept: application/json
Authorization: Bearer {{auth_token}}
```

### **12. Cancel Booking**
```
POST {{base_url}}/api/bookings/1/cancel
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}

{
    "reason": "Change of plans"
}
```

---

## **💳 Payment APIs**

### **13. Create Payment Intent**
```
POST {{base_url}}/api/payments/create-intent
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}

{
    "booking_id": 1,
    "amount": 150.00,
    "currency": "USD",
    "customer_email": "customer@example.com",
    "customer_name": "John Doe",
    "billing_address": "123 Main St, City, State 12345"
}
```

### **14. Confirm Payment**
```
POST {{base_url}}/api/payments/confirm
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}

{
    "payment_intent_id": "pi_1234567890"
}
```

### **15. Get Stripe Key**
```
GET {{base_url}}/api/stripe-key
Accept: application/json
Authorization: Bearer {{auth_token}}
```

### **16. Create Refund**
```
POST {{base_url}}/api/payments/1/refund
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}

{
    "amount": 75.00,
    "reason": "Customer requested refund"
}
```

---

## **📊 Statistics APIs**

### **17. Get Booking Statistics**
```
GET {{base_url}}/api/bookings-statistics
Accept: application/json
Authorization: Bearer {{auth_token}}
```

### **18. Get Payment Statistics**
```
GET {{base_url}}/api/payments-statistics
Accept: application/json
Authorization: Bearer {{auth_token}}
```

---

## **🔧 Complete Testing Flow**

### **Step 1: Authentication**
1. Register user → Copy token → Set as `{{auth_token}}`
2. Login user (alternative)
3. Get profile (verify auth)

### **Step 2: Explore Activities**
4. Get categories
5. Get activities
6. Get activity detail

### **Step 3: Create Booking**
7. Check availability
8. Create booking
9. Complete booking

### **Step 4: Payment**
10. Create payment intent
11. Get Stripe key
12. Confirm payment

### **Step 5: Management**
13. Get booking details
14. Get statistics
15. Cancel booking (if needed)

---

## **📝 Quick Notes**

- **Server**: `php artisan serve` (runs on port 8000)
- **Environment**: Set `base_url` and `auth_token`
- **Headers**: Always include `Accept: application/json`
- **Auth**: Use `Authorization: Bearer {{auth_token}}` for protected routes
- **Body**: Use `Content-Type: application/json` for POST requests

This reference gives you everything you need to manually set up all APIs in Postman! 🎯
