# Trektoo Travel Booking API Documentation

## Overview
This API provides authentication and user management functionality for the Trektoo Travel Booking application. It uses Laravel Sanctum for token-based authentication and PostgreSQL as the database.

## Base URL
```
http://localhost:8000/api
```

## Authentication
The API uses Bearer token authentication. Include the token in the Authorization header:
```
Authorization: Bearer {your_token}
```

## API Endpoints

### 1. Register User
**POST** `/api/register`

Creates a new user account and sends a welcome email.

#### Request Body
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

#### Request Headers
```
Content-Type: application/json
Accept: application/json
```

#### Validation Rules
- `name`: required, string, max 255 characters
- `email`: required, valid email, unique, max 255 characters
- `password`: required, string, minimum 8 characters
- `password_confirmation`: required, must match password

#### Success Response (201)
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "email_verified_at": null,
            "created_at": "2025-09-15T01:58:50.000000Z",
            "updated_at": "2025-09-15T01:58:50.000000Z"
        },
        "token": "1|abcdef1234567890...",
        "token_type": "Bearer"
    }
}
```

#### Error Response (422)
```json
{
    "success": false,
    "message": "Validation errors",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password confirmation does not match."]
    }
}
```

---

### 2. Login User
**POST** `/api/login`

Authenticates a user and returns an access token.

#### Request Body
```json
{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

#### Request Headers
```
Content-Type: application/json
Accept: application/json
```

#### Validation Rules
- `email`: required, valid email
- `password`: required

#### Success Response (200)
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "email_verified_at": null,
            "created_at": "2025-09-15T01:58:50.000000Z",
            "updated_at": "2025-09-15T01:58:50.000000Z"
        },
        "token": "2|abcdef1234567890...",
        "token_type": "Bearer"
    }
}
```

#### Error Response (401)
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

---

### 3. Get User Profile
**GET** `/api/profile`

Returns the authenticated user's profile information.

#### Request Headers
```
Accept: application/json
Authorization: Bearer {your_token}
```

#### Success Response (200)
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "email_verified_at": null,
            "created_at": "2025-09-15T01:58:50.000000Z",
            "updated_at": "2025-09-15T01:58:50.000000Z"
        }
    }
}
```

#### Error Response (401)
```json
{
    "message": "Unauthenticated."
}
```

---

### 4. Logout User
**POST** `/api/logout`

Revokes the current authentication token.

#### Request Headers
```
Accept: application/json
Authorization: Bearer {your_token}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

#### Error Response (401)
```json
{
    "message": "Unauthenticated."
}
```

---

### 5. Forgot Password
**POST** `/api/forgot-password`

Sends a password reset link to the user's email address.

#### Request Body
```json
{
    "email": "john.doe@example.com"
}
```

#### Request Headers
```
Content-Type: application/json
Accept: application/json
```

#### Validation Rules
- `email`: required, valid email

#### Success Response (200)
```json
{
    "success": true,
    "message": "Password reset link sent to your email"
}
```

#### Error Response (404)
```json
{
    "success": false,
    "message": "User not found"
}
```

#### Error Response (422)
```json
{
    "success": false,
    "message": "Validation errors",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

---

### 6. Reset Password
**POST** `/api/reset-password`

Resets the user's password using the token from the email.

#### Request Body
```json
{
    "token": "reset_token_from_email",
    "email": "john.doe@example.com",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

#### Request Headers
```
Content-Type: application/json
Accept: application/json
```

#### Validation Rules
- `token`: required
- `email`: required, valid email
- `password`: required, string, minimum 8 characters
- `password_confirmation`: required, must match password

#### Success Response (200)
```json
{
    "success": true,
    "message": "Password reset successfully"
}
```

#### Error Response (400)
```json
{
    "success": false,
    "message": "Invalid or expired reset token"
}
```

#### Error Response (422)
```json
{
    "success": false,
    "message": "Validation errors",
    "errors": {
        "password": ["The password confirmation does not match."]
    }
}
```

---

## Testing with Postman

### Setup Instructions

1. **Import Collection**
   - Open Postman
   - Click "Import" button
   - Select the `Trektoo_Travel_Booking_API.postman_collection.json` file
   - The collection will be imported with all endpoints

2. **Configure Environment Variables**
   - Set `base_url` to `http://localhost:8000`
   - The `auth_token` will be automatically set when you login

3. **Testing Flow**
   
   **Step 1: Register a new user**
   - Use the "Register User" endpoint
   - Copy the `token` from the response
   - Set it as the `auth_token` variable in Postman
   
   **Step 2: Test protected endpoints**
   - Use "Get User Profile" to test authentication
   - Use "Logout User" to revoke the token
   
   **Step 3: Test password reset flow**
   - Use "Forgot Password" to send reset email
   - Check your email for the reset token
   - Use "Reset Password" with the token

### Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:8000` |
| `auth_token` | Bearer token for authentication | `1|abcdef1234567890...` |

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

### Error Response Format

All error responses follow this format:
```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field_name": ["Error message"]
    }
}
```

### Success Response Format

All success responses follow this format:
```json
{
    "success": true,
    "message": "Success message",
    "data": {
        // Response data
    }
}
```

## Notes

- All passwords are automatically hashed using bcrypt
- Tokens are generated using Laravel Sanctum
- Email notifications are sent for welcome and password reset
- All API responses are in JSON format
- The API uses PostgreSQL database
- CORS is configured for cross-origin requests

## Support

For any issues or questions, please check the Laravel logs or contact the development team.
