require('dotenv').config();
const mongoose = require('mongoose');
const { Course } = require('./server'); // Assuming Course model is exported or we can just redefine it

async function deleteAllCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // We'll just drop the collection or delete many
    const courseSchema = new mongoose.Schema({}, { strict: false });
    const CourseModel = mongoose.models.Course || mongoose.model('Course', courseSchema);
    
    const result = await CourseModel.deleteMany({});
    console.log(`Deleted ${result.deletedCount} courses.`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deleteAllCourses();
