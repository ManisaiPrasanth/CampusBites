require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixAdminAccount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Reset login attempts
    const result = await User.updateOne(
      { email: 'admin@campusbites.com' },
      { 
        $set: { loginAttempts: 0, lastLogin: null },
        $unset: { lockUntil: 1 }
      }
    );

    console.log('✅ Admin account reset:', result);

    // Verify admin exists
    const admin = await User.findOne({ email: 'admin@campusbites.com' });
    if (admin) {
      console.log('\n✅ Admin User Found:');
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   Active:', admin.isActive);
      console.log('   Login Attempts:', admin.loginAttempts);
      console.log('\n🔑 Login Credentials:');
      console.log('   Email: admin@campusbites.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('❌ Admin user not found!');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdminAccount();

