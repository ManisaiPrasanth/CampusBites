require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const connectDatabase = require('../config/database');

// Sample menu data
const menuData = [
  // Raja Restaurant
  { name: "Chicken Biryani", price: 120, category: "Main Course", canteen: "Raja resturant", calories: "450-550 Kcal", isVegetarian: false },
  { name: "Mutton Curry", price: 150, category: "Main Course", canteen: "Raja resturant", calories: "380-450 Kcal", isVegetarian: false },
  { name: "Dal Makhani", price: 80, category: "Main Course", canteen: "Raja resturant", calories: "250-300 Kcal" },
  { name: "Butter Naan", price: 25, category: "Bread", canteen: "Raja resturant", calories: "180-220 Kcal" },
  { name: "Raita", price: 30, category: "Side Dish", canteen: "Raja resturant", calories: "80-120 Kcal" },
  
  // Namus Cake Shop
  { name: "Chocolate Cake", price: 200, category: "Desserts", canteen: "Namus cake shop", calories: "400-500 Kcal" },
  { name: "Vanilla Cupcake", price: 50, category: "Desserts", canteen: "Namus cake shop", calories: "200-250 Kcal" },
  { name: "Red Velvet Cake", price: 180, category: "Desserts", canteen: "Namus cake shop", calories: "350-450 Kcal" },
  { name: "Cheesecake", price: 150, category: "Desserts", canteen: "Namus cake shop", calories: "300-400 Kcal" },
  { name: "Tiramisu", price: 120, category: "Desserts", canteen: "Namus cake shop", calories: "250-350 Kcal" },
  
  // Namma ooru Jigarthanda
  { name: "Fresh Orange Juice", price: 40, category: "Beverages", canteen: "Namma ooru Jigarthanda", calories: "120-150 Kcal" },
  { name: "Apple Juice", price: 35, category: "Beverages", canteen: "Namma ooru Jigarthanda", calories: "100-130 Kcal" },
  { name: "Mango Smoothie", price: 60, category: "Beverages", canteen: "Namma ooru Jigarthanda", calories: "200-250 Kcal" },
  { name: "Strawberry Shake", price: 55, category: "Beverages", canteen: "Namma ooru Jigarthanda", calories: "180-220 Kcal" },
  
  // Hill view kerala mess
  { name: "Mountain Tea", price: 20, category: "Beverages", canteen: "Hill view kerala mess", calories: "5-10 Kcal" },
  { name: "Coffee", price: 25, category: "Beverages", canteen: "Hill view kerala mess", calories: "10-15 Kcal" },
  { name: "Hot Chocolate", price: 35, category: "Beverages", canteen: "Hill view kerala mess", calories: "150-200 Kcal" },
  { name: "Sandwich", price: 60, category: "Snacks", canteen: "Hill view kerala mess", calories: "250-300 Kcal" },
  { name: "Samosa", price: 15, category: "Snacks", canteen: "Hill view kerala mess", calories: "120-150 Kcal" },
  
  // Godavari ruchulu
  { name: "South Indian Thali", price: 100, category: "Main Course", canteen: "Godavari ruchulu", calories: "400-500 Kcal" },
  { name: "Dosa", price: 50, category: "Main Course", canteen: "Godavari ruchulu", calories: "200-250 Kcal" },
  { name: "Idli Sambar", price: 40, category: "Breakfast", canteen: "Godavari ruchulu", calories: "150-200 Kcal" },
  { name: "Vada", price: 25, category: "Snacks", canteen: "Godavari ruchulu", calories: "100-150 Kcal" },
  
  // Street Food
  { name: "Pani Puri", price: 30, category: "Street Food", canteen: "Sai fast food", calories: "100-150 Kcal" },
  { name: "Bhel Puri", price: 40, category: "Street Food", canteen: "Sai fast food", calories: "150-200 Kcal" },
  { name: "Pav Bhaji", price: 60, category: "Street Food", canteen: "Sai fast food", calories: "300-400 Kcal" },
  { name: "Vada Pav", price: 25, category: "Street Food", canteen: "Sai fast food", calories: "200-250 Kcal" }
];

const seedDatabase = async () => {
  try {
    await connectDatabase();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany();
    await MenuItem.deleteMany();

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      fullName: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@campusbites.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      phoneNumber: '9999999999',
      role: 'admin',
      isEmailVerified: true
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create test users
    console.log('👥 Creating test users...');
    const user1 = await User.create({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      phoneNumber: '9876543210',
      role: 'user',
      isEmailVerified: true
    });
    
    const user2 = await User.create({
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      password: 'Password123',
      phoneNumber: '9876543211',
      role: 'user',
      isEmailVerified: true
    });
    console.log('✅ Test users created');

    // Create canteen owners
    console.log('🏪 Creating canteen owners...');
    const rajaOwner = await User.create({
      fullName: 'Raja Restaurant Owner',
      email: 'raja@canteen.com',
      password: 'Password123',
      phoneNumber: '9876543212',
      role: 'canteen_owner',
      assignedCanteen: 'Raja resturant',
      isEmailVerified: true
    });

    const namusOwner = await User.create({
      fullName: 'Namus Cake Shop Owner',
      email: 'namus@canteen.com',
      password: 'Password123',
      phoneNumber: '9876543213',
      role: 'canteen_owner',
      assignedCanteen: 'Namus cake shop',
      isEmailVerified: true
    });

    const jigarthandaOwner = await User.create({
      fullName: 'Jigarthanda Shop Owner',
      email: 'jigarthanda@canteen.com',
      password: 'Password123',
      phoneNumber: '9876543214',
      role: 'canteen_owner',
      assignedCanteen: 'Namma ooru Jigarthanda',
      isEmailVerified: true
    });

    const godavariOwner = await User.create({
      fullName: 'Godavari Ruchulu Owner',
      email: 'godavari@canteen.com',
      password: 'Password123',
      phoneNumber: '9876543215',
      role: 'canteen_owner',
      assignedCanteen: 'Godavari ruchulu',
      isEmailVerified: true
    });
    console.log('✅ Canteen owners created');

    // Create menu items
    console.log('🍽️  Creating menu items...');
    const menuItems = await MenuItem.create(
      menuData.map(item => ({
        ...item,
        image: `assets/images/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        isAvailable: true,
        addedBy: admin._id,
        preparationTime: Math.floor(Math.random() * 20) + 10
      }))
    );
    console.log(`✅ Created ${menuItems.length} menu items`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('\n👨‍💼 Admin:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\n👤 Regular Users:');
    console.log(`   User1: ${user1.email} / Password123`);
    console.log(`   User2: ${user2.email} / Password123`);
    console.log('\n🏪 Canteen Owners:');
    console.log(`   Raja Restaurant: ${rajaOwner.email} / Password123`);
    console.log(`   Namus Cake Shop: ${namusOwner.email} / Password123`);
    console.log(`   Jigarthanda: ${jigarthandaOwner.email} / Password123`);
    console.log(`   Godavari Ruchulu: ${godavariOwner.email} / Password123`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

