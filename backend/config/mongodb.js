import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/esweetie_cake';

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/esweetiebake`);
        console.log('✓ MongoDB connected successfully');
    } catch (error) {
        console.error('✗ MongoDB connection error:', error.message);
        process.exit(1);
    }
};


export default connectDB;
