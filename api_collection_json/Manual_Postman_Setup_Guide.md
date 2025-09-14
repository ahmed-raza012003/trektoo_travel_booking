# Manual Postman Setup Guide - Complete API Collection

## 🚀 **Step-by-Step Manual Setup**

### **📋 Prerequisites**
1. Open Postman
2. Create a new Collection: `Trektoo Travel Booking API`
3. Create Environment: `Trektoo Environment`
4. Set Environment Variables:
   - `base_url`: `http://localhost:8000`
   - `auth_token`: (leave empty, will fill after login)

---

## **🔐 Phase 1: Authentication APIs**

### **1. Register User**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/register`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "password123",
      "password_confirmation": "password123"
  }
  ```
- **Action**: Copy `token` from response → Set as `{{auth_token}}`

### **2. Login User**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/login`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
      "email": "john.doe@example.com",
      "password": "password123"
  }
  ```

### **3. Get User Profile**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/profile`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

### **4. Logout User**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/logout`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

### **5. Forgot Password**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/forgot-password`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
      "email": "john.doe@example.com"
  }
  ```

### **6. Reset Password**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/reset-password`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
      "token": "reset_token_from_email",
      "email": "john.doe@example.com",
      "password": "newpassword123",
      "password_confirmation": "newpassword123"
  }
  ```

---

## **🎯 Phase 2: Klook API Endpoints**

### **7. Get Categories**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/categories`

### **8. Get Activities**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/activities?limit=10&page=1`

### **9. Get Activity Detail**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/activities/19`

### **10. Get Schedules**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/schedules?sku_ids=822428069529&start_time=2025-09-20&end_time=2025-09-25`

### **11. Get Minimum Selling Price**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/msp/8000190401`

### **12. Get Other Info**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/otherinfo/78175`

### **13. Check Availability**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/klook/availability/check`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
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

### **14. Validate Order**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/klook/orders/validate`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
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
  ```

### **15. Create Order**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/klook/orders`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
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

### **16. Get Order Detail**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/orders/ORD123456`

### **17. Pay with Balance**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/klook/pay/balance/ORD123456`

### **18. Get Balance**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/balance`

### **19. Get Bookings**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/bookings?order=created:desc`

### **20. Resend Voucher**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/klook/orders/ORD123456/resend-voucher`

### **21. Apply Order Cancellation**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/klook/orders/ORD123456/cancel/apply`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
      "refund_reason_id": 1
  }
  ```

### **22. Get Cancellation Status**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/klook/orders/ORD123456/cancel/status`

---

## **📋 Phase 3: Booking Management APIs**

### **23. Get User Bookings**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/bookings?status=pending&type=activity`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

### **24. Get Booking Details**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/bookings/1`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

### **25. Create Booking**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/bookings`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```
- **Body** (raw JSON):
  ```json
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

### **26. Complete Booking**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/bookings/1/complete`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
      "payment_method": "stripe",
      "payment_data": {
          "billing_address": "123 Main St, City, State 12345"
      }
  }
  ```

### **27. Cancel Booking**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/bookings/1/cancel`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
      "reason": "Change of plans"
  }
  ```

### **28. Get Booking Statistics**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/bookings-statistics`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

---

## **💳 Phase 4: Payment Processing APIs**

### **29. Get User Payments**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/payments?status=paid&provider=stripe`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

### **30. Get Payment Details**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/payments/1`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

### **31. Create Payment Intent**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/payments/create-intent`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
      "booking_id": 1,
      "amount": 150.00,
      "currency": "USD",
      "customer_email": "customer@example.com",
      "customer_name": "John Doe",
      "billing_address": "123 Main St, City, State 12345"
  }
  ```

### **32. Confirm Payment**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/payments/confirm`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
      "payment_intent_id": "pi_1234567890"
  }
  ```

### **33. Create Refund**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/payments/1/refund`
- **Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
      "amount": 75.00,
      "reason": "Customer requested refund"
  }
  ```

### **34. Get Payment Methods**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/payment-methods`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

### **35. Get Stripe Key**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/stripe-key`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

### **36. Get Payment Statistics**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/payments-statistics`
- **Headers**:
  ```
  Accept: application/json
  Authorization: Bearer {{auth_token}}
  ```

---

## **🔧 Environment Variables Setup**

### **Create Environment in Postman:**

1. **Click Environment tab** in Postman
2. **Click "Create Environment"**
3. **Name**: `Trektoo Environment`
4. **Add Variables**:

| Variable | Initial Value | Current Value | Description |
|----------|---------------|---------------|-------------|
| `base_url` | `http://localhost:8000` | `http://localhost:8000` | API base URL |
| `auth_token` | (empty) | (empty) | Auth token (auto-filled) |

---

## **📁 Collection Organization**

### **Create Folders in Collection:**

1. **Authentication** (6 requests)
   - Register User
   - Login User
   - Get User Profile
   - Logout User
   - Forgot Password
   - Reset Password

2. **Klook API** (16 requests)
   - Categories
   - Activities
   - Activity Detail
   - Schedules
   - Minimum Selling Price
   - Other Info
   - Check Availability
   - Validate Order
   - Create Order
   - Get Order Detail
   - Pay with Balance
   - Get Balance
   - Get Bookings
   - Resend Voucher
   - Apply Order Cancellation
   - Get Cancellation Status

3. **Bookings** (6 requests)
   - Get User Bookings
   - Get Booking Details
   - Create Booking
   - Complete Booking
   - Cancel Booking
   - Get Booking Statistics

4. **Payments** (8 requests)
   - Get User Payments
   - Get Payment Details
   - Create Payment Intent
   - Confirm Payment
   - Create Refund
   - Get Payment Methods
   - Get Stripe Key
   - Get Payment Statistics

---

## **✅ Testing Checklist**

### **Phase 1: Authentication**
- [ ] Register user successfully
- [ ] Login user successfully
- [ ] Get profile with token
- [ ] Logout user

### **Phase 2: Klook Integration**
- [ ] Get categories
- [ ] Get activities
- [ ] Get activity details
- [ ] Check availability
- [ ] Create order (if needed)

### **Phase 3: Booking Management**
- [ ] Create booking
- [ ] Complete booking
- [ ] Get booking details
- [ ] Get booking statistics

### **Phase 4: Payment Processing**
- [ ] Create payment intent
- [ ] Get payment methods
- [ ] Get Stripe key
- [ ] Get payment statistics

---

## **🚀 Quick Start Commands**

### **Start Laravel Server:**
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### **Test Server:**
```bash
curl -X GET "http://localhost:8000/api/klook/test"
```

This manual setup gives you complete control over your Postman collection! 🎯
