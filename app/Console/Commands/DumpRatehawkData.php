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
            $this->info("  📥 Downloading region data...");
            $regionData = file_get_contents($regionUrl);
            $tempFile = tempnam(sys_get_temp_dir(), 'regions_');
            file_put_contents($tempFile, $regionData);
            
            $this->info("  🔓 Decompressing region data...");
            
            // Use Python zstandard for streaming decompression to avoid memory issues
            $tempDecompressedFile = tempnam(sys_get_temp_dir(), 'regions_decompressed_');
            $tempFileNormalized = str_replace('\\', '/', $tempFile);
            $tempDecompressedFileNormalized = str_replace('\\', '/', $tempDecompressedFile);
            
            $pythonScript = <<<PYTHON
import os
import sys
try:
    import zstandard as zstd
    
    input_file = '{$tempFileNormalized}'
    output_file = '{$tempDecompressedFileNormalized}'
    
    with open(input_file, 'rb') as f:
        dctx = zstd.ZstdDecompressor()
        with open(output_file, 'wb') as out:
            dctx.copy_stream(f, out)
    print("SUCCESS")
except ImportError:
    print("zstandard not installed")
except Exception as e:
    print(f"Error: {e}")
PYTHON;
            $scriptFile = tempnam(sys_get_temp_dir(), 'decompress_') . '.py';
            file_put_contents($scriptFile, $pythonScript);
            $output = shell_exec("python " . escapeshellarg($scriptFile) . " 2>&1");
            unlink($scriptFile);
            unlink($tempFile);
            
            if (!file_exists($tempDecompressedFile) || filesize($tempDecompressedFile) == 0) {
                $this->error("  ❌ Region decompression failed!");
                $this->error("  💡 Python zstandard output: " . $output);
                throw new Exception('Failed to decompress region data');
            }
            
            $this->info("  ✅ Region decompression successful!");
            
            // Process file line by line to avoid memory issues
            $file = fopen($tempDecompressedFile, 'r');
            if (!$file) {
                throw new Exception('Failed to open decompressed file');
            }
            
            $regionCount = 0;
            
            // Clear existing regions if not resuming
            DB::table('ratehawk_regions')->truncate();
            
            while (($line = fgets($file)) !== false) {
                if ($limit > 0 && $regionCount >= $limit) break;
                
                $line = trim($line);
                if (empty($line)) continue;
                
                $region = json_decode($line, true);
                
                // Debug: Show first few lines to understand structure
                if ($regionCount < 3) {
                    $this->info("    🔍 Debug - Region Line " . ($regionCount + 1) . ": " . substr($line, 0, 200) . "...");
                    $this->info("    🔍 Debug - Decoded keys: " . implode(', ', array_keys($region ?: [])));
                }
                
                if (!$region || !isset($region['id']) || !isset($region['name'])) {
                    if ($regionCount < 3) {
                        $this->warn("    ⚠️  Skipping region - missing id or name");
                    }
                    continue;
                }
                
                // Handle array fields properly
                $name = is_array($region['name']) ? ($region['name']['en'] ?? reset($region['name'])) : $region['name'];
                $countryName = null;
                if (isset($region['country_name'])) {
                    $countryName = is_array($region['country_name']) ? ($region['country_name']['en'] ?? reset($region['country_name'])) : $region['country_name'];
                }
                
                // Get country_code (can be null now)
                $countryCode = $region['country_code'] ?? null;
                
                DB::table('ratehawk_regions')->insert([
                    'id' => $region['id'],
                    'name' => $name,
                    'country_code' => $countryCode,
                    'country_name' => $countryName,
                    'region_type' => $region['type'] ?? null,
                    'latitude' => $region['center']['latitude'] ?? null,
                    'longitude' => $region['center']['longitude'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $regionCount++;
            }
            
            fclose($file);
            unlink($tempDecompressedFile);
            
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
        
        $this->info("  🔓 Decompressing hotel data using PHP...");
        
        // Try PHP native decompression methods
        $tempDecompressedFile = tempnam(sys_get_temp_dir(), 'hotels_decompressed_');
        $decompressed = false;
        
        // Method 1: Try zstd PHP extension if available
        if (function_exists('zstd_uncompress')) {
            $this->info("    ✅ Using PHP zstd extension");
            $compressed = file_get_contents($tempFile);
            $decompressedData = zstd_uncompress($compressed);
            if ($decompressedData !== false) {
                file_put_contents($tempDecompressedFile, $decompressedData);
                $decompressed = true;
            }
        }
        
        // Method 2: Try Python with zstandard (primary fallback)
        if (!$decompressed) {
            $this->info("    🔄 Trying Python zstandard...");
            
            // Use forward slashes and raw strings to avoid Windows path issues
            $tempFileNormalized = str_replace('\\', '/', $tempFile);
            $tempDecompressedFileNormalized = str_replace('\\', '/', $tempDecompressedFile);
            
            $pythonScript = <<<PYTHON
import os
import sys
try:
    import zstandard as zstd
    
    input_file = '{$tempFileNormalized}'
    output_file = '{$tempDecompressedFileNormalized}'
    
    with open(input_file, 'rb') as f:
        dctx = zstd.ZstdDecompressor()
        with open(output_file, 'wb') as out:
            dctx.copy_stream(f, out)
    print("SUCCESS")
except ImportError:
    print("zstandard not installed")
except Exception as e:
    print(f"Error: {e}")
PYTHON;
            $scriptFile = tempnam(sys_get_temp_dir(), 'decompress_') . '.py';
            file_put_contents($scriptFile, $pythonScript);
            $output = shell_exec("python " . escapeshellarg($scriptFile) . " 2>&1");
            unlink($scriptFile);
            
            if (file_exists($tempDecompressedFile) && filesize($tempDecompressedFile) > 0) {
                $decompressed = true;
                $this->info("    ✅ Python zstandard decompression successful");
            } else {
                $this->warn("    ⚠️  Python zstandard failed: " . $output);
            }
        }
        
        // Method 3: Try shell command (works on Linux/Windows with zstd installed)
        if (!$decompressed && (stripos(PHP_OS, 'WIN') === 0)) {
            $this->info("    🔄 Trying Windows zstd command...");
            $decompressCommand = "zstd -d -c \"" . $tempFile . "\" > \"" . $tempDecompressedFile . "\" 2>&1";
            $output = shell_exec($decompressCommand);
            if (file_exists($tempDecompressedFile) && filesize($tempDecompressedFile) > 0) {
                $decompressed = true;
            } else {
                $this->warn("    ⚠️  Windows zstd not available or failed: " . $output);
            }
        }
        
        // Method 4: Try Linux/Unix command
        if (!$decompressed && (stripos(PHP_OS, 'WIN') === false)) {
            $this->info("    🔄 Trying Unix zstd command...");
            $decompressCommand = "zstd -d -c " . escapeshellarg($tempFile) . " > " . escapeshellarg($tempDecompressedFile) . " 2>&1";
            $output = shell_exec($decompressCommand);
            if (file_exists($tempDecompressedFile) && filesize($tempDecompressedFile) > 0) {
                $decompressed = true;
            } else {
                $this->warn("    ⚠️  Unix zstd not available or failed: " . $output);
            }
        }
        
        unlink($tempFile);
        
        if (!$decompressed || !file_exists($tempDecompressedFile) || filesize($tempDecompressedFile) == 0) {
            $this->error("  ❌ All decompression methods failed!");
            $this->error("  💡 Please install zstd:");
            $this->error("     Windows: choco install zstandard  OR  winget install zstd");
            $this->error("     Linux: apt-get install zstd  OR  yum install zstd");
            $this->error("     macOS: brew install zstd");
            throw new Exception('Failed to decompress hotel data - zstd not available');
        }
        
        $this->info("  ✅ Decompression successful!");
        
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
            
            // Debug: Show first few lines to understand structure
            if ($processed < 3) {
                $this->info("    🔍 Debug - Line " . ($processed + 1) . ": " . substr($line, 0, 200) . "...");
                $this->info("    🔍 Debug - Decoded keys: " . implode(', ', array_keys($hotel ?: [])));
            }
            
            if (!$hotel || !isset($hotel['id']) || !isset($hotel['name'])) {
                if ($processed < 3) {
                    $this->warn("    ⚠️  Skipping line - missing id or name");
                }
                continue;
            }
            
            $processed++;
            
            try {
                DB::table('ratehawk_hotels')->updateOrInsert(
                    ['hotel_id' => $hotel['id']],
                    [
                        'hotel_id' => $hotel['id'],
                        'name' => $hotel['name'],
                        'country_code' => $hotel['country_code'] ?? null,
                        'country_name' => $hotel['country_name'] ?? null,
                        'city' => $hotel['city'] ?? null,
                        'address' => $hotel['address'] ?? null,
                        'latitude' => $hotel['latitude'] ?? null,
                        'longitude' => $hotel['longitude'] ?? null,
                        'star_rating' => $hotel['star_rating'] ?? null,
                        'description' => $hotel['description'] ?? null,
                        'amenities' => isset($hotel['amenities']) ? json_encode($hotel['amenities']) : null,
                        'images' => isset($hotel['images']) ? json_encode($hotel['images']) : null,
                        'facilities' => isset($hotel['facilities']) ? json_encode($hotel['facilities']) : null,
                        'phone' => $hotel['phone'] ?? null,
                        'email' => $hotel['email'] ?? null,
                        'website' => $hotel['website'] ?? null,
                        'rating' => $hotel['rating'] ?? null,
                        'review_count' => $hotel['review_count'] ?? null,
                        'is_active' => $hotel['is_active'] ?? true,
                        'raw_data' => $line,
                        'last_updated' => now(),
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
        $this->info("  🔓 Decompressing hotel data...");
        $tempFile = tempnam(sys_get_temp_dir(), 'hotels_');
        file_put_contents($tempFile, $hotelData);
        
        $decompressed = false;
        $decompressedData = null;
        
        // Method 1: Try zstd PHP extension
        if (function_exists('zstd_uncompress')) {
            $this->info("    ✅ Using PHP zstd extension");
            $decompressedData = zstd_uncompress($hotelData);
            if ($decompressedData !== false) {
                $decompressed = true;
            }
        }
        
        // Method 2: Try Windows zstd command
        if (!$decompressed && (stripos(PHP_OS, 'WIN') === 0)) {
            $this->info("    🔄 Trying Windows zstd command...");
            $tempOut = tempnam(sys_get_temp_dir(), 'hotels_out_');
            $command = "zstd -d -c \"" . $tempFile . "\" > \"" . $tempOut . "\" 2>&1";
            shell_exec($command);
            if (file_exists($tempOut) && filesize($tempOut) > 0) {
                $decompressedData = file_get_contents($tempOut);
                $decompressed = true;
            }
            @unlink($tempOut);
        }
        
        // Method 3: Try Unix zstd command
        if (!$decompressed) {
            $this->info("    🔄 Trying Unix zstd command...");
            $decompressedData = shell_exec("zstd -d -c " . escapeshellarg($tempFile) . " 2>&1");
            if ($decompressedData && strlen($decompressedData) > 0) {
                $decompressed = true;
            }
        }
        
        unlink($tempFile);
        
        if (!$decompressed || !$decompressedData) {
            $this->error("  ❌ Hotel decompression failed!");
            $this->error("  💡 Please install zstd (see instructions above)");
            throw new Exception('Failed to decompress hotel data');
        }
        
        $this->info("  ✅ Hotel decompression successful!");
        
        $lines = explode("\n", trim($decompressedData));
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
                DB::table('ratehawk_hotels')->updateOrInsert(
                    ['hotel_id' => $hotel['id']],
                    [
                        'hotel_id' => $hotel['id'],
                        'name' => $hotel['name'],
                        'country_code' => $hotel['country_code'] ?? null,
                        'country_name' => $hotel['country_name'] ?? null,
                        'city' => $hotel['city'] ?? null,
                        'address' => $hotel['address'] ?? null,
                        'latitude' => $hotel['latitude'] ?? null,
                        'longitude' => $hotel['longitude'] ?? null,
                        'star_rating' => $hotel['star_rating'] ?? null,
                        'description' => $hotel['description'] ?? null,
                        'amenities' => isset($hotel['amenities']) ? json_encode($hotel['amenities']) : null,
                        'images' => isset($hotel['images']) ? json_encode($hotel['images']) : null,
                        'facilities' => isset($hotel['facilities']) ? json_encode($hotel['facilities']) : null,
                        'phone' => $hotel['phone'] ?? null,
                        'email' => $hotel['email'] ?? null,
                        'website' => $hotel['website'] ?? null,
                        'rating' => $hotel['rating'] ?? null,
                        'review_count' => $hotel['review_count'] ?? null,
                        'is_active' => $hotel['is_active'] ?? true,
                        'raw_data' => $line,
                        'last_updated' => now(),
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