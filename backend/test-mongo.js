import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bookstore')
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });
