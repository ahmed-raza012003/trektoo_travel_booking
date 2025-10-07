<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\RatehawkService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use GuzzleHttp\Client;
use Exception;

class DumpRatehawkData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ratehawk:dump 
                            {--type=all : Type of data to dump (regions, hotels, all)}
                            {--method=streaming : Download method (guzzle, curl, streaming)}
                            {--limit=0 : Limit number of records (0 = no limit)}
                            {--resume : Resume from where it left off}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Comprehensive Ratehawk data dump with multiple methods and weekly scheduling';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->option('type');
        $method = $this->option('method');
        $limit = (int) $this->option('limit');
        $resume = $this->option('resume');
        
        // Start timing
        $startTime = microtime(true);
        $startDateTime = date('Y-m-d H:i:s');
        
        $this->info('');
        $this->info('================================================');
        $this->info('   RATEHAWK COMPREHENSIVE DATA DUMP');
        $this->info('================================================');
        $this->info("🚀 Started at: {$startDateTime}");
        $this->info("⏱️  Process ID: " . getmypid());
        $this->info("📊 Type: {$type} | Method: {$method}" . ($limit > 0 ? " | Limit: {$limit}" : ''));
        $this->info('');
        
        try {
            if ($type === 'all' || $type === 'regions') {
                $this->dumpRegions($limit);
            }
            
            if ($type === 'all' || $type === 'hotels') {
                $this->dumpHotels($method, $limit, $resume);
            }
            
            $endTime = microtime(true);
            $totalDuration = round($endTime - $startTime, 2);
            $endDateTime = date('Y-m-d H:i:s');
            
            $this->info('');
            $this->info('✅ COMPLETED!');
            $this->info('');
            $this->info('📊 FINAL STATISTICS:');
            $this->info("  🕐 Total execution time: {$totalDuration}s");
            $this->info("  📅 Started: {$startDateTime}");
            $this->info("  📅 Finished: {$endDateTime}");
            $this->info('');
            $this->info('================================================');
            $this->info('   DATA DUMP SUCCESSFUL');
            $this->info('================================================');
            
        } catch (\Exception $e) {
            $endTime = microtime(true);
            $totalDuration = round($endTime - $startTime, 2);
            $endDateTime = date('Y-m-d H:i:s');
            
            $this->error('');
            $this->error('❌ ERROR: ' . $e->getMessage());
            $this->error('');
            $this->error('📊 FAILURE STATISTICS:');
            $this->error("  ⏱️  Failed after: {$totalDuration}s");
            $this->error("  📅 Started: {$startDateTime}");
            $this->error("  📅 Failed at: {$endDateTime}");
            $this->error('');
            $this->error('================================================');
            $this->error('   DATA DUMP FAILED');
            $this->error('================================================');
            
            Log::error('Ratehawk data dump failed', ['error' => $e->getMessage()]);
            return 1;
        }
        
        return 0;
    }
    
    private function dumpRegions($limit = 0)
    {
        $this->info('🌍 Dumping regions data...');
        
        try {
            $client = new Client();
            $response = $client->get('https://api.worldota.net/api/b2b/v3/hotel/region/dump/', [
                'auth' => ['9290', '58d8a2d7-c982-4c27-90c7-77647b13c63d'],
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            $regionUrl = $data['data']['url'];
            
            $this->info("  📥 Downloading regions from: {$regionUrl}");
            
            // Download and process regions
            $regionData = file_get_contents($regionUrl);
            $tempFile = tempnam(sys_get_temp_dir(), 'regions_');
            file_put_contents($tempFile, $regionData);
            $decompressed = shell_exec("zstd -d -c " . escapeshellarg($tempFile) . " 2>/dev/null");
            unlink($tempFile);
            
            $lines = explode("\n", trim($decompressed));
            $regionCount = 0;
            
            // Clear existing regions if not resuming
            DB::table('ratehawk_regions')->truncate();
            
            $processLines = $limit > 0 ? array_slice($lines, 0, $limit) : $lines;
            
            foreach ($processLines as $line) {
                if (empty(trim($line))) continue;
                
                $region = json_decode($line, true);
                if (!$region || !isset($region['id']) || !isset($region['name'])) continue;
                
                DB::table('ratehawk_regions')->insert([
                    'id' => $region['id'],
                    'name' => $region['name']['en'] ?? $region['name'],
                    'country_code' => $region['country_code'] ?? null,
                    'country_name' => $region['country_name']['en'] ?? $region['country_name'] ?? null,
                    'region_type' => $region['type'] ?? null,
                    'latitude' => $region['center']['latitude'] ?? null,
                    'longitude' => $region['center']['longitude'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $regionCount++;
            }
            
            $this->info("  ✅ Inserted {$regionCount} regions");
            
        } catch (Exception $e) {
            $this->error("  ❌ Error dumping regions: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function dumpHotels($method = 'streaming', $limit = 0, $resume = false)
    {
        $this->info("🏨 Dumping hotels data using {$method} method...");
        
        try {
            $client = new Client();
            $response = $client->post('https://api.worldota.net/api/b2b/v3/hotel/info/dump/', [
                'auth' => ['9290', '58d8a2d7-c982-4c27-90c7-77647b13c63d'],
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
                'json' => [
                    'language' => 'en'
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            $hotelUrl = $data['data']['url'];
            $lastUpdate = $data['data']['last_update'];
            
            $this->info("  📥 Downloading hotels from: {$hotelUrl}");
            $this->info("  📅 Last update: {$lastUpdate}");
            
            switch ($method) {
                case 'guzzle':
                    $this->dumpHotelsGuzzle($hotelUrl, $limit);
                    break;
                case 'curl':
                    $this->dumpHotelsCurl($hotelUrl, $limit);
                    break;
                case 'streaming':
                default:
                    $this->dumpHotelsStreaming($hotelUrl, $limit, $resume);
                    break;
            }
            
        } catch (Exception $e) {
            $this->error("  ❌ Error dumping hotels: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function dumpHotelsGuzzle($hotelUrl, $limit = 0)
    {
        $this->info("  🔄 Using Guzzle method...");
        
        $downloadClient = new Client([
            'timeout' => 300,
            'connect_timeout' => 30,
            'stream' => true,
            'progress' => function ($downloadTotal, $downloadedBytes) {
                if ($downloadTotal > 0) {
                    $progress = round(($downloadedBytes / $downloadTotal) * 100, 2);
                    $downloadedMB = round($downloadedBytes / 1024 / 1024, 2);
                    $totalMB = round($downloadTotal / 1024 / 1024, 2);
                    $this->info("    📊 {$progress}% ({$downloadedMB} MB / {$totalMB} MB)");
                }
            }
        ]);
        
        $response = $downloadClient->get($hotelUrl);
        $hotelData = $response->getBody()->getContents();
        
        $this->processHotelData($hotelData, $limit);
    }
    
    private function dumpHotelsCurl($hotelUrl, $limit = 0)
    {
        $this->info("  🔄 Using cURL method...");
        
        $tempFile = tempnam(sys_get_temp_dir(), 'hotels_download_');
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $hotelUrl);
        curl_setopt($ch, CURLOPT_FILE, fopen($tempFile, 'w'));
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 600);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Trektoo-Hotel-Dumper/1.0');
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        
        curl_setopt($ch, CURLOPT_NOPROGRESS, false);
        curl_setopt($ch, CURLOPT_PROGRESSFUNCTION, function($resource, $download_size, $downloaded, $upload_size, $uploaded) {
            if ($download_size > 0) {
                $progress = round(($downloaded / $download_size) * 100, 1);
                $downloadedMB = round($downloaded / 1024 / 1024, 2);
                $totalMB = round($download_size / 1024 / 1024, 2);
                $this->info("    📊 {$progress}% ({$downloadedMB} MB / {$totalMB} MB)");
            }
            return 0;
        });
        
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if (!$result || $httpCode !== 200 || $error) {
            unlink($tempFile);
            throw new Exception("Download failed. HTTP Code: {$httpCode}, Error: {$error}");
        }
        
        $hotelData = file_get_contents($tempFile);
        unlink($tempFile);
        
        $this->processHotelData($hotelData, $limit);
    }
    
    private function dumpHotelsStreaming($hotelUrl, $limit = 0, $resume = false)
    {
        $this->info("  🔄 Using streaming method (memory efficient)...");
        
        $tempFile = tempnam(sys_get_temp_dir(), 'hotels_download_');
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $hotelUrl);
        curl_setopt($ch, CURLOPT_FILE, fopen($tempFile, 'w'));
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 0); // No timeout
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 60);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Trektoo-Hotel-Dumper/1.0');
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_BUFFERSIZE, 16384);
        
        curl_setopt($ch, CURLOPT_NOPROGRESS, false);
        curl_setopt($ch, CURLOPT_PROGRESSFUNCTION, function($resource, $download_size, $downloaded, $upload_size, $uploaded) {
            if ($download_size > 0) {
                $progress = round(($downloaded / $download_size) * 100, 1);
                $downloadedMB = round($downloaded / 1024 / 1024, 2);
                $totalMB = round($download_size / 1024 / 1024, 2);
                $this->info("    📊 {$progress}% ({$downloadedMB} MB / {$totalMB} MB)");
            }
            return 0;
        });
        
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if (!$result || $httpCode !== 200 || $error) {
            unlink($tempFile);
            throw new Exception("Download failed. HTTP Code: {$httpCode}, Error: {$error}");
        }
        
        // Decompress using streaming
        $tempDecompressedFile = tempnam(sys_get_temp_dir(), 'hotels_decompressed_');
        $decompressCommand = "zstd -d -c " . escapeshellarg($tempFile) . " > " . escapeshellarg($tempDecompressedFile) . " 2>/dev/null";
        
        shell_exec($decompressCommand);
        unlink($tempFile);
        
        if (!file_exists($tempDecompressedFile) || filesize($tempDecompressedFile) == 0) {
            throw new Exception('Failed to decompress hotel data');
        }
        
        // Process file line by line
        $file = fopen($tempDecompressedFile, 'r');
        if (!$file) {
            throw new Exception('Failed to open decompressed file');
        }
        
        $processed = 0;
        $inserted = 0;
        $errors = 0;
        
        while (($line = fgets($file)) !== false) {
            if ($limit > 0 && $processed >= $limit) break;
            
            $line = trim($line);
            if (empty($line)) continue;
            
            $hotel = json_decode($line, true);
            if (!$hotel || !isset($hotel['id']) || !isset($hotel['name'])) continue;
            
            $processed++;
            
            try {
                DB::table('hotel_cache')->updateOrInsert(
                    ['hotel_id' => $hotel['id']],
                    [
                        'hotel_id' => $hotel['id'],
                        'name' => $hotel['name'],
                        'country_code' => $hotel['country_code'] ?? null,
                        'city' => $hotel['city'] ?? null,
                        'address' => $hotel['address'] ?? null,
                        'latitude' => $hotel['latitude'] ?? null,
                        'longitude' => $hotel['longitude'] ?? null,
                        'star_rating' => $hotel['star_rating'] ?? null,
                        'description' => $hotel['description'] ?? null,
                        'amenities' => isset($hotel['amenities']) ? json_encode($hotel['amenities']) : null,
                        'images' => isset($hotel['images']) ? json_encode($hotel['images']) : null,
                        'raw_data' => $line,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                );
                $inserted++;
            } catch (Exception $e) {
                $errors++;
                $this->error("    ❌ Error inserting hotel {$hotel['id']}: " . $e->getMessage());
            }
            
            if ($processed % 1000 == 0) {
                $this->info("    📈 Processed: {$processed} hotels | Inserted: {$inserted} | Errors: {$errors}");
            }
        }
        
        fclose($file);
        unlink($tempDecompressedFile);
        
        $this->info("  ✅ Processed {$processed} hotels | Inserted: {$inserted} | Errors: {$errors}");
    }
    
    private function processHotelData($hotelData, $limit = 0)
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'hotels_');
        file_put_contents($tempFile, $hotelData);
        
        $decompressed = shell_exec("zstd -d -c " . escapeshellarg($tempFile) . " 2>/dev/null");
        unlink($tempFile);
        
        if (!$decompressed) {
            throw new Exception('Failed to decompress hotel data');
        }
        
        $lines = explode("\n", trim($decompressed));
        $processed = 0;
        $inserted = 0;
        $errors = 0;
        
        $processLines = $limit > 0 ? array_slice($lines, 0, $limit) : $lines;
        
        foreach ($processLines as $line) {
            if (empty(trim($line))) continue;
            
            $hotel = json_decode($line, true);
            if (!$hotel || !isset($hotel['id']) || !isset($hotel['name'])) continue;
            
            $processed++;
            
            try {
                DB::table('hotel_cache')->updateOrInsert(
                    ['hotel_id' => $hotel['id']],
                    [
                        'hotel_id' => $hotel['id'],
                        'name' => $hotel['name'],
                        'country_code' => $hotel['country_code'] ?? null,
                        'city' => $hotel['city'] ?? null,
                        'address' => $hotel['address'] ?? null,
                        'latitude' => $hotel['latitude'] ?? null,
                        'longitude' => $hotel['longitude'] ?? null,
                        'star_rating' => $hotel['star_rating'] ?? null,
                        'description' => $hotel['description'] ?? null,
                        'amenities' => isset($hotel['amenities']) ? json_encode($hotel['amenities']) : null,
                        'images' => isset($hotel['images']) ? json_encode($hotel['images']) : null,
                        'raw_data' => $line,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                );
                $inserted++;
            } catch (Exception $e) {
                $errors++;
                $this->error("    ❌ Error inserting hotel {$hotel['id']}: " . $e->getMessage());
            }
            
            if ($processed % 1000 == 0) {
                $this->info("    📈 Processed: {$processed} hotels | Inserted: {$inserted} | Errors: {$errors}");
            }
        }
        
        $this->info("  ✅ Processed {$processed} hotels | Inserted: {$inserted} | Errors: {$errors}");
    }
}