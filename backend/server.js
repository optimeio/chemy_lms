const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware — handle CORS preflight explicitly
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Uploads directory configuration
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Fallback data file setup
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');

const DEFAULT_COURSES = [
  { id: '1', title: 'Embedded Systems', content: 'Learn the fundamentals of Embedded Systems, microcontrollers, assembly, and C programming for hardware interfaces.', image: '', ppt: '', pptName: '', video: '', videoName: '' },
  { id: '2', title: 'Electric Vehicles', content: 'Explore Electric Vehicle powertrain, battery management systems, motor control, and EV architecture.', image: '', ppt: '', pptName: '', video: '', videoName: '' },
  { id: '3', title: 'MERN Stack Development', content: 'Master MongoDB, Express.js, React, and Node.js to build modern, full-stack web applications.', image: '', ppt: '', pptName: '', video: '', videoName: '' },
  { id: '4', title: 'IoT & Sensor Networks', content: 'Build smart connected devices using sensor technology, wireless protocols, and cloud platforms.', image: '', ppt: '', pptName: '', video: '', videoName: '' },
  { id: '5', title: 'Python for Data Science', content: 'Learn core Python concepts, data analysis with NumPy/Pandas, and visualization tools.', image: '', ppt: '', pptName: '', video: '', videoName: '' },
  { id: '6', title: 'Machine Learning Fundamentals', content: 'Introduction to supervised and unsupervised machine learning algorithms, training models, and validation.', image: '', ppt: '', pptName: '', video: '', videoName: '' },
  { id: '7', title: 'Cloud Computing (AWS)', content: 'Deploy and maintain scalable web architectures on Amazon Web Services cloud infrastructure.', image: '', ppt: '', pptName: '', video: '', videoName: '' },
  { id: '8', title: 'Cybersecurity Essentials', content: 'Protect networks and systems against digital threats, understand cryptography and secure practices.', image: '', ppt: '', pptName: '', video: '', videoName: '' },
  { id: '9', title: 'Digital Marketing', content: 'Strategies for online marketing, search engine optimization, content creation, and analytics tools.', image: '', ppt: '', pptName: '', video: '', videoName: '' },
  { id: '10', title: 'AutoCAD & Mechanical Design', content: 'Create precise 2D drafting and 3D modeling specifications for mechanical parts and assemblies.', image: '', ppt: '', pptName: '', video: '', videoName: '' }
];

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
  assignedCourses: { type: [String], default: [] },
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
  image: { type: String }, // path to static image file
  content: { type: String, required: true },
  ppt: { type: String }, // path to static PPT file
  pptName: { type: String }, // original file name
  video: { type: String }, // path to static video file
  videoName: { type: String }, // original file name
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
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sm_groups';

mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(async () => {
    console.log('MongoDB connected.');
    isMongoConnected = true;
    try {
      const count = await Course.countDocuments();
      if (count === 0) {
        // Map and insert, stripping default ID for MongoDB
        await Course.insertMany(DEFAULT_COURSES.map(({ id, ...c }) => c));
        console.log('Default courses initialized in MongoDB.');
      }
    } catch (err) {
      console.error('Error initializing default courses:', err);
    }
  })
  .catch(async () => {
    console.log('MongoDB unavailable — using local JSON storage.');
    // Fully disconnect so mongoose timers don't cause the process to exit
    try { await mongoose.disconnect(); } catch (_) { /* ignore */ }
  });

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
      const newUser = new User({ fullName, email, phone, password, gender, year, district, college, department, assignedCourses: [] });
      await newUser.save();
      return res.status(201).json({ success: true, message: 'Registration successful!', user: { fullName, email, college, department } });
    } else {
      const localUsers = getLocalUsers();
      if (localUsers.some(u => u.email === email)) {
        return res.status(400).json({ success: false, errors: { email: 'Email is already registered.' } });
      }

      const newUser = { fullName, email, phone, password, gender, year, district, college, department, assignedCourses: [], createdAt: new Date() };
      saveLocalUser(newUser);
      return res.status(201).json({ success: true, message: 'Registration successful (stored locally)!', user: { fullName, email, college, department } });
    }

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Hardcoded admin account
    if (
      (email === 'admin@smgroups.com' && password === 'admin123') ||
      (email === 'thesmgroups@gmail.com' && (password === 'TSMGPVT@2026' || password === '-n TSMGPVT@2026'))
    ) {
      return res.json({ success: true, message: 'Login successful!', user: { fullName: 'Admin', email: email } });
    }

    if (isMongoConnected) {
      const user = await User.findOne({ email });
      if (!user || user.password !== password) { // Note: Simple password matching for demo purposes
        return res.status(400).json({ success: false, message: 'Invalid email or password.' });
      }
      return res.json({ success: true, message: 'Login successful!', user: { fullName: user.fullName, email: user.email, college: user.college, department: user.department } });
    } else {
      const localUsers = getLocalUsers();
      const user = localUsers.find(u => u.email === email && u.password === password);
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email or password.' });
      }
      return res.json({ success: true, message: 'Login successful!', user: { fullName: user.fullName, email: user.email, college: user.college, department: user.department } });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
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

// Course Endpoints
app.get('/api/courses', async (req, res) => {
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

app.post('/api/admin/courses', async (req, res) => {
  try {
    const { title, image, imageFile, content, ppt, pptFile, video, videoFile } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const imagePath = saveUploadedFile(image, imageFile);
    const pptPath = saveUploadedFile(ppt, pptFile);
    const videoPath = saveUploadedFile(video, videoFile);

    const courseData = {
      title,
      image: imagePath || '',
      content,
      ppt: pptPath || '',
      pptName: pptFile || '',
      video: videoPath || '',
      videoName: videoFile || '',
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

app.put('/api/admin/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, imageFile, content, ppt, pptFile, video, videoFile } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    if (isMongoConnected) {
      const existing = await Course.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }

      const imagePath = image && image.startsWith('/uploads/') ? image : saveUploadedFile(image, imageFile);
      if (image && !image.startsWith('/uploads/') && existing.image) {
        deleteUploadedFile(existing.image);
      }

      const pptPath = ppt && ppt.startsWith('/uploads/') ? ppt : saveUploadedFile(ppt, pptFile);
      if (ppt && !ppt.startsWith('/uploads/') && existing.ppt) {
        deleteUploadedFile(existing.ppt);
      }

      const videoPath = video && video.startsWith('/uploads/') ? video : saveUploadedFile(video, videoFile);
      if (video && !video.startsWith('/uploads/') && existing.video) {
        deleteUploadedFile(existing.video);
      }

      existing.title = title;
      existing.image = imagePath || existing.image;
      existing.content = content;
      existing.ppt = pptPath || existing.ppt;
      existing.pptName = pptFile || existing.pptName;
      existing.video = videoPath || existing.video;
      existing.videoName = videoFile || existing.videoName;

      await existing.save();
      return res.json({ success: true, message: 'Course updated successfully!', course: existing });
    } else {
      const localCourses = getLocalCourses();
      const idx = localCourses.findIndex(c => String(c.id) === String(id));
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }

      const existing = localCourses[idx];

      const imagePath = image && image.startsWith('/uploads/') ? image : saveUploadedFile(image, imageFile);
      if (image && !image.startsWith('/uploads/') && existing.image) {
        deleteUploadedFile(existing.image);
      }

      const pptPath = ppt && ppt.startsWith('/uploads/') ? ppt : saveUploadedFile(ppt, pptFile);
      if (ppt && !ppt.startsWith('/uploads/') && existing.ppt) {
        deleteUploadedFile(existing.ppt);
      }

      const videoPath = video && video.startsWith('/uploads/') ? video : saveUploadedFile(video, videoFile);
      if (video && !video.startsWith('/uploads/') && existing.video) {
        deleteUploadedFile(existing.video);
      }

      localCourses[idx] = {
        ...existing,
        title,
        image: imagePath || existing.image,
        content,
        ppt: pptPath || existing.ppt,
        pptName: pptFile || existing.pptName,
        video: videoPath || existing.video,
        videoName: videoFile || existing.videoName
      };

      saveLocalCourses(localCourses);
      return res.json({ success: true, message: 'Course updated locally!', course: localCourses[idx] });
    }
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ success: false, message: 'Server error updating course.' });
  }
});

app.delete('/api/admin/courses/:id', async (req, res) => {
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

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Keep the process alive — prevents Node from exiting when mongoose disconnects
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Heartbeat to keep the event loop alive (mongoose disconnect can drain it)
setInterval(() => {}, 1000 * 60 * 30); // 30-min no-op timer
