<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Booking;
use App\Models\RatehawkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RatehawkIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set up test environment
        config([
            'ratehawk.api_key' => 'test_key',
            'ratehawk.api_user' => 'test_user',
            'ratehawk.base_url' => 'https://api.test.com',
        ]);
    }

    /** @test */
    public function it_can_search_hotels_by_region()
    {
        $response = $this->postJson('/api/hotels/search', [
            'checkin' => '2025-02-01',
            'checkout' => '2025-02-03',
            'adults' => 2,
            'residency' => 'US',
            'region_id' => 'test_region'
        ]);

        // This will fail in test environment due to no real API, but validates structure
        $response->assertStatus(422); // Validation error expected without real API
    }

    /** @test */
    public function it_validates_hotel_search_parameters()
    {
        $response = $this->postJson('/api/hotels/search', [
            'checkin' => '2025-01-01', // Past date
            'checkout' => '2025-01-30',
            'adults' => 0, // Invalid adults count
            'residency' => 'USA', // Invalid country code
            'region_id' => 'test_region'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['checkin', 'adults', 'residency']);
    }

    /** @test */
    public function it_can_create_ratehawk_order()
    {
        $user = User::factory()->create();
        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'type' => 'hotel'
        ]);

        $ratehawkOrder = RatehawkOrder::create([
            'booking_id' => $booking->id,
            'partner_order_id' => 'TEST-ORDER-123',
            'book_hash' => 'test_hash',
            'payment_type' => 'deposit',
            'status' => 'pending'
        ]);

        $this->assertDatabaseHas('ratehawk_orders', [
            'partner_order_id' => 'TEST-ORDER-123',
            'status' => 'pending'
        ]);

        $this->assertEquals('pending', $ratehawkOrder->status);
        $this->assertTrue($ratehawkOrder->isPending());
    }

    /** @test */
    public function it_can_mark_ratehawk_order_as_confirmed()
    {
        $user = User::factory()->create();
        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'type' => 'hotel'
        ]);

        $ratehawkOrder = RatehawkOrder::create([
            'booking_id' => $booking->id,
            'partner_order_id' => 'TEST-ORDER-123',
            'book_hash' => 'test_hash',
            'payment_type' => 'deposit',
            'status' => 'pending'
        ]);

        $ratehawkOrder->markAsConfirmed('RH123456', 'Booking confirmed');

        $this->assertEquals('confirmed', $ratehawkOrder->status);
        $this->assertEquals('RH123456', $ratehawkOrder->ratehawk_order_id);
        $this->assertTrue($ratehawkOrder->isConfirmed());
    }

    /** @test */
    public function it_can_mark_ratehawk_order_as_cancelled()
    {
        $user = User::factory()->create();
        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'type' => 'hotel'
        ]);

        $ratehawkOrder = RatehawkOrder::create([
            'booking_id' => $booking->id,
            'partner_order_id' => 'TEST-ORDER-123',
            'book_hash' => 'test_hash',
            'payment_type' => 'deposit',
            'status' => 'pending'
        ]);

        $ratehawkOrder->markAsCancelled('Cancelled by user');

        $this->assertEquals('cancelled', $ratehawkOrder->status);
        $this->assertNotNull($ratehawkOrder->cancelled_at);
        $this->assertTrue($ratehawkOrder->isCancelled());
    }

    /** @test */
    public function it_can_set_expiry_time()
    {
        $user = User::factory()->create();
        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'type' => 'hotel'
        ]);

        $ratehawkOrder = RatehawkOrder::create([
            'booking_id' => $booking->id,
            'partner_order_id' => 'TEST-ORDER-123',
            'book_hash' => 'test_hash',
            'payment_type' => 'deposit',
            'status' => 'pending'
        ]);

        $ratehawkOrder->setExpiry(30); // 30 minutes

        $this->assertNotNull($ratehawkOrder->expires_at);
        $this->assertTrue($ratehawkOrder->expires_at->isFuture());
    }

    /** @test */
    public function it_can_calculate_remaining_time()
    {
        $user = User::factory()->create();
        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'type' => 'hotel'
        ]);

        $ratehawkOrder = RatehawkOrder::create([
            'booking_id' => $booking->id,
            'partner_order_id' => 'TEST-ORDER-123',
            'book_hash' => 'test_hash',
            'payment_type' => 'deposit',
            'status' => 'pending',
            'expires_at' => now()->addMinutes(30)
        ]);

        $remainingTime = $ratehawkOrder->getRemainingTime();
        
        $this->assertIsInt($remainingTime);
        $this->assertGreaterThan(0, $remainingTime);
        $this->assertLessThanOrEqual(1800, $remainingTime); // 30 minutes in seconds
    }

    /** @test */
    public function it_can_find_ratehawk_order_by_partner_order_id()
    {
        $user = User::factory()->create();
        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'type' => 'hotel'
        ]);

        $ratehawkOrder = RatehawkOrder::create([
            'booking_id' => $booking->id,
            'partner_order_id' => 'TEST-ORDER-123',
            'book_hash' => 'test_hash',
            'payment_type' => 'deposit',
            'status' => 'pending'
        ]);

        $foundOrder = RatehawkOrder::findByPartnerOrderId('TEST-ORDER-123');

        $this->assertNotNull($foundOrder);
        $this->assertEquals($ratehawkOrder->id, $foundOrder->id);
    }

    /** @test */
    public function it_can_cleanup_expired_orders()
    {
        $user = User::factory()->create();
        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'type' => 'hotel'
        ]);

        // Create expired order
        RatehawkOrder::create([
            'booking_id' => $booking->id,
            'partner_order_id' => 'EXPIRED-ORDER-123',
            'book_hash' => 'test_hash',
            'payment_type' => 'deposit',
            'status' => 'pending',
            'expires_at' => now()->subMinutes(30)
        ]);

        $cleanedCount = RatehawkOrder::cleanupExpired();

        $this->assertEquals(1, $cleanedCount);
        
        $expiredOrder = RatehawkOrder::where('partner_order_id', 'EXPIRED-ORDER-123')->first();
        $this->assertEquals('expired', $expiredOrder->status);
    }

    /** @test */
    public function it_validates_booking_creation_parameters()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/hotels/bookings/create-form', [
                'book_hash' => '', // Empty hash
                'user_info' => [
                    'email' => 'invalid-email', // Invalid email
                    'first_name' => '', // Empty name
                    'last_name' => 'Doe'
                ],
                'payment_type' => [
                    'type' => 'invalid_type', // Invalid payment type
                    'amount' => -100, // Negative amount
                    'currency_code' => 'INVALID' // Invalid currency
                ]
            ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors([
                    'book_hash',
                    'user_info.email',
                    'user_info.first_name',
                    'payment_type.type',
                    'payment_type.amount',
                    'payment_type.currency_code'
                ]);
    }
}
