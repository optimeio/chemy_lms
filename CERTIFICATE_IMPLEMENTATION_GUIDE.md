# Certificate Implementation Guide - Chemy LMS

## Overview
This document describes the complete certificate system implementation for Chemy LMS, including frontend rendering and backend storage.

## Architecture

### Frontend Components
- **Dashboard.jsx**: Main student dashboard with certificate display
- **StudentDashboard.jsx**: Alternative student dashboard view

Both components include:
- CertificateCard component for rendering the certificate
- html2canvas integration for PNG generation
- API integration for saving certificate records

### Backend Services
- **Certificate Schema** (MongoDB): Stores certificate metadata
- **Local Fallback Storage** (JSON): `backend/data/certificates.json`
- **API Endpoints**:
  - `POST /api/certificates/save` - Save certificate when downloaded
  - `GET /api/certificates/user/:email` - Retrieve user's certificates
  - `POST /api/certificates/:id/mark-downloaded` - Track downloads

## Certificate Template

**Dimensions**: 1050px × 750px

**Layout Structure**:
```
┌─────────────────────────────────────────────┐
│  [Background: certificate-template.png]    │
│                                             │
│  Header Section (From background image):   │
│  - Golden border frame                      │
│  - TNSDC/College logos                      │
│  - "GOVERNMENT OF TAMIL NADU"              │
│  - "TAMIL NADU SKILL DEVELOPMENT CORP"     │
│                                             │
│  Content Area (Centered):                  │
│  - "THIS IS TO CERTIFY THAT"               │
│  - [STUDENT NAME]                          │
│  - of [DEPARTMENT]                         │
│  - studying in [COLLEGE]                   │
│  - has successfully completed...           │
│  - [COURSE TITLE]                          │
│  - conducted by TNSDC...                   │
│  - during the Academic Year [YEAR]         │
│                                             │
│  Bottom Section:                           │
│  - Training Duration: ___________          │
│  - Issue Date: [AUTO-FILLED]              │
│  - Managing Director, TNSDC [signature]   │
│  - *Eligible under Career Advancement...  │
└─────────────────────────────────────────────┘
```

**Padding**: 120px top, 80px sides, 100px bottom
**Font**: Serif (Georgia, Garamond, or system default)

## Certificate Data Flow

### 1. User Completes Course
```
User watches all videos → Completes mid-course quiz → Passes final quiz → 
Certificate generated → Green "Certificate Earned" banner displayed
```

### 2. User Downloads Certificate
```
Click "Download Certificate" button
  ↓
Frontend calls html2canvas with scale: 2
  ↓
PNG image created from certificate component
  ↓
Frontend sends POST /api/certificates/save with:
  - userEmail: user.email
  - userName: user.fullName
  - courseId: course._id or course.id
  - courseTitle: course.title
  ↓
Backend saves to MongoDB (with JSON fallback)
  ↓
PNG file downloaded to user's device
  ↓
Success logged in console
```

## API Endpoints

### POST /api/certificates/save
**Purpose**: Save certificate record when downloaded

**Request Body**:
```json
{
  "userEmail": "student@example.com",
  "userName": "John Doe",
  "courseId": "course_id_123",
  "courseTitle": "IoT with Arduino"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Certificate saved successfully",
  "data": {
    "certificateId": "cert_id_123"
  }
}
```

### GET /api/certificates/user/:email
**Purpose**: Retrieve all certificates for a user

**Query Parameters**:
- `email` (string): User's email address

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "cert_id_123",
      "userEmail": "student@example.com",
      "userName": "John Doe",
      "courseTitle": "IoT with Arduino",
      "issuedDate": "2025-08-13T00:00:00.000Z",
      "status": "downloaded",
      "downloadedAt": "2025-08-13T05:12:00.000Z"
    }
  ]
}
```

### POST /api/certificates/:id/mark-downloaded
**Purpose**: Update certificate status to downloaded

**Path Parameters**:
- `id` (string): Certificate ID

**Response**:
```json
{
  "success": true,
  "message": "Certificate marked as downloaded"
}
```

## Database Schema (MongoDB)

```javascript
{
  userId: ObjectId,
  userEmail: String,
  userName: String,
  courseId: String or ObjectId,
  courseTitle: String,
  issuedDate: Date (auto: now),
  downloadedAt: Date (null until downloaded),
  certificateData: Buffer (optional, for storing image),
  status: String ('generated' | 'downloaded'),
  createdAt: Date (auto: now),
  updatedAt: Date (auto: now)
}
```

## Local Storage (JSON Fallback)

**File**: `backend/data/certificates.json`

**Format**:
```json
[
  {
    "id": "cert_uuid_123",
    "userId": "user_123",
    "userEmail": "student@example.com",
    "userName": "John Doe",
    "courseId": "course_123",
    "courseTitle": "IoT with Arduino",
    "issuedDate": "2025-08-13T00:00:00.000Z",
    "status": "downloaded",
    "downloadedAt": "2025-08-13T05:12:00.000Z"
  }
]
```

## Frontend Integration

### Certificate Component Props
```javascript
<CertificateCard 
  user={{
    fullName: "John Doe",
    email: "john@example.com",
    department: "Computer Science",
    college: "College of Technology",
    year: "III Year"
  }}
  course={{
    _id: "course_123",
    title: "IoT with Arduino",
    id: "course_123"
  }}
/>
```

### CSS Styling

The certificate uses inline styles for maximum portability:
- **Font Family**: Serif (Georgia, Garamond)
- **Text Colors**: Black (#000) for main text, #333 for supporting text
- **Borders**: 1.5px solid black for underlines
- **Spacing**: flexbox with gap properties for consistent spacing
- **Alignment**: All text centered using CSS Grid and flexbox

### Download Handler

```javascript
const handleDownload = async () => {
  if (certificateRef.current) {
    try {
      // Generate PNG
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 2, 
        useCORS: true 
      });
      const imgData = canvas.toDataURL('image/png');
      
      // Download file
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${user.fullName}_${course.title}_Certificate.png`;
      link.click();
      
      // Save to backend
      await apiService.post('/certificates/save', {
        userEmail: user.email,
        userName: user.fullName,
        courseId: course._id || course.id,
        courseTitle: course.title
      });
      
      console.log('Certificate downloaded and saved');
    } catch (err) {
      console.error('Certificate error:', err);
    }
  }
};
```

## Testing Guide

### Prerequisites
1. Application running (`npm start`)
2. Backend running on port 5002
3. Frontend running on port 5175
4. MongoDB Atlas connected or local JSON fallback available

### Test Steps

#### 1. Complete a Course
```
1. Login as student
2. Navigate to Dashboard or StudentDashboard
3. Select a course
4. Watch all course videos
5. Pass mid-course quiz
6. Pass final assessment quiz
7. Verify "Certificate Earned" banner appears (green)
```

#### 2. Download Certificate
```
1. Click "Download Certificate" button
2. Verify PNG file downloads to Downloads folder
3. Check console for "Certificate downloaded" message
4. Check console for "Certificate record saved to backend" message
```

#### 3. Verify Backend Storage
```
1. Check backend logs for POST /api/certificates/save endpoint hit
2. Check MongoDB collection or backend/data/certificates.json
3. Verify certificate record contains all correct fields
```

#### 4. Retrieve Certificates
```
1. Call API: GET /api/certificates/user/student@example.com
2. Verify response contains all downloaded certificates
3. Verify certificates sorted by issue date (newest first)
```

### Example Test Data

**Student**:
- Email: john@example.com
- Full Name: John Doe
- Department: Computer Science
- College: Anna University
- Year: III Year

**Course**:
- Title: IoT with Arduino
- Status: Completed
- Mid-quiz: Passed
- Final-quiz: Passed

**Expected Certificate**:
- Issue Date: 2025-08-13 (current date)
- Academic Year: 2025-2026
- Status: downloaded
- Downloaded At: (timestamp of download)

## Troubleshooting

### Certificate Not Downloading
**Solution**: Check browser console for errors, verify html2canvas dependency installed

### Certificate Not Saving to Backend
**Solution**: Check backend logs for errors, verify API endpoint exists, check network tab for 200 status

### Text Overlapping
**Solution**: Check certificate dimensions (1050x750px), verify padding applied correctly, check font sizes

### MongoDB Connection Failed
**Solution**: System falls back to JSON storage automatically. Check `backend/data/certificates.json`

### Certificate Image Quality Poor
**Solution**: html2canvas scale set to 2 for high quality. Increase to 3 or 4 if needed in handleDownload function

## Future Enhancements

1. **Email Certificates**: Send certificate via email to student
2. **QR Code**: Add QR code for certificate verification
3. **Templates**: Support multiple certificate templates per institution
4. **Bulk Export**: Export multiple certificates as ZIP
5. **Digital Signature**: Add cryptographic signature verification
6. **Certificate Preview**: Modal preview before download
7. **Analytics**: Track certificate generation and download metrics

## References

- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [MongoDB Certificate Schema](https://www.mongodb.com/)
- [Express.js API Documentation](https://expressjs.com/)

## Support

For issues or questions regarding the certificate system, please:
1. Check console logs for error messages
2. Verify backend is running and MongoDB/JSON storage accessible
3. Ensure certificate template image exists at `/public/certificate-template.png`
4. Review API endpoint implementation in `backend/server.js`
