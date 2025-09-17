<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;

Route::get('/', function () {
    return view('welcome');
});

// Test email route
// Route::get('/test-mail-direct', function () {
//     Mail::raw('This is a direct test email from Laravel.', function ($message) {
//         $message->to('sazhar5494@gmail.com')
//                 ->subject('Laravel Direct Test');
//     });
//     return 'Direct email attempted. Check inbox/spam.';
// });