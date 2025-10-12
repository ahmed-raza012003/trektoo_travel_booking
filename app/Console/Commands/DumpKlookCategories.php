<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Klook\KlookApiService;
use App\Models\Category;
use Illuminate\Support\Facades\Log;

class DumpKlookCategories extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'klook:dump-categories {--force : Force refresh all categories}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dump Klook categories into the database with full hierarchy (main, sub, leaf)';

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
        $this->info('🚀 Starting Klook categories dump...');
        
        try {
            // Check if categories already exist
            $existingCount = Category::count();
            if ($existingCount > 0 && !$this->option('force')) {
                $this->warn("⚠️  Found {$existingCount} existing categories in database.");
                if (!$this->confirm('Do you want to continue and add new categories? (Use --force to replace all)')) {
                    $this->info('❌ Operation cancelled.');
                    return;
                }
            }

            // Clear existing categories if force option is used
            if ($this->option('force')) {
                $this->info('🗑️  Clearing existing categories...');
                Category::truncate();
                $this->info('✅ Existing categories cleared.');
            }

            // Fetch categories from Klook API
            $this->info('📡 Fetching categories from Klook API...');
            $result = $this->klookService->getCategories();

            if (isset($result['error'])) {
                $this->error('❌ Failed to fetch categories: ' . $result['error']);
                return;
            }

            if (!isset($result['categories']) || !is_array($result['categories'])) {
                $this->error('❌ Invalid categories data structure received from API');
                return;
            }

            $this->info('✅ Successfully fetched categories from API');
            $this->info('📊 Processing categories hierarchy...');

            $processedCount = 0;
            $mainCount = 0;
            $subCount = 0;
            $leafCount = 0;

            // Process each main category
            foreach ($result['categories'] as $mainCategory) {
                $this->info("🔄 Processing main category: {$mainCategory['name']} (ID: {$mainCategory['id']})");
                
                // Create main category
                $mainCategoryData = [
                    'category_id' => $mainCategory['id'],
                    'name' => $mainCategory['name'],
                    'level' => 'main',
                    'parent_id' => null,
                    'main_category_id' => $mainCategory['id'],
                    'full_path' => $mainCategory['name'],
                    'sort_order' => $processedCount,
                    'is_active' => true,
                    'raw_data' => $mainCategory
                ];

                Category::updateOrCreate(
                    ['category_id' => $mainCategory['id']],
                    $mainCategoryData
                );
                $mainCount++;
                $processedCount++;

                // Process sub-categories
                if (isset($mainCategory['sub_category']) && is_array($mainCategory['sub_category'])) {
                    foreach ($mainCategory['sub_category'] as $subCategory) {
                        $this->info("  📁 Processing sub-category: {$subCategory['name']} (ID: {$subCategory['id']})");
                        
                        // Create sub-category
                        $subCategoryData = [
                            'category_id' => $subCategory['id'],
                            'name' => $subCategory['name'],
                            'level' => 'sub',
                            'parent_id' => $mainCategory['id'],
                            'main_category_id' => $mainCategory['id'],
                            'full_path' => $mainCategory['name'] . ' > ' . $subCategory['name'],
                            'sort_order' => $processedCount,
                            'is_active' => true,
                            'raw_data' => $subCategory
                        ];

                        Category::updateOrCreate(
                            ['category_id' => $subCategory['id']],
                            $subCategoryData
                        );
                        $subCount++;
                        $processedCount++;

                        // Process leaf categories
                        if (isset($subCategory['leaf_category']) && is_array($subCategory['leaf_category'])) {
                            foreach ($subCategory['leaf_category'] as $leafCategory) {
                                $this->info("    🍃 Processing leaf category: {$leafCategory['name']} (ID: {$leafCategory['id']})");
                                
                                // Create leaf category
                                $leafCategoryData = [
                                    'category_id' => $leafCategory['id'],
                                    'name' => $leafCategory['name'],
                                    'level' => 'leaf',
                                    'parent_id' => $subCategory['id'],
                                    'main_category_id' => $mainCategory['id'],
                                    'full_path' => $mainCategory['name'] . ' > ' . $subCategory['name'] . ' > ' . $leafCategory['name'],
                                    'sort_order' => $processedCount,
                                    'is_active' => true,
                                    'raw_data' => $leafCategory
                                ];

                                Category::updateOrCreate(
                                    ['category_id' => $leafCategory['id']],
                                    $leafCategoryData
                                );
                                $leafCount++;
                                $processedCount++;
                            }
                        }
                    }
                }
            }

            // Display summary
            $this->info('🎉 Categories dump completed successfully!');
            $this->table(
                ['Level', 'Count'],
                [
                    ['Main Categories', $mainCount],
                    ['Sub Categories', $subCount],
                    ['Leaf Categories', $leafCount],
                    ['Total', $processedCount]
                ]
            );

            // Show some examples
            $this->info('📋 Sample categories:');
            $sampleCategories = Category::with(['children', 'parent', 'mainCategory'])
                ->where('level', 'main')
                ->limit(3)
                ->get();

            foreach ($sampleCategories as $category) {
                $this->info("  • {$category->name} (ID: {$category->category_id})");
                if ($category->children->count() > 0) {
                    $this->info("    └─ {$category->children->count()} sub-categories");
                }
            }

        } catch (\Exception $e) {
            $this->error('❌ Error occurred: ' . $e->getMessage());
            Log::error('Klook Categories Dump Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }

        return 0;
    }
}