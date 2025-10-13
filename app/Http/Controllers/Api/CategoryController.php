<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends BaseController
{
    /**
     * Get all categories with hierarchy from database
     */
    public function getCategories(Request $request): JsonResponse
    {
        try {
            // Get main categories
            $mainCategories = Category::where('level', 'main')
                ->orderBy('sort_order')
                ->get();

            // Transform the data to match the expected frontend structure
            $categories = $mainCategories->map(function ($mainCategory) {
                $categoryData = [
                    'id' => $mainCategory->category_id,
                    'name' => $mainCategory->name,
                    'sub_category' => []
                ];

                // Get sub-categories for this main category
                $subCategories = Category::where('main_category_id', $mainCategory->category_id)
                    ->where('level', 'sub')
                    ->orderBy('sort_order')
                    ->get();

                foreach ($subCategories as $subCategory) {
                    $subCategoryData = [
                        'id' => $subCategory->category_id,
                        'name' => $subCategory->name,
                        'leaf_category' => []
                    ];

                    // Get leaf categories for this sub-category
                    $leafCategories = Category::where('parent_id', $subCategory->category_id)
                        ->where('level', 'leaf')
                        ->orderBy('sort_order')
                        ->get();

                    foreach ($leafCategories as $leafCategory) {
                        $subCategoryData['leaf_category'][] = [
                            'id' => $leafCategory->category_id,
                            'name' => $leafCategory->name
                        ];
                    }

                    $categoryData['sub_category'][] = $subCategoryData;
                }

                return $categoryData;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'success' => true,
                    'categories' => $categories
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories from database',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get categories by level
     */
    public function getCategoriesByLevel(Request $request, string $level): JsonResponse
    {
        try {
            $validLevels = ['main', 'sub', 'leaf'];
            if (!in_array($level, $validLevels)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid level. Must be one of: ' . implode(', ', $validLevels)
                ], 400);
            }

            $categories = Category::where('level', $level)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['category_id', 'name', 'parent_id', 'main_category_id']);

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search categories by name
     */
    public function searchCategories(Request $request): JsonResponse
    {
        try {
            $searchTerm = $request->get('q', '');
            
            if (empty($searchTerm)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search term is required'
                ], 400);
            }

            $categories = Category::where('is_active', true)
                ->where('name', 'like', '%' . $searchTerm . '%')
                ->with(['parent', 'mainCategory'])
                ->orderBy('level')
                ->orderBy('name')
                ->get(['category_id', 'name', 'level', 'parent_id', 'main_category_id', 'full_path']);

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category hierarchy for a specific main category
     */
    public function getCategoryHierarchy(Request $request, int $categoryId): JsonResponse
    {
        try {
            $mainCategory = Category::where('category_id', $categoryId)
                ->where('level', 'main')
                ->with(['subCategories.children'])
                ->first();

            if (!$mainCategory) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            $categoryData = [
                'id' => $mainCategory->category_id,
                'name' => $mainCategory->name,
                'sub_category' => []
            ];

            foreach ($mainCategory->subCategories as $subCategory) {
                $subCategoryData = [
                    'id' => $subCategory->category_id,
                    'name' => $subCategory->name,
                    'leaf_category' => []
                ];

                foreach ($subCategory->children as $leafCategory) {
                    $subCategoryData['leaf_category'][] = [
                        'id' => $leafCategory->category_id,
                        'name' => $leafCategory->name
                    ];
                }

                $categoryData['sub_category'][] = $subCategoryData;
            }

            return response()->json([
                'success' => true,
                'data' => $categoryData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch category hierarchy',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
