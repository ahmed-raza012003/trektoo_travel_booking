<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
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
     *
     * @return array<int, string>
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
            ->subject('Welcome to Trektoo Travel Booking!')
            ->greeting('Welcome to Trektoo Travel Booking!')
            ->line('Thank you for registering with Trektoo Travel Booking.')
            ->line('We are excited to have you on board and help you plan your next adventure.')
            ->line('You can now start exploring our travel booking services.')
            ->action('Start Exploring', url('/'))
            ->line('If you have any questions, feel free to contact our support team.')
            ->line('Happy travels!')
            ->salutation('Best regards, The Trektoo Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
