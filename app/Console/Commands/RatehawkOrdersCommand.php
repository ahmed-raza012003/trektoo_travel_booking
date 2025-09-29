<?php

namespace App\Console\Commands;

use App\Models\RatehawkOrder;
use App\Jobs\ProcessRatehawkBookingStatus;
use App\Jobs\CleanupExpiredRatehawkOrders;
use Illuminate\Console\Command;

/**
 * Ratehawk Orders Management Command
 */
class RatehawkOrdersCommand extends Command
{
    protected $signature = 'ratehawk:orders 
                            {action : Action to perform (status-check|cleanup|list)}
                            {--partner-order-id= : Specific partner order ID for status check}
                            {--status= : Filter by status for list command}
                            {--limit=10 : Limit results for list command}';

    protected $description = 'Manage Ratehawk hotel orders';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'status-check':
                return $this->checkStatus();
            case 'cleanup':
                return $this->cleanup();
            case 'list':
                return $this->listOrders();
            default:
                $this->error('Invalid action. Available actions: status-check, cleanup, list');
                return 1;
        }
    }

    /**
     * Check booking status
     */
    private function checkStatus(): int
    {
        $partnerOrderId = $this->option('partner-order-id');

        if ($partnerOrderId) {
            // Check specific order
            $order = RatehawkOrder::findByPartnerOrderId($partnerOrderId);
            
            if (!$order) {
                $this->error("Order not found: {$partnerOrderId}");
                return 1;
            }

            $this->info("Checking status for order: {$partnerOrderId}");
            ProcessRatehawkBookingStatus::dispatch($partnerOrderId);
            $this->info('Status check job dispatched successfully');
            
        } else {
            // Check all pending/processing orders
            $orders = RatehawkOrder::whereIn('status', ['pending', 'processing'])
                ->where('expires_at', '>', now())
                ->limit(10)
                ->get();

            if ($orders->isEmpty()) {
                $this->info('No orders to check');
                return 0;
            }

            $this->info("Checking status for {$orders->count()} orders...");

            foreach ($orders as $order) {
                ProcessRatehawkBookingStatus::dispatch($order->partner_order_id);
                $this->line("- Dispatched check for: {$order->partner_order_id}");
            }

            $this->info('All status check jobs dispatched successfully');
        }

        return 0;
    }

    /**
     * Cleanup expired orders
     */
    private function cleanup(): int
    {
        $this->info('Cleaning up expired orders...');
        
        CleanupExpiredRatehawkOrders::dispatch();
        
        $this->info('Cleanup job dispatched successfully');
        return 0;
    }

    /**
     * List orders
     */
    private function listOrders(): int
    {
        $status = $this->option('status');
        $limit = (int) $this->option('limit');

        $query = RatehawkOrder::with('booking')->orderBy('created_at', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->limit($limit)->get();

        if ($orders->isEmpty()) {
            $this->info('No orders found');
            return 0;
        }

        $headers = ['ID', 'Partner Order ID', 'Hotel Name', 'Status', 'Total Amount', 'Currency', 'Created At', 'Expires At'];
        $rows = [];

        foreach ($orders as $order) {
            $rows[] = [
                $order->id,
                $order->partner_order_id,
                $order->hotel_name ?? 'N/A',
                $order->status,
                $order->total_amount ?? 'N/A',
                $order->currency ?? 'N/A',
                $order->created_at->format('Y-m-d H:i:s'),
                $order->expires_at?->format('Y-m-d H:i:s') ?? 'N/A'
            ];
        }

        $this->table($headers, $rows);

        $this->info("Showing {$orders->count()} orders" . ($status ? " with status: {$status}" : ''));
        return 0;
    }
}
