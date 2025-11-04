require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User.model');

connectDB();

const importData = async () => {
  try {
    // 1. Clear existing users (this part is fine)
    await User.deleteMany();
    console.log('Old users cleared...');

    const users = [
      {
        username: 'admin',
        password: 'password123',
        role: 'Admin',
        status: 'Active',
      },
      {
        username: 'uploader1',
        password: 'password123',
        role: 'Uploader',
        status: 'Active',
      },
      {
        username: 'assessor1',
        password: 'password123',
        role: 'Assessor',
        status: 'Active',
      },
    ];

    // 2. Create users one by one to trigger the 'save' hook for hashing
    // OLD, INCORRECT WAY: await User.insertMany(users);
    
    // NEW, CORRECT WAY:
    for (const userData of users) {
      await User.create(userData);
      console.log(`Created user: ${userData.username}`);
    }

    console.log('Data Imported Successfully! Passwords are now hashed.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();