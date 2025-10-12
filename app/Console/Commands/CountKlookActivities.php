<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Klook\KlookApiService;
use Illuminate\Support\Facades\Log;

class CountKlookActivities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'klook:count-activities {--limit=100 : Activities per page}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Count total activities available from Klook API by paginating through all pages';

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
        $this->info('🔍 Counting activities from Klook API...');
        
        $totalCount = 0;
        $page = 1;
        $hasMore = true;
        $batchSize = (int) $this->option('limit');
        $maxPages = 0;
        $apiTotal = 0;
        
        $this->info("📊 Fetching {$batchSize} activities per page...");
        
        $progressBar = $this->output->createProgressBar();
        $progressBar->start();
        
        while ($hasMore) {
            try {
                $this->info("\n📄 Fetching page {$page}...");
                
                $response = $this->klookService->getActivities([
                    'page' => $page,
                    'limit' => $batchSize
                ]);
                
                if (!$response['success']) {
                    $this->error("❌ API Error: " . ($response['message'] ?? 'Unknown error'));
                    break;
                }
                
                $activities = $response['activity']['activity_list'] ?? [];
                $hasMore = $response['activity']['has_next'] ?? false;
                $apiTotal = $response['activity']['total'] ?? 0;
                
                $pageCount = count($activities);
                $totalCount += $pageCount;
                
                $this->info("✅ Page {$page}: {$pageCount} activities (Total so far: {$totalCount})");
                
                if ($page === 1) {
                    $this->info("📊 API reports total available: {$apiTotal}");
                    $maxPages = ceil($apiTotal / $batchSize);
                    $this->info("📄 Expected pages: {$maxPages}");
                }
                
                $progressBar->advance();
                $page++;
                
                // Small delay to avoid rate limiting
                sleep(1);
                
                // Safety check to prevent infinite loops
                if ($page > 1000) {
                    $this->warn("⚠️  Safety limit reached (1000 pages). Stopping.");
                    break;
                }
                
            } catch (\Exception $e) {
                $this->error("❌ Error on page {$page}: " . $e->getMessage());
                Log::error('Klook API Count Error: ' . $e->getMessage());
                break;
            }
        }
        
        $progressBar->finish();
        $this->newLine();
        
        $this->info("🎉 Final Results:");
        $this->info("📊 Total activities counted: {$totalCount}");
        $this->info("📊 API reported total: {$apiTotal}");
        $this->info("📄 Pages processed: " . ($page - 1));
        
        if ($totalCount !== $apiTotal) {
            $this->warn("⚠️  Count mismatch! API says {$apiTotal} but we counted {$totalCount}");
        } else {
            $this->info("✅ Count matches API total!");
        }
        
        return 0;
    }
}

