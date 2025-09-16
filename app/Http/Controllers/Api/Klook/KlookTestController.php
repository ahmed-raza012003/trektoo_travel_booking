<?php

namespace App\Http\Controllers\Api\Klook;

use App\Http\Controllers\Api\BaseController;
use App\Services\Klook\KlookApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KlookTestController extends BaseController
{
    protected $klookService;

    public function __construct(KlookApiService $klookService)
    {
        $this->klookService = $klookService;
    }

    /**
     * Test all Klook API endpoints
     */
    public function testAll(): JsonResponse
    {
        $results = [];
        
        // Test categories
        $results['categories'] = $this->klookService->getCategories();
        
        // Test activities
        $results['activities'] = $this->klookService->getActivities(['limit' => 5]);
        
        // Test activity detail
        $results['activity_detail'] = $this->klookService->getActivityDetail(19);
        
        return $this->successResponse($results, 'Klook API Test Results');
    }

    /**
     * Test categories endpoint
     */
    public function testCategories(): JsonResponse
    {
        $result = $this->klookService->getCategories();
        
        return $this->successResponse($result, 'Categories Test');
    }

    /**
     * Test activities endpoint
     */
    public function testActivities(): JsonResponse
    {
        $result = $this->klookService->getActivities(['limit' => 10, 'page' => 1]);
        
        return $this->successResponse($result, 'Activities Test');
    }
}
