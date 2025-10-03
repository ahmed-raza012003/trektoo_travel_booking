<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Activity;
use App\Services\Klook\KlookApiService;
use Illuminate\Support\Facades\DB;

class DumpKlookActivities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'klook:dump-activities {--force : Force refresh all data} {--limit=1000 : Maximum activities to fetch per run}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dump Klook activities data into local database with images and country info';

    protected $klookService;

    public function __construct(KlookApiService $klookService)
    {
        parent::__construct();
        $this->klookService = $klookService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $environment = app()->environment();
        $force = $this->option('force');
        $limit = (int) $this->option('limit');
        
        // Environment-specific configuration
        $config = $this->getEnvironmentConfig($environment, $limit);
        
        $this->info("🚀 Starting Klook activities data dump for {$environment} environment...");
        $this->info("📊 Environment: {$environment}");
        $this->info("📈 Limit: {$config['limit']} activities");
        $this->info("⏰ Frequency: {$config['frequency']}");
        $this->info("💡 Description: {$config['description']}");
        $this->info("🎨 Features: Images + Country Names extraction enabled");
        
        if ($force) {
            $this->info('🗑️  Clearing existing activities data...');
            Activity::truncate();
        }

        $totalFetched = 0;
        $page = 1;
        $hasMore = true;
        $batchSize = 100; // Klook API limit per page
        $maxPages = ceil($config['limit'] / $batchSize);

        $this->info("📊 Will fetch up to {$config['limit']} activities (max {$maxPages} pages)");

        $progressBar = $this->output->createProgressBar($config['limit']);
        $progressBar->start();

        while ($hasMore && $totalFetched < $config['limit'] && $page <= $maxPages) {
            try {
                $this->info("\n📡 Fetching page {$page}...");
                
                $response = $this->klookService->getActivities([
                    'page' => $page,
                    'limit' => min($batchSize, $config['limit'] - $totalFetched)
                ]);

                if (!$response['success']) {
                    $this->error("❌ Failed to fetch page {$page}: " . $response['message']);
                    break;
                }

                $activities = $response['activity']['activity_list'] ?? [];
                $hasMore = $response['activity']['has_next'] ?? false;

                if (empty($activities)) {
                    $this->warn("⚠️  No activities found on page {$page}");
                    break;
                }

                $this->info("📦 Processing " . count($activities) . " activities (extracting images & countries)...");

                // Process activities with individual detail fetching for images
                $this->processActivitiesWithDetails($activities);

                $totalFetched += count($activities);
                $progressBar->setProgress($totalFetched);

                $this->info("✅ Page {$page} completed. Total: {$totalFetched}");

                $page++;

                // Environment-specific delay
                if ($hasMore && $totalFetched < $config['limit']) {
                    $this->info("⏳ Waiting {$config['delay']} seconds before next request...");
                    sleep($config['delay']);
                }

            } catch (\Exception $e) {
                $this->error("❌ Error on page {$page}: " . $e->getMessage());
                break;
            }
        }

        $progressBar->finish();
        $this->newLine();

        $this->info("🎉 Data dump completed for {$environment} environment!");
        $this->info("📊 Total activities dumped: {$totalFetched}");
        $this->info("💾 Database now contains " . Activity::count() . " activities");
        $this->info("🎨 All activities include images and country information");

        return self::SUCCESS;
    }

    private function getEnvironmentConfig($environment, $requestedLimit)
    {
        $configs = [
            'local' => [
                'limit' => min($requestedLimit, 5000),
                'frequency' => 'Every 2 hours',
                'delay' => 1,
                'description' => 'Development environment - smaller dataset for faster testing'
            ],
            'development' => [
                'limit' => min($requestedLimit, 5000),
                'frequency' => 'Every 2 hours',
                'delay' => 1,
                'description' => 'Development environment - smaller dataset for faster testing'
            ],
            'staging' => [
                'limit' => min($requestedLimit, 10000),
                'frequency' => 'Every 4 hours',
                'delay' => 1,
                'description' => 'Staging environment - medium dataset for testing'
            ],
            'production' => [
                'limit' => min($requestedLimit, 50000),
                'frequency' => 'Every 6 hours',
                'delay' => 2,
                'description' => 'Production environment - full dataset for live users'
            ]
        ];

        return $configs[$environment] ?? $configs['local'];
    }

    private function processActivitiesWithDetails($activities)
    {
        $batchData = [];

        foreach ($activities as $index => $activity) {
            $this->info("🔍 Fetching details for activity {$activity['activity_id']} (" . ($index + 1) . "/" . count($activities) . ")");
            
            // Fetch detailed activity data for images
            $detailedActivity = $this->fetchActivityDetails($activity['activity_id']);
            
            // Merge basic activity data with detailed data
            $fullActivityData = array_merge($activity, $detailedActivity);
            
            // Extract image and country data
            $imageData = $this->extractImageData($fullActivityData);
            $countryData = $this->extractCountryData($fullActivityData);
            
            $batchData[] = [
                'activity_id' => $activity['activity_id'],
                'title' => $activity['title'],
                'sub_title' => $activity['sub_title'] ?? null,
                'city_id' => $activity['city_id'],
                'country_id' => $activity['country_id'],
                'category_id' => $activity['category_id'],
                'supported_languages' => json_encode($activity['supported_languages'] ?? []),
                'price' => $activity['price'] ?? null,
                'currency' => $activity['currency'] ?? null,
                'vat_price' => $activity['vat_price'] ?? null,
                
                // New image fields
                'primary_image_url' => $imageData['primary_image'],
                'image_alt_text' => $imageData['alt_text'],
                'all_images' => $imageData['all_images'],
                
                // New country fields
                'country_name' => $countryData['country_name'],
                'city_name' => $countryData['city_name'],
                'location_display' => $countryData['location_display'],
                
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            // Small delay to avoid rate limiting
            usleep(100000); // 0.1 second
        }

        // Use upsert to handle duplicates
        DB::table('activities')->upsert(
            $batchData,
            ['activity_id'], // Unique key
            ['title', 'sub_title', 'city_id', 'country_id', 'category_id', 'supported_languages', 'price', 'currency', 'vat_price', 'primary_image_url', 'image_alt_text', 'all_images', 'country_name', 'city_name', 'location_display', 'updated_at'] // Update these fields
        );
    }

    private function processActivitiesBatch($activities)
    {
        $batchData = [];

        foreach ($activities as $activity) {
            // Extract image and country data
            $imageData = $this->extractImageData($activity);
            $countryData = $this->extractCountryData($activity);
            
            $batchData[] = [
                'activity_id' => $activity['activity_id'],
                'title' => $activity['title'],
                'sub_title' => $activity['sub_title'] ?? null,
                'city_id' => $activity['city_id'],
                'country_id' => $activity['country_id'],
                'category_id' => $activity['category_id'],
                'supported_languages' => json_encode($activity['supported_languages'] ?? []),
                'price' => $activity['price'] ?? null,
                'currency' => $activity['currency'] ?? null,
                'vat_price' => $activity['vat_price'] ?? null,
                
                // New image fields
                'primary_image_url' => $imageData['primary_image'],
                'image_alt_text' => $imageData['alt_text'],
                'all_images' => $imageData['all_images'],
                
                // New country fields
                'country_name' => $countryData['country_name'],
                'city_name' => $countryData['city_name'],
                'location_display' => $countryData['location_display'],
                
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Use upsert to handle duplicates
        DB::table('activities')->upsert(
            $batchData,
            ['activity_id'], // Unique key
            ['title', 'sub_title', 'city_id', 'country_id', 'category_id', 'supported_languages', 'price', 'currency', 'vat_price', 'primary_image_url', 'image_alt_text', 'all_images', 'country_name', 'city_name', 'location_display', 'updated_at'] // Update these fields
        );
    }

    /**
     * Fetch detailed activity data including images
     */
    private function fetchActivityDetails($activityId)
    {
        try {
            $response = $this->klookService->getActivityDetail($activityId);
            
            
            if ($response['success'] && isset($response['activity'])) {
                return $response['activity'];
            }
            
            if ($response['success'] && isset($response['data']['activity'])) {
                return $response['data']['activity'];
            }
            
            $this->warn("⚠️  Unexpected response structure for activity {$activityId}");
            return [];
        } catch (\Exception $e) {
            $this->warn("⚠️  Failed to fetch details for activity {$activityId}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Extract image data from activity
     */
    private function extractImageData($activity)
    {
        $images = $activity['images'] ?? [];
        $primaryImage = null;
        $altText = $activity['title'] ?? 'Activity Image';
        $allImages = [];

        if (!empty($images) && is_array($images)) {
            // Find the best image (prefer landscape, high quality)
            $bestImage = $this->findBestImage($images);
            if ($bestImage) {
                $primaryImage = $bestImage['image_url_host'] ?? null;
                $altText = $bestImage['image_alt'] ?? $activity['title'] ?? 'Activity Image';
            }
            
            // Store all images as JSON
            $allImages = array_map(function($img) {
                return [
                    'url' => $img['image_url_host'] ?? null,
                    'alt_text' => $img['image_alt'] ?? null,
                    'width' => $img['width'] ?? null,
                    'height' => $img['height'] ?? null,
                    'description' => $img['image_desc'] ?? null,
                ];
            }, $images);
        }

        return [
            'primary_image' => $primaryImage,
            'alt_text' => $altText,
            'all_images' => json_encode($allImages)
        ];
    }

    /**
     * Extract country and location data from activity
     */
    private function extractCountryData($activity)
    {
        $countryName = null;
        $cityName = null;
        $locationDisplay = null;

        // Try to get from city_info if available
        if (isset($activity['city_info']) && is_array($activity['city_info']) && !empty($activity['city_info'])) {
            $cityInfo = $activity['city_info'][0];
            $countryName = $cityInfo['country_name'] ?? null;
            $cityName = $cityInfo['city_name'] ?? null;
        }

        // Fallback to location field
        if (!$countryName && isset($activity['location'])) {
            $locationDisplay = $activity['location'];
            // Try to extract country from location string
            $countryName = $this->extractCountryFromLocation($activity['location']);
        }

        // Create location display string
        if ($cityName && $countryName) {
            $locationDisplay = "{$cityName}, {$countryName}";
        } elseif ($countryName) {
            $locationDisplay = $countryName;
        } elseif (isset($activity['location'])) {
            $locationDisplay = $activity['location'];
        }

        return [
            'country_name' => $countryName,
            'city_name' => $cityName,
            'location_display' => $locationDisplay
        ];
    }

    /**
     * Find the best image from available images
     */
    private function findBestImage($images)
    {
        if (empty($images)) {
            return null;
        }

        // Sort by preference: landscape > square > portrait, then by size
        usort($images, function($a, $b) {
            $aWidth = $a['width'] ?? 0;
            $aHeight = $a['height'] ?? 0;
            $bWidth = $b['width'] ?? 0;
            $bHeight = $b['height'] ?? 0;
            
            $aRatio = $aWidth / max($aHeight, 1);
            $bRatio = $bWidth / max($bHeight, 1);
            
            // Prefer landscape images (ratio > 1.2)
            if ($aRatio > 1.2 && $bRatio <= 1.2) return -1;
            if ($bRatio > 1.2 && $aRatio <= 1.2) return 1;
            
            // Then prefer larger images
            $aSize = $aWidth * $aHeight;
            $bSize = $bWidth * $bHeight;
            
            return $bSize - $aSize;
        });

        return $images[0];
    }

    /**
     * Extract country name from location string
     */
    private function extractCountryFromLocation($location)
    {
        $location = strtolower($location);
        
        $countryMap = [
            'hong kong' => 'Hong Kong',
            'singapore' => 'Singapore',
            'tokyo' => 'Japan',
            'japan' => 'Japan',
            'bangkok' => 'Thailand',
            'thailand' => 'Thailand',
            'kuala lumpur' => 'Malaysia',
            'malaysia' => 'Malaysia',
            'jakarta' => 'Indonesia',
            'indonesia' => 'Indonesia',
            'manila' => 'Philippines',
            'philippines' => 'Philippines',
            'seoul' => 'South Korea',
            'korea' => 'South Korea',
            'taipei' => 'Taiwan',
            'taiwan' => 'Taiwan',
            'vietnam' => 'Vietnam',
            'ho chi minh' => 'Vietnam',
        ];

        foreach ($countryMap as $keyword => $country) {
            if (strpos($location, $keyword) !== false) {
                return $country;
            }
        }

        return null;
    }
}
