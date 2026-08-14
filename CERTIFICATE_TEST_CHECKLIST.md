# Certificate System - Quick Test Checklist

## ✅ Pre-Launch Verification

### Backend Setup
- [x] MongoDB connection working (connected to Atlas)
- [x] Certificate schema implemented in server.js
- [x] Local JSON fallback storage created
- [x] POST /api/certificates/save endpoint implemented
- [x] GET /api/certificates/user/:email endpoint implemented
- [x] POST /api/certificates/:id/mark-downloaded endpoint implemented
- [x] Server running on port 5002

### Frontend Setup
- [x] Dashboard.jsx updated with new certificate layout
- [x] StudentDashboard.jsx updated with new certificate layout
- [x] Certificate template image exists at /public/certificate-template.png
- [x] handleDownload function calls backend API
- [x] html2canvas configured with scale: 2, useCORS: true
- [x] Frontend running on port 5175

### CSS/Layout Verification
- [x] Certificate dimensions: 1050x750px
- [x] Padding: 120px top, 80px sides, 100px bottom
- [x] All text centered and properly aligned
- [x] No text overlapping issues
- [x] Font sizes: Title 11px, Name 26px, Course 14px, Supporting 12px
- [x] Proper line-heights: 1.2-1.8 for readability

## 🎓 Step-by-Step Test Flow

### Step 1: Login and Navigation
- [ ] Open http://localhost:5175
- [ ] Login with test student account
- [ ] Navigate to Dashboard or StudentDashboard
- [ ] Select a course

### Step 2: Course Completion
- [ ] Watch all course videos (or skip if available)
- [ ] Take mid-course quiz and pass
- [ ] Take final assessment quiz and pass
- [ ] Verify green "Certificate Earned" banner appears

### Step 3: Certificate Display
- [ ] Certificate appears with correct formatting
- [ ] Verify all text fields populated correctly:
  - Student Name: Displays correctly
  - Department: Shows correct department
  - College: Shows correct college
  - Course Title: Shows correct course name
  - Academic Year: Auto-calculated (should be 2025-2026)
  - Issue Date: Today's date in DD/MM/YYYY format

### Step 4: Certificate Download
- [ ] Click "Download Certificate" button
- [ ] Check browser console (F12 → Console tab)
- [ ] Verify message: "Certificate downloaded: [filename]"
- [ ] Verify message: "Certificate record saved to backend"
- [ ] Check Downloads folder for PNG file
- [ ] Verify filename format: "{StudentName}_{CourseName}_Certificate.png"

### Step 5: Backend Verification
- [ ] Check backend server console for POST request log
- [ ] Verify response: "Certificate saved successfully"
- [ ] Check MongoDB or backend/data/certificates.json
- [ ] Verify certificate record created with:
  - userEmail
  - userName
  - courseId
  - courseTitle
  - issuedDate (today)
  - status: "downloaded"
  - downloadedAt: (timestamp)

### Step 6: Certificate Retrieval
- [ ] Open browser Developer Tools (F12)
- [ ] Go to Console tab
- [ ] Run API test:
```javascript
fetch('http://localhost:5002/api/certificates/user/student@example.com')
  .then(r => r.json())
  .then(d => console.log(d))
```
- [ ] Verify response contains certificate array
- [ ] Verify certificate data matches what was saved

## 🔍 Visual Verification Checklist

### Text Alignment
- [ ] "THIS IS TO CERTIFY THAT" - centered, 11px, spaced
- [ ] Student Name - centered, 26px, bold, proper spacing above/below
- [ ] "of" - centered, 12px
- [ ] Department - centered, 13px, with minHeight for vertical centering
- [ ] "studying in" - centered, 12px
- [ ] College - centered, 13px, with minHeight for vertical centering
- [ ] Course completion text - centered, 12px
- [ ] Course Title - centered, 14px, bold
- [ ] TNSDC text - centered, 11-12px
- [ ] Training Duration label - left aligned, 11px bold
- [ ] Training Duration underline - 1.5px solid black
- [ ] Issue Date label - right aligned, 11px bold
- [ ] Issue Date value - right aligned, date value or underline
- [ ] Managing Director text - right aligned, 11px bold
- [ ] Career Advancement text - right aligned, 10px italic

### Spacing Verification
- [ ] Certificate has proper outer padding (120px top/bottom, 80px sides)
- [ ] Elements have consistent 18px gaps
- [ ] Bottom section has 20px gap between containers
- [ ] Training Duration and Issue Date have 50px gap
- [ ] No text running into borders
- [ ] Sufficient whitespace around all elements

### Color Verification
- [ ] Main text: Black (#000)
- [ ] Supporting text: Dark gray (#333)
- [ ] Borders: Black (#000)
- [ ] Background: certificate-template.png properly displayed

## 🐛 Troubleshooting Guide

### Issue: Certificate Not Showing
**Check**:
- [ ] Certificate template image exists
- [ ] Browser network tab shows image loading
- [ ] Canvas element rendering (Inspect Element)
- [ ] Console for errors

### Issue: Text Overlapping
**Check**:
- [ ] Certificate dimensions correct (1050x750px)
- [ ] Padding values applied (120px 80px 100px 80px)
- [ ] minHeight properties on text containers
- [ ] Font sizes not too large
- [ ] Line-heights appropriate (1.2-1.8)

### Issue: Download Not Working
**Check**:
- [ ] html2canvas library loaded
- [ ] Canvas ref properly assigned
- [ ] No CORS errors in console
- [ ] Browser allows downloads

### Issue: Backend Not Receiving Certificate
**Check**:
- [ ] Backend server running on port 5002
- [ ] Endpoint path: /api/certificates/save (not /certificates/save)
- [ ] Request body has all required fields
- [ ] Network tab shows POST request with 200 status
- [ ] MongoDB connected or JSON file writable

### Issue: Certificate Data Not Persisting
**Check**:
- [ ] MongoDB connection string correct
- [ ] User has write permissions to database
- [ ] backend/data/ directory writable
- [ ] certificates.json file exists and is valid JSON

## 📊 Performance Metrics

### Expected Timings
- [ ] Certificate render: < 1 second
- [ ] Canvas to PNG conversion: < 2 seconds
- [ ] Backend save: < 500ms
- [ ] Download starts: Immediately after save
- [ ] Total flow: < 3-4 seconds

### File Sizes
- [ ] Certificate PNG: 200-400KB (at scale 2)
- [ ] JSON file size per cert: ~500 bytes
- [ ] MongoDB document size: ~1-2KB

## 🚀 Success Criteria

✅ All items in this checklist completed
✅ Certificate displays with proper formatting
✅ Certificate downloads successfully as PNG
✅ Backend saves certificate record
✅ Certificate data retrievable via API
✅ No console errors
✅ No text overlapping
✅ All fields populated correctly
✅ Performance within expected timings

## 📝 Test Results Log

**Date**: ___________
**Tester**: ___________
**Browser**: ___________

### Test Run Summary
- Overall Status: [ ] PASS [ ] FAIL
- Issues Found: ___________
- Screenshots Attached: [ ] Yes [ ] No
- Logs Attached: [ ] Yes [ ] No

### Notes
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
