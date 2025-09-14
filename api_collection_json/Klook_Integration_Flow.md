# Complete Klook Integration Flow - How It Works

## 🎯 **The Complete Booking Flow**

### **Your Platform → Klook Integration**

```
Your User → Your Platform → Your Klook Account → Klook Website
```

---

## **📋 Step-by-Step Flow**

### **Phase 1: User Discovery (Your Platform)**
1. **User browses activities** on your platform
2. **Your platform calls Klook API** to get activities/categories
3. **User selects activity** and dates
4. **Your platform checks availability** via Klook API

### **Phase 2: Booking Creation (Your Platform)**
5. **User fills booking form** on your platform
6. **Your platform creates booking record** in your database
7. **User proceeds to payment** (Stripe or Klook balance)

### **Phase 3: Klook Order Placement (Your Klook Account)**
8. **Your platform creates order** on Klook using YOUR account
9. **Klook processes the order** under your account
10. **Your platform receives confirmation** from Klook
11. **Booking is confirmed** on both platforms

### **Phase 4: Order Management (Your Platform)**
12. **User receives confirmation** from your platform
13. **Vouchers are sent** to user's email
14. **Order management** through your platform

---

## **🔧 Technical Implementation**

### **How Your Platform Places Orders on Klook:**

#### **1. Order Creation Process**
```php
// In BookingController::completeBooking()
public function completeBooking(Request $request, $id): JsonResponse
{
    // ... validation ...
    
    if ($request->payment_method === 'klook_balance') {
        // Create order with Klook using YOUR account
        $orderData = [
            'agent_order_id' => 'ORD_' . time() . '_' . $booking->id,
            'contact_info' => $booking->customer_info, // User's info
            'items' => $booking->booking_details['items']
        ];
        
        // This calls Klook API using YOUR credentials
        $klookResult = $this->klookService->createOrder($orderData);
        
        if ($klookResult['success']) {
            $orderNo = $klookResult['data']['order_no'];
            
            // Pay with YOUR Klook balance
            $payResult = $this->klookService->payWithBalance($orderNo);
            
            // Update booking with Klook order number
            $booking->update([
                'external_booking_id' => $orderNo,
                'status' => 'confirmed'
            ]);
        }
    }
}
```

#### **2. Klook Service Implementation**
```php
// In KlookApiService::createOrder()
public function createOrder(array $orderData): array
{
    $response = $this->httpClient->post('/v3/orders', [
        'headers' => [
            'X-API-KEY' => config('klook.api_key'), // YOUR Klook API key
            'Accept-Language' => config('klook.language')
        ],
        'json' => $orderData
    ]);
    
    return $response->json();
}
```

---

## **💰 Payment Flow Options**

### **Option 1: Stripe Payment (Recommended)**
```
User → Your Platform → Stripe → Your Platform → Klook (using your balance)
```

1. **User pays via Stripe** on your platform
2. **Your platform receives payment**
3. **Your platform places order** on Klook using your account
4. **Klook charges your account** (not the user)

### **Option 2: Direct Klook Balance**
```
User → Your Platform → Klook (using your balance)
```

1. **User selects Klook balance** payment
2. **Your platform places order** directly on Klook
3. **Klook charges your account** balance

---

## **📊 Account Management**

### **Your Klook Account Setup:**
- **API Key**: `Y3nhQkK5nP2f6y0k7blt0fJWu9Xw3WDG` (sandbox)
- **Account Balance**: You need to maintain balance
- **Order Management**: All orders appear under your account
- **Commission**: You handle pricing/markup

### **User Experience:**
- **User books on your platform**
- **User pays you** (via Stripe or your pricing)
- **You place order on Klook** using your account
- **User receives Klook vouchers** directly

---

## **🔄 Complete API Flow Example**

### **Step 1: User Creates Booking**
```http
POST /api/bookings
{
    "activity_external_id": "19",
    "activity_name": "Universal Studios Singapore",
    "total_price": 150.00,
    "customer_info": {
        "email": "user@example.com",
        "first_name": "John",
        "family_name": "Doe"
    }
}
```

### **Step 2: Complete Booking with Payment**
```http
POST /api/bookings/1/complete
{
    "payment_method": "stripe",
    "payment_data": {
        "billing_address": "123 Main St"
    }
}
```

### **Step 3: Your Platform Places Klook Order**
```php
// Internally, your platform calls:
$klookOrder = $klookService->createOrder([
    'agent_order_id' => 'ORD_1234567890_1',
    'contact_info' => [
        'email' => 'user@example.com',
        'first_name' => 'John',
        'family_name' => 'Doe'
    ],
    'items' => [
        [
            'package_id' => 91249,
            'start_time' => '2025-09-20 10:00:00',
            'sku_list' => [
                [
                    'sku_id' => 822428069529,
                    'count' => 2
                ]
            ]
        ]
    ]
]);
```

### **Step 4: Klook Response**
```json
{
    "success": true,
    "data": {
        "order_no": "ORD_KLK_1234567890",
        "status": "confirmed",
        "total_amount": "150.00"
    }
}
```

### **Step 5: Update Your Booking**
```php
$booking->update([
    'external_booking_id' => 'ORD_KLK_1234567890',
    'status' => 'confirmed',
    'confirmed_at' => now()
]);
```

---

## **📧 Voucher Management**

### **How Vouchers Work:**
1. **Klook sends vouchers** to the email provided in `contact_info`
2. **User receives vouchers** directly from Klook
3. **Your platform tracks** the order status
4. **User can resend vouchers** through your platform

### **Voucher Resend:**
```http
POST /api/klook/orders/ORD_KLK_1234567890/resend-voucher
```

---

## **💡 Key Benefits of This Approach**

### **For You:**
- ✅ **Control over pricing** (add markup)
- ✅ **User data ownership**
- ✅ **Branded experience**
- ✅ **Multiple payment options**
- ✅ **Commission management**

### **For Users:**
- ✅ **Seamless booking experience**
- ✅ **Familiar payment methods**
- ✅ **Direct voucher delivery**
- ✅ **Order management through your platform**

---

## **🔧 Configuration Required**

### **Your Klook Account:**
```env
KLOOK_API_KEY=Y3nhQkK5nP2f6y0k7blt0fJWu9Xw3WDG
KLOOK_BASE_URL=https://sandbox-api.klktech.com/v3
KLOOK_LANGUAGE=en_US
```

### **Your Platform:**
- Maintain Klook account balance
- Handle order management
- Process payments
- Manage customer service

---

## **📋 Testing the Complete Flow**

### **Test Scenario:**
1. **User registers** on your platform
2. **User browses activities** (via Klook API)
3. **User creates booking** on your platform
4. **User pays via Stripe** on your platform
5. **Your platform places order** on Klook
6. **Klook confirms order** under your account
7. **User receives vouchers** from Klook
8. **User manages booking** through your platform

This is the **complete white-label solution** where users book through your platform, but the actual Klook orders are placed using your account! 🎯
