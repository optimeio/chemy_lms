# Password Reset & OTP Verification Setup Guide

## Overview
This guide explains how to set up the password reset and OTP email verification system for the Chemy LMS application.

## Features Implemented
✅ Forgot Password functionality  
✅ OTP (One-Time Password) generation and email delivery  
✅ OTP verification with expiry (10 minutes)  
✅ Password reset with validation  
✅ Works for Students, Trainers, and Company users  

## Prerequisites
- Node.js backend running on port 5000
- Gmail account (for email service)
- React frontend running on localhost:3000

## Quick Setup Instructions

### Step 1: Gmail App Password Configuration

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the prompts to enable it

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device type)
   - Click "Generate"
   - Copy the 16-character password provided

3. **Create .env file** in the backend directory:
   ```
   cp .env.example .env
   ```

4. **Update .env with your email credentials**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```

### Step 2: Install Dependencies
The backend already has `nodemailer` installed. If not, run:
```bash
cd backend
npm install nodemailer
```

### Step 3: Start the Backend
```bash
cd backend
npm start
```

You should see:
```
✅ Email service is ready
🚀 Server is running on http://localhost:5000
```

### Step 4: Start the Frontend
```bash
cd frontend
npm run dev
```

## How It Works

### User Flow
1. **User clicks "Forgot Password"** on the login page
2. **Enters email address** and clicks "Send OTP"
3. **Backend generates OTP** and sends email
4. **User receives OTP** in their Gmail inbox
5. **User enters 6-digit OTP** on verification page
6. **Verifies OTP** and proceeds to password reset
7. **Enters new password** (8+ characters, with letters and numbers)
8. **Password is updated** in the database
9. **User logs in** with new password

### API Endpoints

#### 1. Request OTP
**POST** `/api/auth/forgot-password`
```json
{
  "email": "student@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP has been sent to your email address."
}
```

#### 2. Verify OTP
**POST** `/api/auth/verify-otp`
```json
{
  "email": "student@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP verified successfully."
}
```

#### 3. Reset Password
**POST** `/api/auth/reset-password`
```json
{
  "email": "student@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please log in with your new password."
}
```

## Password Requirements
- Minimum 8 characters
- Must contain at least one letter (A-Z, a-z)
- Must contain at least one number (0-9)

## OTP Details
- Valid for 10 minutes after generation
- 6-digit numeric code
- Can be resent by clicking "Resend OTP"
- Expires automatically after 10 minutes

## User Roles Supported
✅ Students  
✅ Trainers  
✅ Company users  
✅ All users with email in the system  

## Troubleshooting

### Issue: "Email service configuration issue"
**Solution**: 
- Check .env file is created with EMAIL_USER and EMAIL_PASSWORD
- Verify the app password (not regular Gmail password)
- Ensure 2-Factor Authentication is enabled on Gmail

### Issue: "Failed to send OTP email"
**Solution**:
- Check internet connection
- Verify email credentials in .env
- Check Gmail account for security alerts
- Try accessing https://myaccount.google.com/lesssecureapps
- If using Gmail, ensure app password is 16 characters

### Issue: OTP not received in inbox
**Solution**:
- Check Spam/Junk folder
- Wait 1-2 minutes (email delivery may be slow)
- Verify the email address is correct
- Try resending OTP

### Issue: "OTP has expired"
**Solution**:
- OTP is valid for 10 minutes only
- Click "Resend OTP" to get a new one
- Complete the process within 10 minutes

## Advanced Configuration

### Using Alternative Email Services

#### SendGrid
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
```

#### AWS SES
```env
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

#### Brevo (Sendinblue)
```env
EMAIL_SERVICE=brevo
BREVO_API_KEY=your_brevo_api_key
```

## Production Deployment

For production, it's recommended to:
1. Use a transactional email service (SendGrid, AWS SES, etc.)
2. Store OTPs in a Redis cache instead of memory
3. Implement rate limiting on the forgot-password endpoint
4. Add email verification during registration
5. Log all password reset attempts for security audit

## Testing

### Manual Testing Steps
1. Go to http://localhost:3000/forgot-password
2. Enter a registered email address
3. Click "Send OTP"
4. Check your email for the 6-digit OTP
5. Enter the OTP on the verification page
6. Set a new password (must have letters and numbers, 8+ chars)
7. Login with the new password

### Automated Testing
For each user type:
- Student: Use a student account
- Trainer: Use a trainer account
- Company: Use a company account

All users follow the same password reset flow.

## Security Best Practices
✅ OTP expires after 10 minutes  
✅ OTP is single-use (cleared after use)  
✅ Password must be 8+ characters with mixed content  
✅ Email is verified before allowing password reset  
✅ OTP is stored server-side (not sent to client except for display)  

## Support
For issues or questions, please refer to the main README.md or contact the development team.
