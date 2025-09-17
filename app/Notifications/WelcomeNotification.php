<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->subject('Welcome to Trektoo - Your Journey Begins Here!')
        ->greeting('Dear ' . $notifiable->name . ',')
        ->line('Welcome to Trektoo! We are thrilled to have you join our community of travelers.')
        ->line('At Trektoo, we simplify your travel planning by offering everything you need in one place:')
        ->line('')
        ->line('🏨 **Hotel Bookings** - Discover perfect accommodations worldwide')
        ->line('🎯 **Activities & Experiences** - Create unforgettable memories')
        ->line('🚗 **Car Rentals** - Explore destinations at your own pace')
        ->line('✈️ **Flight Options** - Find the best routes and deals')
        ->line('📋 **Travel Itineraries** - Personalized plans for your journey')
        ->line('')
        ->line('We are committed to making your travel experiences seamless, enjoyable, and unforgettable.')
        ->action('Explore Now', url('/'))
        ->line('')
        ->line('**Getting Started:**')
        ->line('1. Complete your profile to get personalized recommendations')
        ->line('2. Browse our curated destinations and experiences')
        ->line('3. Save your favorite options for quick access later')
        ->line('')
        ->line('Have questions? Our support team is available 24/7 at support@trektoo.com')
        ->line('')
        ->line('Happy travels,')
        ->line('The Trektoo Team')
        ->salutation(' ');
}

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}