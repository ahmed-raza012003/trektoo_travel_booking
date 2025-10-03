<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class StopQueueWorkerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'queue:stop-worker';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Stop the background queue worker';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🛑 Stopping Laravel Queue Worker...');

        $pidFile = storage_path('queue-worker.pid');
        
        if (!file_exists($pidFile)) {
            $this->warn('⚠️  No queue worker PID file found. Worker may not be running.');
            return;
        }

        $pid = trim(file_get_contents($pidFile));
        
        if (PHP_OS_FAMILY === 'Windows') {
            // Windows - kill the process
            $result = Process::run("taskkill /F /PID {$pid}");
            if ($result->successful()) {
                $this->info("✅ Queue worker stopped (PID: {$pid})");
            } else {
                $this->warn("⚠️  Could not stop queue worker (PID: {$pid})");
            }
        } else {
            // Unix/Linux - send SIGTERM
            if (posix_kill($pid, SIGTERM)) {
                $this->info("✅ Queue worker stopped (PID: {$pid})");
            } else {
                $this->warn("⚠️  Could not stop queue worker (PID: {$pid})");
            }
        }

        // Remove PID file
        if (file_exists($pidFile)) {
            unlink($pidFile);
            $this->info('📝 PID file removed');
        }
    }
}