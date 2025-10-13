<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;

class TestCategoriesApi extends Command
{
    protected $signature = 'test:categories-api';
    protected $description = 'Test categories API data structure';

    public function handle()
    {
        $this->info('🧪 Testing Categories API Data Structure');
        $this->line('');

        try {
            // Test basic category count
            $this->info('Total categories: ' . Category::count());
            $this->info('Main categories: ' . Category::where('level', 'main')->count());
            $this->line('');

            // Test getting main categories
            $this->info('📋 Testing main categories query...');
            $mainCategories = Category::where('level', 'main')
                ->orderBy('sort_order')
                ->limit(3)
                ->get(['id', 'category_id', 'name', 'level']);

            foreach ($mainCategories as $category) {
                $this->line("  • {$category->name} (ID: {$category->category_id}, DB ID: {$category->id})");
            }
            $this->line('');

            // Test relationships
            $this->info('🔗 Testing relationships...');
            $firstMain = Category::where('level', 'main')->first();
            if ($firstMain) {
                $this->line("Main category: {$firstMain->name}");
                
                // Test sub-categories relationship
                $subCategories = Category::where('main_category_id', $firstMain->category_id)
                    ->where('level', 'sub')
                    ->get();
                $this->line("Sub-categories count: " . $subCategories->count());
                
                if ($subCategories->count() > 0) {
                    $firstSub = $subCategories->first();
                    $this->line("First sub-category: {$firstSub->name}");
                    
                    // Test leaf categories
                    $leafCategories = Category::where('parent_id', $firstSub->category_id)
                        ->where('level', 'leaf')
                        ->get();
                    $this->line("Leaf categories count: " . $leafCategories->count());
                }
            }

            $this->info('✅ Categories API test completed successfully!');

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            $this->error('File: ' . $e->getFile());
            $this->error('Line: ' . $e->getLine());
        }
    }
}