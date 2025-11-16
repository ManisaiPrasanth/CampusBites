require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.findOne({ role: 'admin' });
    const users = await User.find({ role: 'user' }).limit(10);
    const owners = await User.find({ role: 'canteen_owner' }).limit(10);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔑 LOGIN CREDENTIALS FOR TESTING');
    console.log('='.repeat(60) + '\n');
    
    if (admin) {
      console.log('👨‍💼 ADMIN:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: Admin@123\n`);
    }
    
    if (owners.length > 0) {
      console.log('🏪 CANTEEN OWNERS (Password: Owner@123):');
      owners.forEach(o => {
        console.log(`   ${o.assignedCanteen}: ${o.email}`);
      });
      console.log('');
    }
    
    if (users.length > 0) {
      console.log('👤 REGULAR USERS (Password: User@123):');
      users.forEach(u => {
        console.log(`   ${u.fullName}: ${u.email}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No users found in database!');
      console.log('   Run: npm run seed\n');
    }
    
    console.log('='.repeat(60) + '\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();


