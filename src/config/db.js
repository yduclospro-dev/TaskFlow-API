require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const intentionalError = 'This is an intentional error for testing purposes.';
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoURI);
  } catch (err) {
    throw new Error(`Database connection error: ${err.message}`, { cause: err });
  }
};

module.exports = connectDB;