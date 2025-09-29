<?php

namespace App\Jobs;

use App\Services\RatehawkService;
use App\Models\HotelCache;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Sync Ratehawk Hotel Data Job
 * 
 * Background job to sync hotel data from Ratehawk API
 */
class SyncRatehawkHotelData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $hotelId,
        public string $language = 'en'
    ) {}

    /**
     * Execute the job.
     */
    public function handle(RatehawkService $ratehawkService): void
    {
        try {
            // Get hotel information from Ratehawk
            $result = $ratehawkService->getHotelInfo($this->hotelId, $this->language);

            if ($result['success']) {
                // Cache the hotel data
                $cacheKey = "hotel_info_{$this->hotelId}_{$this->language}";
                HotelCache::put($cacheKey, $result['data'], config('ratehawk.hotel_details_cache_ttl', 7200));

                Log::info('Hotel data synced successfully', [
                    'hotel_id' => $this->hotelId,
                    'language' => $this->language
                ]);
            } else {
                Log::warning('Failed to sync hotel data', [
                    'hotel_id' => $this->hotelId,
                    'language' => $this->language,
                    'error' => $result['error']
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error syncing hotel data', [
                'hotel_id' => $this->hotelId,
                'language' => $this->language,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
