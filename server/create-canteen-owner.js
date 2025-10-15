require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

async function createCanteenOwner() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Create canteen owners for different restaurants
    const canteenOwners = [
      {
        fullName: 'Raja Restaurant Owner',
        email: 'raja@restaurant.com',
        password: 'Raja@123',
        phoneNumber: '9999999991',
        role: 'canteen_owner',
        assignedCanteen: 'Raja resturant',
        isEmailVerified: true,
        isActive: true
      },
      {
        fullName: 'Namus Cake Shop Owner',
        email: 'namus@cakeshop.com',
        password: 'Namus@123',
        phoneNumber: '9999999992',
        role: 'canteen_owner',
        assignedCanteen: 'Namus cake shop',
        isEmailVerified: true,
        isActive: true
      },
      {
        fullName: 'Godavari Owner',
        email: 'godavari@restaurant.com',
        password: 'Godavari@123',
        phoneNumber: '9999999993',
        role: 'canteen_owner',
        assignedCanteen: 'Godavari ruchulu',
        isEmailVerified: true,
        isActive: true
      }
    ];

    console.log('Creating canteen owner accounts...\n');

    for (const ownerData of canteenOwners) {
      // Check if already exists
      const existing = await User.findOne({ email: ownerData.email });
      
      if (existing) {
        console.log(`⚠️  ${ownerData.fullName} already exists (${ownerData.email})`);
        continue;
      }

      const owner = await User.create(ownerData);
      console.log(`✅ Created: ${owner.fullName}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Password: ${ownerData.password}`);
      console.log(`   Restaurant: ${owner.assignedCanteen}`);
      console.log('');
    }

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('✅ CANTEEN OWNER ACCOUNTS CREATED!');
    console.log('══════════════════════════════════════════════════════════\n');
    
    console.log('📝 Login Credentials:\n');
    console.log('Raja Restaurant Owner:');
    console.log('  Email: raja@restaurant.com');
    console.log('  Password: Raja@123');
    console.log('  Can manage: Raja resturant only\n');
    
    console.log('Namus Cake Shop Owner:');
    console.log('  Email: namus@cakeshop.com');
    console.log('  Password: Namus@123');
    console.log('  Can manage: Namus cake shop only\n');
    
    console.log('Godavari Owner:');
    console.log('  Email: godavari@restaurant.com');
    console.log('  Password: Godavari@123');
    console.log('  Can manage: Godavari ruchulu only\n');
    
    console.log('══════════════════════════════════════════════════════════\n');
    console.log('🎯 How to Test:');
    console.log('1. Login with any canteen owner email above');
    console.log('2. You\'ll be redirected to /admin (same as super admin)');
    console.log('3. BUT you\'ll only see:');
    console.log('   - Orders from YOUR restaurant');
    console.log('   - Can add items ONLY to YOUR restaurant');
    console.log('   - Dashboard shows YOUR restaurant name\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createCanteenOwner();

