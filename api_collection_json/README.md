# Trektoo Travel Booking API - Testing Guide

## Quick Start

### 1. Start the Laravel Server
```bash
cd /home/ahmad/work/Trektoo/trektoo_travel_booking
php artisan serve
```
The API will be available at: `http://localhost:8000`

### 2. Import Postman Collection
1. Open Postman
2. Click "Import" button
3. Select `Trektoo_Travel_Booking_API.postman_collection.json`
4. The collection will be imported with all authentication endpoints

### 3. Test the API Flow

#### Step 1: Register a User
- Use the "Register User" endpoint
- Body example:
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

#### Step 2: Login
- Use the "Login User" endpoint
- Body example:
```json
{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

#### Step 3: Test Protected Routes
- Copy the token from login response
- Set it in Postman environment variable `auth_token`
- Test "Get User Profile" and "Logout User"

#### Step 4: Test Password Reset
- Use "Forgot Password" with email
- Check email for reset link (if mail is configured)
- Use "Reset Password" with token from email

## Files Included

- `Trektoo_Travel_Booking_API.postman_collection.json` - Complete Postman collection
- `api_documentation.md` - Detailed API documentation
- `README.md` - This quick start guide

## Environment Variables

Set these in Postman:
- `base_url`: `http://localhost:8000`
- `auth_token`: (automatically set after login)

## Database

The API uses PostgreSQL with these tables:
- `users` - User accounts
- `personal_access_tokens` - Sanctum tokens
- `password_reset_tokens` - Password reset tokens
- `cache`, `sessions`, `jobs` - Laravel system tables

## Email Configuration

Currently set to `log` driver in `.env`. To test email functionality:
1. Update `MAIL_MAILER` in `.env` to `smtp`
2. Configure SMTP settings
3. Or check `storage/logs/laravel.log` for email content

Happy testing! 🚀
