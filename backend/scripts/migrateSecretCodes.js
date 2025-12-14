const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const migrate = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pghome';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        const users = await User.find({ secretCode: { $exists: false } });
        console.log(`Found ${users.length} users without secret code.`);

        for (const user of users) {
            // The pre-save hook we just added will automatically generate the code!
            await user.save();
            console.log(`Updated user: ${user.email}`);
        }

        console.log('Migration complete');
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
