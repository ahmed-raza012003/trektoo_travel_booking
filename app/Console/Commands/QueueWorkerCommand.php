<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Log;

class QueueWorkerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'queue:start-worker 
                            {--daemon : Run as daemon in background}
                            {--tries=3 : Number of times to attempt a job before logging it failed}
                            {--timeout=90 : The number of seconds a child process can run}
                            {--memory=512 : The memory limit in megabytes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Start the queue worker with automatic restart and monitoring';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting Laravel Queue Worker...');
        $this->info('📧 This will process Welcome Notifications and other queued jobs automatically');
        $this->newLine();

        $daemon = $this->option('daemon');
        $tries = $this->option('tries');
        $timeout = $this->option('timeout');
        $memory = $this->option('memory');

        if ($daemon) {
            $this->startDaemonWorker($tries, $timeout, $memory);
        } else {
            $this->startInteractiveWorker($tries, $timeout, $memory);
        }
    }

    /**
     * Start the worker in daemon mode (background)
     */
    private function startDaemonWorker($tries, $timeout, $memory)
    {
        $this->info('🔄 Starting queue worker in daemon mode...');
        
        // Create a PID file to track the worker
        $pidFile = storage_path('queue-worker.pid');
        
        // Check if worker is already running
        if (file_exists($pidFile)) {
            $pid = trim(file_get_contents($pidFile));
            if ($this->isProcessRunning($pid)) {
                $this->warn("⚠️  Queue worker is already running (PID: {$pid})");
                return;
            } else {
                // Remove stale PID file
                unlink($pidFile);
            }
        }

        // Start the worker process
        $command = "php artisan queue:work --verbose --tries={$tries} --timeout={$timeout} --memory={$memory}";
        
        if (PHP_OS_FAMILY === 'Windows') {
            // Windows command - start batch file in background
            $batchFile = base_path('run-queue-worker.bat');
            Process::run("start /B \"{$batchFile}\"");
            
            // Give it a moment to start and create PID file
            sleep(2);
        } else {
            // Unix/Linux command
            $process = Process::start("nohup {$command} > /dev/null 2>&1 & echo $! > {$pidFile}");
        }

        $this->info('✅ Queue worker started in background');
        $this->info('📝 Monitor logs at: storage/logs/laravel.log');
        $this->info('🛑 To stop: php artisan queue:stop-worker');
    }

    /**
     * Start the worker in interactive mode
     */
    private function startInteractiveWorker($tries, $timeout, $memory)
    {
        $this->info('🔄 Starting queue worker in interactive mode...');
        $this->info('Press Ctrl+C to stop the worker');
        $this->newLine();

        // Start the worker process
        $command = "php artisan queue:work --verbose --tries={$tries} --timeout={$timeout} --memory={$memory}";
        
        $process = Process::start($command);
        
        // Wait for the process to complete
        $process->wait();
    }

    /**
     * Check if a process is running by PID
     */
    private function isProcessRunning($pid)
    {
        if (PHP_OS_FAMILY === 'Windows') {
            $result = Process::run("tasklist /FI \"PID eq {$pid}\"");
            return strpos($result->output(), $pid) !== false;
        } else {
            return posix_kill($pid, 0);
        }
    }
}