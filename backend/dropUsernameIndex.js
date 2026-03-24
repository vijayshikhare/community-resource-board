require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const dropIndex = async () => {
  try {
    await connectDB();

    // Access the 'users' collection
    const collection = mongoose.connection.collection('users');

    // Drop the old unique index on 'username'
    await collection.dropIndex('username_1');
    console.log('✅ Dropped index username_1 successfully');

    process.exit(0);
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('ℹ️ Index username_1 not found, nothing to drop');
    } else {
      console.error('❌ Error dropping index:', err.message);
    }
    process.exit(1);
  }
};

dropIndex();

