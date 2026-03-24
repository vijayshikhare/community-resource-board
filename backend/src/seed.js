// backend/src/seed.js
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs'); // for hashing passwords
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');      // make sure the file name is correct
const Resource = require('./models/Resource');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Resource.deleteMany({});

    // Create a dummy organizer/admin user
    const hashedPassword = await bcrypt.hash("123456", 10);

    const adminUser = await User.create({
      name: "Seed Admin",
      username: "seedadmin",
      email: "seed@example.com",
      password: hashedPassword,
      role: "admin",
      isActive: true
    });

    console.log('✅ Dummy admin user created:', adminUser._id);

    // Optional: Create a normal user
    const hashedUserPassword = await bcrypt.hash("user123", 10);

    const normalUser = await User.create({
      name: "Seed User",
      username: "seeduser",
      email: "user@example.com",
      password: hashedUserPassword,
      role: "user",
      isActive: true
    });

    console.log('✅ Dummy normal user created:', normalUser._id);

    // Sample resources
    const sampleResources = [
      {
        title: "Free React Workshop",
        description: "Learn React basics in this free online workshop",
        link: "https://example.com/react-workshop",
        category: "Training",
        organizer: adminUser._id
      },
      {
        title: "Cybersecurity Basics",
        description: "Introduction to cybersecurity for beginners",
        link: "https://example.com/cybersecurity",
        category: "Training",
        organizer: adminUser._id
      },
      {
        title: "Resume Building Tips",
        description: "Improve your resume to land your dream job",
        link: "https://example.com/resume-tips",
        category: "Career",
        organizer: adminUser._id
      }
    ];

    // Insert sample resources
    const createdResources = await Resource.insertMany(sampleResources);
    console.log('✅ Sample resources created:', createdResources.map(r => r._id));

    console.log('🎉 Database seeding completed!');
    process.exit(0); // exit after seed
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
