const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

const connectDB = async (dbUri) => {
  try {
    await mongoose.connect(dbUri);
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'movieImages'
    });
    console.log('Connected to MongoDB:', dbUri);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getBucket = () => bucket;

module.exports = { connectDB, getBucket };
