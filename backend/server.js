const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { execSync } = require('child_process');
const net = require('net');
const nodemailer = require('nodemailer');
require('dotenv').config();

const tnskillService = require('./services/tnskillService');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_ATTEMPTS = 10;
let PORT = DEFAULT_PORT;
let serverStarted = false;
let server;

// Middleware — handle CORS preflight explicitly
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-key', 'x-client-secret'],
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// ============ OTP & Password Reset Configuration ============
// Store OTPs in memory (expires after 10 minutes)
const otpStorage = new Map();

// Email transporter configuration
// Using Gmail SMTP - Update with environment variables for production
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password', // Use Gmail App Password
  },
});

// Verify email configuration only if credentials exist
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  emailTransporter.verify((error, success) => {
    if (error) {
      console.warn('⚠️  Email service configuration issue:', error.message);
      console.log('   Password reset emails will not be sent. Configure SMTP_USER and SMTP_PASS in .env');
    } else {
      console.log('✅ Email service is ready');
    }
  });
} else {
  console.log('ℹ️  SMTP credentials not found in .env. Password reset emails will be skipped.');
}

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@chemylms.com',
      to: email,
      subject: 'Password Reset OTP - Chemy LMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="color: #666; font-size: 14px;">Hi,</p>
          <p style="color: #666; font-size: 14px;">You requested to reset your password. Use the OTP below to proceed:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #007bff; letter-spacing: 2px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #999; font-size: 12px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© Chemy LMS - Learning Management System</p>
        </div>
      `,
    };
    
    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Uploads directory configuration
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// Fallback data file setup
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');

const DEFAULT_COURSES = [];

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(COURSES_FILE)) {
  fs.writeFileSync(COURSES_FILE, JSON.stringify(DEFAULT_COURSES, null, 2));
}

// Read/write local users fallback
const getLocalUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveLocalUser = (user) => {
  const users = getLocalUsers();
  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const getLocalCourses = () => {
  try {
    const data = fs.readFileSync(COURSES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveLocalCourses = (courses) => {
  fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2));
};

// Schema definition (only used if MongoDB is active)
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  year: { type: String, required: true, enum: ['I Year', 'II Year', 'III Year', 'IV Year'] },
  district: { type: String, required: true },
  college: { type: String, required: true },
  department: { type: String, required: true },
  profileImage: { type: String, default: '' },
  assignedCourses: { type: [String], default: [] },
  progress: {
    type: [{
      courseId: String,
      watchedVideos: { type: [String], default: [] },
      midCourseQuizCompleted: { type: Boolean, default: false },
      finalQuizCompleted: { type: Boolean, default: false }
    }],
    default: []
  },
  createdAt: { type: Date, default: Date.now }
});

let User;
try {
  User = mongoose.model('User', userSchema);
} catch (err) {
  User = mongoose.models.User;
}

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseCode: { type: String },
  trainerName: { type: String },
  category: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  image: { type: String }, // path to static image file
  content: { type: String, required: true },
  ppts: [{ url: String, name: String }],
  videos: [{ url: String, name: String }],
  midCourseQuiz: [{
    question: String,
    options: [String],
    correctOptionIndex: Number
  }],
  finalAssessmentQuiz: [{
    question: String,
    options: [String],
    correctOptionIndex: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

let Course;
try {
  Course = mongoose.model('Course', courseSchema);
} catch (err) {
  Course = mongoose.models.Course;
}

// Database Connection
let isMongoConnected = false;
const LOCAL_MONGO_URI = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/chemy_lms';
const MONGO_URI = process.env.MONGO_URI;
const ATLAS_DIRECT_URI = process.env.ATLAS_DIRECT_URI;

mongoose.set('strictQuery', true);

const connectWithMongo = async (uri) => {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  console.log(`MongoDB connected: ${uri}`);
  isMongoConnected = true;
  try {
    const count = await Course.countDocuments();
    if (count === 0) {
      await Course.insertMany(DEFAULT_COURSES.map(({ id, ...c }) => c));
      console.log('Default courses initialized in MongoDB.');
    }
  } catch (err) {
    console.error('Error initializing default courses:', err);
  }
};

const tryMongoConnections = async () => {
  const errors = [];

  if (MONGO_URI) {
    try {
      console.log('Attempting MongoDB Atlas connection via MONGO_URI...');
      await connectWithMongo(MONGO_URI);
      return;
    } catch (err) {
      errors.push({ uri: 'MONGO_URI', message: err.message });
      console.error('Atlas connection failed:', err.message || err);
    }
  }

  if (MONGO_URI?.startsWith('mongodb+srv') && ATLAS_DIRECT_URI) {
    try {
      console.log('SRV connection failed; trying direct Atlas URI...');
      await connectWithMongo(ATLAS_DIRECT_URI);
      return;
    } catch (err) {
      errors.push({ uri: 'ATLAS_DIRECT_URI', message: err.message });
      console.error('Direct Atlas connection failed:', err.message || err);
      if (err.message && err.message.includes('whitelist')) {
        console.error('Atlas error suggests IP access is blocked. Confirm the current IP is allowed in Atlas Network Access.');
      }
    }
  }

  try {
    console.log('Attempting local MongoDB connection...');
    await connectWithMongo(LOCAL_MONGO_URI);
    return;
  } catch (err) {
    errors.push({ uri: 'LOCAL_MONGO_URI', message: err.message });
    console.error('Local MongoDB connection failed:', err.message || err);
  }

  if (!isMongoConnected) {
    console.log('MongoDB unavailable — using local JSON storage.');
    console.table(errors);
    try { await mongoose.disconnect(); } catch (_) { /* ignore */ }
  }
};

(async () => {
  await tryMongoConnections();
  await startServer();
})();

// Helper validation functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/; // Standard 10 digit Indian mobile numbers
  return re.test(phone);
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword, gender, year, district, college, department } = req.body;

    // Field validations
    const errors = {};
    if (!fullName || fullName.trim().length < 3) {
      errors.fullName = 'Full Name must be at least 3 characters.';
    }
    if (!email || !validateEmail(email)) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!phone || !validatePhone(phone)) {
      errors.phone = 'Please provide a valid 10-digit mobile number.';
    }
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain both letters and numbers.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
      errors.gender = 'Please select a valid gender.';
    }
    if (!year || !['I Year', 'II Year', 'III Year', 'IV Year'].includes(year)) {
      errors.year = 'Please select your academic year.';
    }
    if (!college || college.trim() === '') {
      errors.college = 'College selection is required.';
    }
    if (!department || department.trim() === '') {
      errors.department = 'Department selection is required.';
    }
    
    const validDistricts = [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
      'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
      'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
      'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
      'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
      'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
      'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
      'Vellore', 'Viluppuram', 'Virudhunagar'
    ];
    if (!district || !validDistricts.includes(district)) {
      errors.district = 'Please select a valid district from the list.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Check if user already exists
    if (isMongoConnected) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, errors: { email: 'Email is already registered.' } });
      }

      // Create new user in Mongo
      const newUser = new User({ fullName, email, phone, password, gender, year, district, college, department, role: 'Student', dashboard: 'a', assignedCourses: [], progress: [] });
      await newUser.save();
      return res.status(201).json({
        success: true,
        message: 'Registration successful!',
        user: { fullName, email, college, department, role: 'Student', dashboard: 'a' },
      });
    } else {
      const localUsers = getLocalUsers();
      if (localUsers.some(u => u.email === email)) {
        return res.status(400).json({ success: false, errors: { email: 'Email is already registered.' } });
      }

      const newUser = {
        fullName,
        email,
        phone,
        password,
        gender,
        year,
        district,
        college,
        department,
        role: 'Student',
        dashboard: 'a',
        assignedCourses: [],
        progress: [],
        createdAt: new Date(),
      };
      saveLocalUser(newUser);
      return res.status(201).json({
        success: true,
        message: 'Registration successful (stored locally)!',
        user: { fullName, email, college, department, role: 'Student', dashboard: 'a' },
      });
    }

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const email = rawEmail ? rawEmail.trim() : undefined;
    const { password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: 'Email and password are required.' });
    }

    // Hardcoded admin account
    if (
      (email === 'admin@chemylms.com' && password === 'admin123') ||
      (email === 'chemylms@gmail.com' && (password === 'CHEMYLMS@2026' || password === '-n CHEMYLMS@2026')) ||
      (email === 'thesmgroups@gmail.com' && password === 'TSMGPVT@2026')
    ) {
      return res.json({
        success: true,
        message: 'Login successful!',
        user: { fullName: 'Admin', email, role: 'Super Admin', dashboard: 'd' },
      });
    }

    let user = null;
    if (isMongoConnected) {
      user = await User.findOne({ email });
    }
    
    // Fallback to local users if not found in Mongo
    if (!user) {
      const localUsers = getLocalUsers();
      user = localUsers.find(u => u.email === email);
    }

    if (!user || user.password !== password) {
      return res.json({ success: false, message: 'Invalid email or password.' });
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      user: {
        fullName: user.fullName,
        email: user.email,
        college: user.college,
        department: user.department,
        role: user.role || 'Student',
        dashboard: user.dashboard || 'a',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
});

// ============ PASSWORD RESET & OTP ROUTES ============

// Forgot Password - Generate and send OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // Check if user exists
    let userExists = false;

    if (isMongoConnected) {
      const user = await User.findOne({ email });
      userExists = !!user;
    } else {
      const localUsers = getLocalUsers();
      userExists = localUsers.some(u => u.email === email);
    }

    if (!userExists) {
      // Security: Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If this email exists in our system, you will receive an OTP shortly.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStorage.set(email, { otp, expiryTime });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      console.log(`Email failed to send. Fallback OTP for ${email}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'OTP processed. For testing, use the code provided.',
      otp: otp // Included for testing so it's always received
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const storedOtpData = otpStorage.get(email);

    if (!storedOtpData) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new OTP.' });
    }

    const { otp: storedOtp, expiryTime } = storedOtpData;

    // Check if OTP has expired
    if (Date.now() > expiryTime) {
      otpStorage.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    // Verify OTP
    if (otp !== storedOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ success: false, message: 'An error occurred during verification.' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password must contain both letters and numbers.' });
    }

    // Verify OTP first
    const storedOtpData = otpStorage.get(email);

    if (!storedOtpData) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new OTP.' });
    }

    const { otp: storedOtp, expiryTime } = storedOtpData;

    if (Date.now() > expiryTime) {
      otpStorage.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    if (otp !== storedOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Password reset failed.' });
    }

    // OTP verified - Now reset password
    if (isMongoConnected) {
      const user = await User.findOneAndUpdate(
        { email },
        { password: newPassword },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Clear OTP after successful reset
      otpStorage.delete(email);

      return res.json({
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.',
      });
    } else {
      const localUsers = getLocalUsers();
      const index = localUsers.findIndex(u => u.email === email);

      if (index === -1) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      localUsers[index].password = newPassword;
      fs.writeFileSync(USERS_FILE, JSON.stringify(localUsers, null, 2));

      // Clear OTP after successful reset
      otpStorage.delete(email);

      return res.json({
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.',
      });
    }
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ success: false, message: 'An error occurred during password reset.' });
  }
});

// File Upload helper functions
const saveUploadedFile = (base64Data, originalName) => {
  if (!base64Data || !originalName) return null;
  try {
    if (base64Data.startsWith('/uploads/')) {
      return base64Data;
    }
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return null;
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving uploaded file:', err);
    return null;
  }
};

const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  try {
    const filename = path.basename(fileUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
};

// API Key Authentication Middleware
const apiKeyAuth = (req, res, next) => {
  const clientKey = req.headers['x-client-key'];
  const clientSecret = req.headers['x-client-secret'];

  if (clientKey === process.env.CLIENT_KEY && clientSecret === process.env.CLIENT_SECRET) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Keys' });
  }
};

// TNSkill Test Endpoint
app.get('/api/tnskill/test', apiKeyAuth, async (req, res) => {
  try {
    // This will automatically fetch the token if missing, or refresh if expired
    const token = await tnskillService.authenticate();
    res.json({ success: true, message: 'TNSkill Authentication successful', token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'TNSkill Authentication failed', error: error.message });
  }
});

// Course Endpoints
app.get('/api/courses', apiKeyAuth, async (req, res) => {
  try {
    if (isMongoConnected) {
      const courses = await Course.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, courses });
    } else {
      const courses = getLocalCourses();
      return res.json({ success: true, courses });
    }
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ success: false, message: 'Server error fetching courses.' });
  }
});

app.post('/api/admin/courses', apiKeyAuth, upload.any(), async (req, res) => {
  try {
    const { title, courseCode, trainerName, category, status, image, content, ppts, videos, midCourseQuiz, finalAssessmentQuiz } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    let imagePath = image || '';
    const imageFile = req.files && req.files.find(f => f.fieldname === 'imageFile');
    if (imageFile) {
      imagePath = `/uploads/${imageFile.filename}`;
    }

    const pptsArray = ppts ? JSON.parse(ppts) : [];
    const processedPpts = pptsArray.slice(0, 12).map((p, i) => {
      if (p.isRawFile) {
        const file = req.files && req.files.find(f => f.fieldname === `pptFile_${i}`);
        return file ? { url: `/uploads/${file.filename}`, name: p.name } : null;
      }
      return { url: p.url, name: p.name };
    }).filter(p => p && p.url);

    const videosArray = videos ? JSON.parse(videos) : [];
    const processedVideos = videosArray.slice(0, 12).map((v, i) => {
      if (v.isRawFile) {
        const file = req.files && req.files.find(f => f.fieldname === `videoFile_${i}`);
        return file ? { url: `/uploads/${file.filename}`, name: v.name } : null;
      }
      return { url: v.url, name: v.name };
    }).filter(v => v && v.url);

    const courseData = {
      title,
      courseCode,
      trainerName,
      category,
      status: status || 'published',
      image: imagePath,
      content,
      ppts: processedPpts,
      videos: processedVideos,
      midCourseQuiz: midCourseQuiz ? JSON.parse(midCourseQuiz) : [],
      finalAssessmentQuiz: finalAssessmentQuiz ? JSON.parse(finalAssessmentQuiz) : [],
      createdAt: new Date()
    };

    if (isMongoConnected) {
      const newCourse = new Course(courseData);
      await newCourse.save();
      return res.status(201).json({ success: true, message: 'Course created successfully!', course: newCourse });
    } else {
      const localCourses = getLocalCourses();
      const newId = String(localCourses.length > 0 ? Math.max(...localCourses.map(c => Number(c.id || 0))) + 1 : 1);
      const newCourse = { id: newId, ...courseData };
      localCourses.push(newCourse);
      saveLocalCourses(localCourses);
      return res.status(201).json({ success: true, message: 'Course created locally!', course: newCourse });
    }
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ success: false, message: 'Server error creating course.' });
  }
});

app.put('/api/admin/courses/:id', apiKeyAuth, upload.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, courseCode, trainerName, category, status, image, content, ppts, videos, midCourseQuiz, finalAssessmentQuiz } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    let imagePath = image || '';
    const imageFile = req.files && req.files.find(f => f.fieldname === 'imageFile');
    if (imageFile) {
      imagePath = `/uploads/${imageFile.filename}`;
    }

    const pptsArray = ppts ? JSON.parse(ppts) : [];
    const processedPpts = pptsArray.slice(0, 12).map((p, i) => {
      if (p.isRawFile) {
        const file = req.files && req.files.find(f => f.fieldname === `pptFile_${i}`);
        return file ? { url: `/uploads/${file.filename}`, name: p.name } : null;
      }
      return { url: p.url, name: p.name };
    }).filter(p => p && p.url);

    const videosArray = videos ? JSON.parse(videos) : [];
    const processedVideos = videosArray.slice(0, 12).map((v, i) => {
      if (v.isRawFile) {
        const file = req.files && req.files.find(f => f.fieldname === `videoFile_${i}`);
        return file ? { url: `/uploads/${file.filename}`, name: v.name } : null;
      }
      return { url: v.url, name: v.name };
    }).filter(v => v && v.url);

    if (isMongoConnected) {
      const existing = await Course.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }

      if (imagePath && imagePath !== existing.image && existing.image) {
        deleteUploadedFile(existing.image);
      }

      existing.title = title;
      existing.courseCode = courseCode;
      existing.trainerName = trainerName;
      existing.category = category;
      existing.status = status || existing.status;
      existing.image = imagePath || existing.image;
      existing.content = content;
      existing.ppts = processedPpts;
      existing.videos = processedVideos;
      existing.midCourseQuiz = midCourseQuiz ? JSON.parse(midCourseQuiz) : [];
      existing.finalAssessmentQuiz = finalAssessmentQuiz ? JSON.parse(finalAssessmentQuiz) : [];

      await existing.save();
      return res.json({ success: true, message: 'Course updated successfully!', course: existing });
    } else {
      const localCourses = getLocalCourses();
      const idx = localCourses.findIndex(c => String(c.id) === String(id));
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }

      const existing = localCourses[idx];

      if (imagePath && imagePath !== existing.image && existing.image) {
        deleteUploadedFile(existing.image);
      }

      localCourses[idx] = {
        ...existing,
        title,
        courseCode,
        trainerName,
        category,
        status: status || existing.status,
        image: imagePath || existing.image,
        content,
        ppts: processedPpts,
        videos: processedVideos,
        midCourseQuiz: midCourseQuiz ? JSON.parse(midCourseQuiz) : [],
        finalAssessmentQuiz: finalAssessmentQuiz ? JSON.parse(finalAssessmentQuiz) : []
      };

      saveLocalCourses(localCourses);
      return res.json({ success: true, message: 'Course updated locally!', course: localCourses[idx] });
    }
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ success: false, message: 'Server error updating course.' });
  }
});

app.delete('/api/admin/courses/:id', apiKeyAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const deleted = await Course.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }
      deleteUploadedFile(deleted.image);
      deleteUploadedFile(deleted.ppt);
      deleteUploadedFile(deleted.video);
      return res.json({ success: true, message: 'Course deleted successfully!' });
    } else {
      const localCourses = getLocalCourses();
      const idx = localCourses.findIndex(c => String(c.id) === String(id));
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }
      const deleted = localCourses.splice(idx, 1)[0];
      saveLocalCourses(localCourses);

      deleteUploadedFile(deleted.image);
      deleteUploadedFile(deleted.ppt);
      deleteUploadedFile(deleted.video);
      return res.json({ success: true, message: 'Course deleted locally!' });
    }
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ success: false, message: 'Server error deleting course.' });
  }
});

// Student profile retrieval
app.get('/api/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (isMongoConnected) {
      const user = await User.findOne({ email }, '-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      return res.json({ success: true, user });
    } else {
      const localUsers = getLocalUsers();
      const user = localUsers.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json({ success: true, user: userWithoutPassword });
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
});

// Admin endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    if (isMongoConnected) {
      const users = await User.find({}, '-password');
      return res.json({ success: true, users });
    } else {
      const localUsers = getLocalUsers();
      // Exclude passwords
      const users = localUsers.map(({ password, ...u }) => u);
      return res.json({ success: true, users });
    }
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error fetching students.' });
  }
});

app.put('/api/admin/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { fullName, phone, gender, year, district, college, department } = req.body;
    
    if (isMongoConnected) {
      const updated = await User.findOneAndUpdate(
        { email },
        { fullName, phone, gender, year, district, college, department },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Student not found.' });
      return res.json({ success: true, message: 'Student updated successfully!', user: updated });
    } else {
      const localUsers = getLocalUsers();
      const index = localUsers.findIndex(u => u.email === email);
      if (index === -1) return res.status(404).json({ success: false, message: 'Student not found.' });
      
      localUsers[index] = {
        ...localUsers[index],
        fullName, phone, gender, year, district, college, department
      };
      fs.writeFileSync(USERS_FILE, JSON.stringify(localUsers, null, 2));
      return res.json({ success: true, message: 'Student updated locally!', user: localUsers[index] });
    }
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Server error updating student.' });
  }
});

app.delete('/api/admin/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (isMongoConnected) {
      const deleted = await User.findOneAndDelete({ email });
      if (!deleted) return res.status(404).json({ success: false, message: 'Student not found.' });
      return res.json({ success: true, message: 'Student deleted successfully!' });
    } else {
      const localUsers = getLocalUsers();
      const index = localUsers.findIndex(u => u.email === email);
      if (index === -1) return res.status(404).json({ success: false, message: 'Student not found.' });
      
      localUsers.splice(index, 1);
      fs.writeFileSync(USERS_FILE, JSON.stringify(localUsers, null, 2));
      return res.json({ success: true, message: 'Student deleted locally!' });
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Server error deleting student.' });
  }
});

app.post('/api/admin/users/:email/assign', async (req, res) => {
  try {
    const { email } = req.params;
    const { courses } = req.body; // array of courses
    
    if (isMongoConnected) {
      const updated = await User.findOneAndUpdate(
        { email },
        { assignedCourses: courses },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Student not found.' });
      return res.json({ success: true, message: 'Courses assigned successfully!', courses: updated.assignedCourses });
    } else {
      const localUsers = getLocalUsers();
      const index = localUsers.findIndex(u => u.email === email);
      if (index === -1) return res.status(404).json({ success: false, message: 'Student not found.' });
      
      localUsers[index].assignedCourses = courses;
      fs.writeFileSync(USERS_FILE, JSON.stringify(localUsers, null, 2));
      return res.json({ success: true, message: 'Courses assigned locally!', courses: localUsers[index].assignedCourses });
    }
  } catch (err) {
    console.error('Error assigning courses:', err);
    res.status(500).json({ success: false, message: 'Server error assigning courses.' });
  }
});

app.put('/api/users/:email/profile', async (req, res) => {
  try {
    const { email } = req.params;
    const { fullName, college, department, year, profileImage } = req.body;
    
    if (isMongoConnected) {
      const updated = await User.findOneAndUpdate(
        { email },
        { fullName, college, department, year, profileImage },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Student not found.' });
      return res.json({ success: true, message: 'Profile updated successfully!', user: updated });
    } else {
      const localUsers = getLocalUsers();
      const index = localUsers.findIndex(u => u.email === email);
      if (index === -1) return res.status(404).json({ success: false, message: 'Student not found.' });
      
      localUsers[index] = { ...localUsers[index], fullName, college, department, year, profileImage };
      fs.writeFileSync(USERS_FILE, JSON.stringify(localUsers, null, 2));
      return res.json({ success: true, message: 'Profile updated locally!', user: localUsers[index] });
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

app.post('/api/subscriptions/course', async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    
    if (!user_id || !course_id) {
      return res.json({ subscription_registration_status: false });
    }

    const subscription_reference_id = `SUB_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;

    if (isMongoConnected) {
      let user = null;
      if (user_id.includes('@')) {
        user = await User.findOne({ email: user_id });
      } else {
        try {
          user = await User.findById(user_id);
        } catch(e) {}
      }

      if (!user) {
        return res.json({ subscription_registration_status: false });
      }

      if (!user.assignedCourses.includes(course_id)) {
        user.assignedCourses.push(course_id);
        await user.save();
      }
      return res.json({ subscription_registration_status: true, subscription_reference_id });
    } else {
      const localUsers = getLocalUsers();
      const userIndex = localUsers.findIndex(u => u.email === user_id || String(u.id) === user_id);
      
      if (userIndex === -1) {
        return res.json({ subscription_registration_status: false });
      }

      if (!localUsers[userIndex].assignedCourses) {
        localUsers[userIndex].assignedCourses = [];
      }

      if (!localUsers[userIndex].assignedCourses.includes(course_id)) {
        localUsers[userIndex].assignedCourses.push(course_id);
        fs.writeFileSync(USERS_FILE, JSON.stringify(localUsers, null, 2));
      }

      return res.json({ subscription_registration_status: true, subscription_reference_id });
    }
  } catch (err) {
    console.error('Subscription error:', err);
    res.json({ subscription_registration_status: false });
  }
});

app.post('/api/users/:email/progress', async (req, res) => {
  try {
    const { email } = req.params;
    const { courseId, videoUrl, midCourseQuizCompleted, finalQuizCompleted } = req.body;
    
    if (isMongoConnected) {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      
      let courseProgress = user.progress.find(p => String(p.courseId) === String(courseId));
      if (!courseProgress) {
        courseProgress = { courseId, watchedVideos: [], midCourseQuizCompleted: false, finalQuizCompleted: false };
        user.progress.push(courseProgress);
        // Refetch to modify subdoc
        courseProgress = user.progress[user.progress.length - 1];
      }
      
      if (videoUrl && !courseProgress.watchedVideos.includes(videoUrl)) {
        courseProgress.watchedVideos.push(videoUrl);
      }
      if (midCourseQuizCompleted !== undefined) {
        courseProgress.midCourseQuizCompleted = midCourseQuizCompleted;
      }
      if (finalQuizCompleted !== undefined) {
        courseProgress.finalQuizCompleted = finalQuizCompleted;
      }
      
      await user.save();
      return res.json({ success: true, progress: user.progress });
    } else {
      const localUsers = getLocalUsers();
      const userIndex = localUsers.findIndex(u => u.email === email);
      if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found.' });
      
      const user = localUsers[userIndex];
      if (!user.progress) user.progress = [];
      
      let courseProgress = user.progress.find(p => String(p.courseId) === String(courseId));
      if (!courseProgress) {
        courseProgress = { courseId, watchedVideos: [], midCourseQuizCompleted: false, finalQuizCompleted: false };
        user.progress.push(courseProgress);
      }
      
      if (videoUrl && !courseProgress.watchedVideos.includes(videoUrl)) {
        courseProgress.watchedVideos.push(videoUrl);
      }
      if (midCourseQuizCompleted !== undefined) {
        courseProgress.midCourseQuizCompleted = midCourseQuizCompleted;
      }
      if (finalQuizCompleted !== undefined) {
        courseProgress.finalQuizCompleted = finalQuizCompleted;
      }
      
      fs.writeFileSync(USERS_FILE, JSON.stringify(localUsers, null, 2));
      return res.json({ success: true, progress: user.progress });
    }
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ success: false, message: 'Server error updating progress.' });
  }
});

// Utility function to check if a port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
};

// Utility function to find the next available port
const findAvailablePort = async (startPort, maxAttempts) => {
  for (let i = 0; i < maxAttempts; i++) {
    const portToTry = startPort + i;
    const available = await isPortAvailable(portToTry);
    if (available) {
      return portToTry;
    }
  }
  return null;
};

const startServer = async () => {
  if (serverStarted) return;

  try {
    // Check if the default port is available
    const defaultPortAvailable = await isPortAvailable(DEFAULT_PORT);
    
    if (!defaultPortAvailable) {
      console.warn(`⚠️  Port ${DEFAULT_PORT} is already in use. Searching for an available port...`);
      const availablePort = await findAvailablePort(DEFAULT_PORT, MAX_PORT_ATTEMPTS);
      
      if (!availablePort) {
        console.error(`\n❌ ERROR: No available ports found in range ${DEFAULT_PORT}-${DEFAULT_PORT + MAX_PORT_ATTEMPTS - 1}`);
        console.error('Please stop other Node.js processes and try again.');
        if (process.platform === 'win32') {
          try {
            const output = execSync(`netstat -ano | findstr :${DEFAULT_PORT}`, { encoding: 'utf8' });
            console.error(`\nProcesses using port ${DEFAULT_PORT}:\n${output.trim()}`);
            console.error(`\nTo free the port, run: taskkill /PID <PID> /F`);
          } catch (e) {
            // ignore
          }
        }
        process.exit(1);
      }
      
      PORT = availablePort;
      console.log(`✅ Using port ${PORT} instead (${DEFAULT_PORT} was occupied)`);
    }

    // Now listen on the determined port
    server = app.listen(PORT, () => {
      serverStarted = true;
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      if (PORT !== DEFAULT_PORT) {
        console.log(`   (Default port ${DEFAULT_PORT} was already in use)`);
      }
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERROR: Port ${PORT} is already in use. Backend cannot start on this port.`);
        if (process.platform === 'win32') {
          try {
            const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
            console.error(`\nActive processes:\n${output.trim()}`);
            console.error(`\nTo free the port, run: taskkill /PID <PID> /F`);
          } catch (e) {
            console.error('Could not determine which process is using this port.');
          }
        } else {
          try {
            const output = execSync(`lsof -i :${PORT} -Pn`, { encoding: 'utf8' });
            console.error(`\nActive processes:\n${output.trim()}`);
            console.error(`\nTo free the port, run: kill <PID>`);
          } catch (e) {
            console.error('Could not determine which process is using this port.');
          }
        }
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });

    server.on('close', () => {
      console.log('\n⚠️  Server closed');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Keep the process alive — prevents Node from exiting when mongoose disconnects
setInterval(() => {}, 1000 * 60 * 30); // 30-min no-op timer
