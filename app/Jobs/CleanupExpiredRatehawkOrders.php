<?php

namespace App\Jobs;

use App\Models\RatehawkOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Cleanup Expired Ratehawk Orders Job
 * 
 * Background job to clean up expired hotel bookings
 */
class CleanupExpiredRatehawkOrders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $expiredOrders = RatehawkOrder::expired()
                ->whereIn('status', ['pending', 'processing'])
                ->get();

            $cleanedCount = 0;

            foreach ($expiredOrders as $order) {
                $order->update([
                    'status' => 'expired',
                    'status_message' => 'Booking expired - no payment completed within time limit'
                ]);

                $order->booking->update([
                    'status' => 'expired',
                    'cancelled_at' => now()
                ]);

                $cleanedCount++;
            }

            Log::info('Expired Ratehawk orders cleaned up', [
                'cleaned_count' => $cleanedCount,
                'total_checked' => $expiredOrders->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Error cleaning up expired Ratehawk orders', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
