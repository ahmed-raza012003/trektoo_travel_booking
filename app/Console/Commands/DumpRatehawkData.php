<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\RatehawkService;
use Illuminate\Support\Facades\Log;

class DumpRatehawkData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ratehawk:dump {--type=all : Type of data to dump (regions, hotels, all)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dump data from Ratehawk API into local database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->option('type');
        
        try {
            $ratehawkService = new RatehawkService();
            
            // Test API connection first
            $this->info('Testing Ratehawk API connection...');
            $connectionTest = $ratehawkService->testConnection();
            
            if (!isset($connectionTest['success']) || !$connectionTest['success']) {
                $this->error('Failed to connect to Ratehawk API: ' . ($connectionTest['error'] ?? 'Unknown error'));
                return 1;
            }
            
            $this->info('✅ API connection successful');
            
            if ($type === 'all' || $type === 'regions') {
                $this->dumpRegions($ratehawkService);
            }
            
            if ($type === 'all' || $type === 'hotels') {
                $this->dumpHotels($ratehawkService);
            }
            
            $this->info('✅ Data dump completed successfully');
            
        } catch (\Exception $e) {
            $this->error('Error dumping data: ' . $e->getMessage());
            Log::error('Ratehawk data dump failed', ['error' => $e->getMessage()]);
            return 1;
        }
        
        return 0;
    }
    
    private function dumpRegions(RatehawkService $ratehawkService)
    {
        $this->info('Dumping regions data...');
        
        $result = $ratehawkService->getRegionsDump();
        
        if (isset($result['status']) && $result['status'] === 'ok') {
            $regionsCount = count($result['data'] ?? []);
            $this->info("✅ Dumped {$regionsCount} regions");
        } elseif (isset($result['success']) && $result['success']) {
            $regionsCount = count($result['data'] ?? []);
            $this->info("✅ Dumped {$regionsCount} regions");
        } else {
            $this->error('Failed to get regions dump: ' . ($result['error'] ?? 'Unknown error'));
            return;
        }
    }
    
    private function dumpHotels(RatehawkService $ratehawkService)
    {
        $this->info('Dumping hotels data...');
        
        // Get some sample regions first
        $regions = \DB::table('ratehawk_regions')->limit(5)->get();
        
        if ($regions->isEmpty()) {
            $this->warn('No regions found. Please run regions dump first.');
            return;
        }
        
        $totalHotels = 0;
        
        foreach ($regions as $region) {
            $this->info("Searching hotels in region: {$region->name}");
            
            // Search for hotels in this region
            $searchParams = [
                'checkin' => now()->addDays(1)->format('Y-m-d'),
                'checkout' => now()->addDays(3)->format('Y-m-d'),
                'adults' => 2,
                'children' => [],
                'residency' => 'US',
                'region_id' => $region->id,
                'language' => 'en',
                'currency' => 'USD',
                'hotels_limit' => 50
            ];
            
            $result = $ratehawkService->searchHotelsByRegion($searchParams);
            
            if ((isset($result['status']) && $result['status'] === 'ok') || (isset($result['success']) && $result['success'])) {
                if (isset($result['data']['hotels'])) {
                    $hotelsCount = count($result['data']['hotels']);
                    $totalHotels += $hotelsCount;
                    $this->info("  Found {$hotelsCount} hotels");
                } else {
                    $this->warn("  No hotels found in response");
                }
            } else {
                $this->warn("  No hotels found or error: " . ($result['error'] ?? 'Unknown error'));
            }
        }
        
        $this->info("✅ Dumped {$totalHotels} hotels total");
    }
}