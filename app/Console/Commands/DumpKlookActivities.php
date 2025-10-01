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
    protected $description = 'Dump Klook activities data into local database';

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
        $this->info('🚀 Starting Klook activities data dump...');
        
        $force = $this->option('force');
        $limit = (int) $this->option('limit');
        
        if ($force) {
            $this->info('🗑️  Clearing existing activities data...');
            Activity::truncate();
        }

        $totalFetched = 0;
        $page = 1;
        $hasMore = true;
        $batchSize = 100; // Klook API limit per page
        $maxPages = ceil($limit / $batchSize);

        $this->info("📊 Will fetch up to {$limit} activities (max {$maxPages} pages)");

        $progressBar = $this->output->createProgressBar($limit);
        $progressBar->start();

        while ($hasMore && $totalFetched < $limit && $page <= $maxPages) {
            try {
                $this->info("\n📡 Fetching page {$page}...");
                
                $response = $this->klookService->getActivities([
                    'page' => $page,
                    'limit' => min($batchSize, $limit - $totalFetched)
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

                $this->info("📦 Processing " . count($activities) . " activities...");

                // Process activities in batches for better performance
                $this->processActivitiesBatch($activities);

                $totalFetched += count($activities);
                $progressBar->setProgress($totalFetched);

                $this->info("✅ Page {$page} completed. Total: {$totalFetched}");

                $page++;

                // Add delay to respect API rate limits
                if ($hasMore && $totalFetched < $limit) {
                    $this->info("⏳ Waiting 1 second before next request...");
                    sleep(1);
                }

            } catch (\Exception $e) {
                $this->error("❌ Error on page {$page}: " . $e->getMessage());
                break;
            }
        }

        $progressBar->finish();
        $this->newLine();

        $this->info("🎉 Data dump completed!");
        $this->info("📊 Total activities dumped: {$totalFetched}");
        $this->info("💾 Database now contains " . Activity::count() . " activities");

        return Command::SUCCESS;
    }

    private function processActivitiesBatch($activities)
    {
        $batchData = [];

        foreach ($activities as $activity) {
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
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Use upsert to handle duplicates
        DB::table('activities')->upsert(
            $batchData,
            ['activity_id'], // Unique key
            ['title', 'sub_title', 'city_id', 'country_id', 'category_id', 'supported_languages', 'price', 'currency', 'vat_price', 'updated_at'] // Update these fields
        );
    }
}
