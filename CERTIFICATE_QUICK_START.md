# Certificate System - Quick Start Guide

## 🚀 Start Application

```bash
cd c:\Users\thara\chemy_lms
npm start
```

**Expected Output**:
```
✅ Frontend running on http://localhost:5175
✅ Backend running on http://localhost:5002
✅ MongoDB connected (or JSON fallback active)
```

## 📋 Test Certificate Flow (5 minutes)

### Step 1: Login (30 seconds)
1. Open http://localhost:5175
2. Login with test student account
3. Navigate to Dashboard or StudentDashboard

### Step 2: Course Preparation (2 minutes)
1. Select any course
2. Skip/complete course videos
3. Pass mid-course quiz
4. Pass final assessment quiz
5. **Expected**: Green "Certificate Earned" banner appears

### Step 3: Generate Certificate (1 minute)
1. Click "Download Certificate" button
2. **Expected**: 
   - PNG file downloads to Downloads folder
   - Browser console shows: "Certificate downloaded: [filename]"
   - Browser console shows: "Certificate record saved to backend"
   - File format: `{StudentName}_{CourseName}_Certificate.png`

### Step 4: Verify Backend (1.5 minutes)
1. Check backend console for POST request
2. Check MongoDB or `backend/data/certificates.json`
3. Look for new certificate record with:
   - userEmail ✓
   - userName ✓
   - courseId ✓
   - courseTitle ✓
   - issuedDate ✓
   - status: "downloaded" ✓

## 🧪 Quick API Tests

### Test 1: Save Certificate
```bash
curl -X POST http://localhost:5002/api/certificates/save \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "test@example.com",
    "userName": "Test Student",
    "courseId": "course_123",
    "courseTitle": "IoT with Arduino"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Certificate saved successfully.",
  "certificateId": "id_value"
}
```

### Test 2: Retrieve Certificates
```bash
curl http://localhost:5002/api/certificates/user/test@example.com
```

**Expected Response**:
```json
{
  "success": true,
  "certificates": [
    {
      "id": "CERT_...",
      "userEmail": "test@example.com",
      "userName": "Test Student",
      "courseTitle": "IoT with Arduino",
      "issuedDate": "2025-08-13T...",
      "status": "generated"
    }
  ]
}
```

### Test 3: Mark as Downloaded
```bash
curl -X POST http://localhost:5002/api/certificates/{CERTIFICATE_ID}/mark-downloaded \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Certificate marked as downloaded",
  "certificate": { /* updated certificate */ }
}
```

## 📊 Certificate File Structure

### Generated PNG File
- **Format**: PNG image
- **Size**: ~350KB (2x scale for high quality)
- **Resolution**: 2100×1500px (1050×750px × 2)
- **Filename**: `{StudentName}_{CourseName}_Certificate.png`
- **Quality**: 300 DPI equivalent (good for printing)

### Backend Storage - MongoDB
```json
{
  "_id": ObjectId,
  "userId": "user_email",
  "userEmail": "student@example.com",
  "userName": "Student Name",
  "courseId": "course_123",
  "courseTitle": "Course Title",
  "issuedDate": "2025-08-13T12:00:00.000Z",
  "downloadedAt": "2025-08-13T12:05:00.000Z",
  "status": "downloaded",
  "createdAt": "2025-08-13T12:00:00.000Z",
  "updatedAt": "2025-08-13T12:05:00.000Z"
}
```

### Backend Storage - JSON Fallback
**File**: `backend/data/certificates.json`
```json
[
  {
    "id": "CERT_1692432000000_abc123",
    "userId": "student@example.com",
    "userEmail": "student@example.com",
    "userName": "Student Name",
    "courseId": "course_123",
    "courseTitle": "Course Title",
    "issuedDate": "2025-08-13T12:00:00.000Z",
    "status": "generated",
    "downloadedAt": null
  }
]
```

## 🔧 Configuration

### Certificate Component Props (Frontend)
```javascript
<CertificateCard 
  user={{
    fullName: "John Doe",
    email: "john@example.com",
    department: "Computer Science",
    college: "Anna University",
    year: "III Year"
  }}
  course={{
    _id: "course_123",
    title: "IoT with Arduino",
    id: "course_123"
  }}
/>
```

### Environment Variables (Backend)
```env
# .env file in backend/ folder
MONGO_URI=your_mongodb_connection_string
PORT=5000  # Backend will find alternative if busy
```

### Certificate Image Template
**Location**: `frontend/public/certificate-template.png`
- Size: 1050×750px
- Format: PNG
- Shows: Official TNSDC certificate design with logos and borders

## 📱 Responsive Testing

### Desktop (1050×750px)
- ✅ Full certificate display
- ✅ All text clearly visible
- ✅ Professional appearance
- ✅ Print-ready quality

### Tablet (~70-90% scale)
- ✅ Certificate readable
- ✅ Most content visible
- ✅ Text may wrap for long names

### Mobile (~50-60% scale)
- ✅ Preview only
- ✅ Not recommended for printing
- ✅ For display on mobile devices

## 🐛 Common Issues & Quick Fixes

### Issue: Certificate not downloading
**Fix**: Check browser console (F12) for errors, verify html2canvas loaded

### Issue: Backend API not responding
**Fix**: Ensure backend running on port 5002, check firewall settings

### Issue: Certificate text overlapping
**Fix**: Check certificate dimensions (1050×750px), verify padding applied

### Issue: MongoDB connection failed
**Fix**: System automatically falls back to JSON storage, check backend logs

### Issue: Missing certificate template image
**Fix**: Ensure `/public/certificate-template.png` exists in frontend folder

## 📞 Support

### Check Logs
```bash
# Backend console
npm start  # Backend logs display here

# Browser console
F12 → Console tab → Check for errors

# Certificate data
cat backend/data/certificates.json  # View saved certificates
```

### Verify Connectivity
```bash
# Test backend
curl http://localhost:5002/health  # Or any endpoint

# Test frontend
curl http://localhost:5175  # Should return HTML

# Test MongoDB
mongo "mongodb+srv://..." --eval "db.certificates.find()"
```

## ✅ Success Checklist

- [ ] Application starts without errors
- [ ] Backend runs on port 5002
- [ ] Frontend runs on port 5175
- [ ] Can login to dashboard
- [ ] Can complete course and quizzes
- [ ] Certificate banner appears
- [ ] Can download certificate
- [ ] PNG file created in Downloads
- [ ] Backend console shows POST request
- [ ] Certificate record in MongoDB/JSON
- [ ] API endpoints respond correctly

## 🎓 Next Steps

1. **For Students**: Complete courses to earn certificates
2. **For Admins**: Monitor certificate generation in logs
3. **For Developers**: 
   - Review CERTIFICATE_IMPLEMENTATION_GUIDE.md for technical details
   - Check CERTIFICATE_TEST_CHECKLIST.md for comprehensive testing
   - See CERTIFICATE_LAYOUT_DESIGN_REFERENCE.md for design specs

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| CERTIFICATE_SYSTEM_COMPLETE.md | Complete overview and architecture |
| CERTIFICATE_IMPLEMENTATION_GUIDE.md | Technical implementation details |
| CERTIFICATE_TEST_CHECKLIST.md | 50+ item testing checklist |
| CERTIFICATE_LAYOUT_DESIGN_REFERENCE.md | Visual design and spacing specs |

---

**Version**: 1.0  
**Last Updated**: August 13, 2025  
**Status**: ✅ Production Ready
