# Ratehawk Complete Testing Guide

This guide provides step-by-step instructions for testing the complete Ratehawk hotel booking flow using the updated Postman collection.

## 📋 Prerequisites

1. **Environment Setup**
   - Laravel backend running on `http://localhost:8000`
   - Ratehawk API credentials configured in `.env`
   - Stripe API keys configured for payment processing

2. **Required Environment Variables**
   ```bash
   # Ratehawk Configuration
   RATEHAWK_API_KEY=11231
   RATEhawk_API_USER=6f429e3c-b8ed-4eef-9f44-925dfbad759b
   RATEHAWK_BASE_URL=https://api.worldota.net/api/b2b/v3
   
   # Stripe Configuration
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 🚀 Complete Ratehawk Testing Flow

### Step 1: Authentication
1. **Register User**
   - Use: `Authentication > Register User`
   - Update email to unique value
   - Copy the returned token

2. **Login User**
   - Use: `Authentication > Login User`
   - Copy the `auth_token` from response
   - Set it in collection variables: `{{auth_token}}`

### Step 2: Hotel Search & Discovery

#### 2.1 Search Hotels by Region
1. **Get Region Suggestions**
   - Use: `Ratehawk Hotels > Hotel Search > Suggest Regions`
   - Query: "New York", "London", "Paris", etc.
   - Copy a valid `region_id` from response

2. **Search Hotels**
   - Use: `Ratehawk Hotels > Hotel Search > Search Hotels by Region`
   - Update `region_id` with value from suggestions
   - Adjust dates to future dates (checkin/checkout)
   - Update adults/children as needed

#### 2.2 Search Hotels by Coordinates
1. **Search by Location**
   - Use: `Ratehawk Hotels > Hotel Search > Search Hotels by Coordinates`
   - Update latitude/longitude for desired city
   - Set appropriate radius (km)
   - Adjust dates and guest counts

### Step 3: Hotel Information

#### 3.1 Get Hotel Details
1. **Select Hotel**
   - Use: `Ratehawk Hotels > Hotel Information > Get Hotel Details`
   - Update `hotel_id` with value from search results
   - Set language parameter

#### 3.2 Get Hotel Page with Rooms
1. **View Available Rooms**
   - Use: `Ratehawk Hotels > Hotel Information > Get Hotel Page with Rooms`
   - Update `hotel_id` with selected hotel
   - Set same dates as search
   - Set same guest counts
   - **Important**: Copy the `hash` value from response

#### 3.3 Get Hotel Reviews
1. **Check Reviews**
   - Use: `Ratehawk Hotels > Hotel Information > Get Hotel Reviews`
   - Update `hotel_id`
   - Set pagination parameters

### Step 4: Booking Flow

#### 4.1 Prebook Hotel
1. **Prebook for Pricing**
   - Use: `Ratehawk Hotels > Booking Flow > Prebook Hotel`
   - Update `hash` with value from hotel page response
   - **Important**: Copy the `book_hash` from response

#### 4.2 Create Booking Form
1. **Create Booking**
   - Use: `Ratehawk Hotels > Booking Flow > Create Booking Form`
   - Update `book_hash` with value from prebook response
   - Update user information (email, phone, names)
   - Set payment type (deposit/full amount)
   - **Important**: Copy the `partner_order_id` from response

#### 4.3 Finish Booking
1. **Complete Booking**
   - Use: `Ratehawk Hotels > Booking Flow > Finish Booking`
   - Update `partner_order_id` with value from create form response
   - Set payment method ID (Stripe payment method)
   - Update guest information for each room
   - Add any special requests

### Step 5: Booking Management

#### 5.1 Check Booking Status
1. **Monitor Status**
   - Use: `Ratehawk Hotels > Booking Management > Get Booking Status`
   - Update `partner_order_id` with your booking ID
   - Check current booking status

#### 5.2 View User Bookings
1. **List All Bookings**
   - Use: `Ratehawk Hotels > Booking Management > Get User Hotel Bookings`
   - Set pagination and filter parameters
   - View all hotel bookings for the user

#### 5.3 Cancel Booking (Optional)
1. **Cancel if Needed**
   - Use: `Ratehawk Hotels > Booking Management > Cancel Booking`
   - Update `partner_order_id`
   - Provide cancellation reason

### Step 6: Payment Integration Testing

#### 6.1 Create Payment Intent
1. **Setup Payment**
   - Use: `Payments > Create Payment Intent`
   - Update booking_id with your booking
   - Set amount and currency
   - Provide customer information

#### 6.2 Confirm Payment
1. **Process Payment**
   - Use: `Payments > Confirm Payment`
   - Update `payment_intent_id` with Stripe payment intent
   - Complete payment processing

### Step 7: Webhook Testing

#### 7.1 Test Booking Status Webhook
1. **Simulate Webhook**
   - Use: `Ratehawk Hotels > Webhooks > Booking Status Webhook`
   - Update `partner_order_id` with your booking
   - Set status: "confirmed", "cancelled", "failed", etc.
   - Add appropriate message and timestamp

#### 7.2 Test Booking Changes Webhook
1. **Simulate Changes**
   - Use: `Ratehawk Hotels > Webhooks > Booking Changes Webhook`
   - Update `partner_order_id`
   - Set change type and details
   - Test price changes, room changes, etc.

## 🔧 Testing Scenarios

### Scenario 1: Complete Successful Booking
1. Register/Login user
2. Search hotels by region
3. Get hotel details and rooms
4. Prebook hotel
5. Create booking form
6. Create payment intent
7. Confirm payment
8. Finish booking
9. Check booking status (should be "confirmed")

### Scenario 2: Booking Cancellation
1. Complete booking (steps 1-8 above)
2. Cancel booking
3. Check booking status (should be "cancelled")
4. Verify refund processing

### Scenario 3: Payment Failure
1. Complete booking up to payment
2. Use invalid payment method
3. Check booking status (should be "failed")
4. Test refund processing

### Scenario 4: Webhook Processing
1. Complete booking
2. Simulate webhook with different statuses
3. Verify status updates in system
4. Check database records

## 📊 Expected Response Formats

### Hotel Search Response
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "id": "12345",
        "name": "Hotel Example",
        "rating": 4.5,
        "price": 150.00,
        "currency": "USD",
        "images": [...],
        "amenities": [...]
      }
    ],
    "pagination": {...},
    "filters": {...}
  }
}
```

### Booking Creation Response
```json
{
  "success": true,
  "data": {
    "partner_order_id": "THB-ABC12345-1234567890",
    "status": "pending",
    "total_amount": 150.00,
    "currency": "USD",
    "payment_required": true
  }
}
```

### Webhook Response
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## 🚨 Common Issues & Solutions

### Issue 1: Invalid Region ID
**Solution**: Always use `Suggest Regions` first to get valid region IDs

### Issue 2: Booking Hash Not Found
**Solution**: Ensure you're using the hash from the most recent hotel page response

### Issue 3: Payment Method Not Found
**Solution**: Create a valid Stripe payment method first, or use test payment methods

### Issue 4: Authentication Token Expired
**Solution**: Re-login and update the `{{auth_token}}` variable

### Issue 5: Ratehawk API Errors
**Solution**: Check API credentials and ensure you're using valid test data

## 📝 Test Data Examples

### Valid Test Regions
- New York: `region_12345`
- London: `region_67890`
- Paris: `region_54321`

### Valid Test Hotels
- Hotel ID: `12345`
- Hotel ID: `67890`
- Hotel ID: `54321`

### Sample Guest Information
```json
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
```

## 🔍 Monitoring & Debugging

### Check Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Ratehawk API logs
grep "Ratehawk" storage/logs/laravel.log
```

### Database Verification
```sql
-- Check bookings
SELECT * FROM bookings WHERE user_id = 1;

-- Check Ratehawk orders
SELECT * FROM ratehawk_orders;

-- Check payments
SELECT * FROM payments WHERE booking_id = 1;
```

### API Response Validation
- Always check `success` field in responses
- Verify required fields are present
- Check error messages for debugging

## 🎯 Success Criteria

A successful test should demonstrate:
1. ✅ User can search and find hotels
2. ✅ Hotel details and rooms are displayed correctly
3. ✅ Prebooking returns valid pricing
4. ✅ Booking form creation succeeds
5. ✅ Payment processing works
6. ✅ Booking completion is successful
7. ✅ Status updates are tracked correctly
8. ✅ Webhooks are processed properly
9. ✅ Cancellation and refunds work
10. ✅ All data is stored correctly in database

## 📚 Additional Resources

- [Ratehawk API Documentation](https://docs.emergingtravel.com/docs/overview/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)

---

**Note**: This testing guide covers the complete Ratehawk integration flow. Make sure to test all scenarios thoroughly before deploying to production.
