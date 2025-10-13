<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class CountKlookActivitiesLive extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'klook:count-live {--limit=100 : Activities per page}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Count total activities from live API endpoint by paginating through all pages';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Counting activities from live API endpoint...');
        
        $totalCount = 0;
        $page = 1;
        $hasMore = true;
        $batchSize = (int) $this->option('limit');
        $apiTotal = 0;
        $baseUrl = 'https://api.adeptuscertification.co.uk/api/klook/activities';
        
        $client = new Client([
            'timeout' => 30,
            'verify' => false
        ]);
        
        $this->info("📊 Fetching {$batchSize} activities per page from: {$baseUrl}");
        
        $progressBar = $this->output->createProgressBar();
        $progressBar->start();
        
        while ($hasMore) {
            try {
                $this->info("\n📄 Fetching page {$page}...");
                
                $response = $client->get($baseUrl, [
                    'query' => [
                        'page' => $page,
                        'limit' => $batchSize
                    ]
                ]);
                
                $data = json_decode($response->getBody(), true);
                
                if (!$data['success']) {
                    $this->error("❌ API Error: " . ($data['message'] ?? 'Unknown error'));
                    break;
                }
                
                $activities = $data['data']['activity']['activity_list'] ?? [];
                $hasMore = $data['data']['activity']['has_next'] ?? false;
                $apiTotal = $data['data']['activity']['total'] ?? 0;
                
                $pageCount = count($activities);
                $totalCount += $pageCount;
                
                $this->info("✅ Page {$page}: {$pageCount} activities (Total so far: {$totalCount})");
                
                if ($page === 1) {
                    $this->info("📊 API reports total available: {$apiTotal}");
                }
                
                $progressBar->advance();
                $page++;
                
                // Small delay to avoid overwhelming the server
                sleep(0.5);
                
                // Safety check to prevent infinite loops
                if ($page > 1000) {
                    $this->warn("⚠️  Safety limit reached (1000 pages). Stopping.");
                    break;
                }
                
            } catch (\Exception $e) {
                $this->error("❌ Error on page {$page}: " . $e->getMessage());
                Log::error('Live API Count Error: ' . $e->getMessage());
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

