<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;

class TestCategories extends Command
{
    protected $signature = 'test:categories';
    protected $description = 'Test categories database structure';

    public function handle()
    {
        $this->info('📊 Categories Database Test');
        $this->line('');

        // Total counts
        $this->info('Total categories: ' . Category::count());
        $this->info('Main categories: ' . Category::where('level', 'main')->count());
        $this->info('Sub categories: ' . Category::where('level', 'sub')->count());
        $this->info('Leaf categories: ' . Category::where('level', 'leaf')->count());
        $this->line('');

        // Sample main categories
        $this->info('📋 Sample Main Categories:');
        $mainCategories = Category::where('level', 'main')->take(5)->get();
        foreach ($mainCategories as $category) {
            $this->line("  • {$category->name} (ID: {$category->category_id})");
            $subCount = $category->subCategories()->count();
            $this->line("    └─ {$subCount} sub-categories");
        }
        $this->line('');

        // Test hierarchy with "THINGS TO DO"
        $this->info('🔍 Testing "THINGS TO DO" hierarchy:');
        $thingsToDo = Category::where('name', 'THINGS TO DO')->first();
        if ($thingsToDo) {
            $this->line("Main: {$thingsToDo->name}");
            
            $subCategories = $thingsToDo->subCategories()->take(3)->get();
            foreach ($subCategories as $sub) {
                $this->line("  └─ Sub: {$sub->name}");
                $leafCount = $sub->children()->count();
                $this->line("      └─ {$leafCount} leaf categories");
            }
        }
        $this->line('');

        // Test full path
        $this->info('🛤️ Sample Full Paths:');
        $leafCategories = Category::where('level', 'leaf')->take(3)->get();
        foreach ($leafCategories as $leaf) {
            $this->line("  • {$leaf->full_path}");
        }

        $this->info('✅ Categories test completed!');
    }
}