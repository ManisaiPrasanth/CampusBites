require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Review = require('../models/Review');
const connectDatabase = require('../config/database');

// All 18 canteens
const canteens = [
  'Anandam cool down shop',
  'Healthy Hotel',
  'Madurai lee corner',
  'Mercely\'s ice cream',
  'Kunafa street',
  'Aasife',
  'Raja resturant',
  'Mr soda',
  'Namus cake shop',
  'Velamal',
  'Kerala cafe',
  'Namma ooru Jigarthanda',
  'Sai fast food',
  'The essence',
  'Hill view kerala mess',
  'Godavari ruchulu',
  'Vasu\'s cafe',
  'Nalabagam canteen'
];

// Categories
const categories = [
  'Main Course',
  'Snacks',
  'Beverages',
  'Desserts',
  'Street Food',
  'Bread',
  'Side Dish',
  'Breakfast',
  'Lunch',
  'Dinner'
];

// Sample menu items data for each canteen
const menuItemsByCanteen = {
  'Anandam cool down shop': [
    { name: 'Fresh Lime Soda', price: 35, category: 'Beverages', description: 'Refreshing lime soda with mint', calories: '50-80 Kcal', isVegetarian: true },
    { name: 'Mango Shake', price: 50, category: 'Beverages', description: 'Fresh mango shake', calories: '150-200 Kcal', isVegetarian: true },
    { name: 'Chocolate Milkshake', price: 55, category: 'Beverages', description: 'Rich chocolate milkshake', calories: '250-300 Kcal', isVegetarian: true },
    { name: 'Oreo Shake', price: 60, category: 'Beverages', description: 'Creamy oreo shake', calories: '280-330 Kcal', isVegetarian: true },
    { name: 'Fruit Punch', price: 45, category: 'Beverages', description: 'Mixed fruit punch', calories: '120-150 Kcal', isVegetarian: true }
  ],
  'Healthy Hotel': [
    { name: 'Green Salad Bowl', price: 80, category: 'Main Course', description: 'Fresh mixed greens with vegetables', calories: '100-150 Kcal', isVegetarian: true, isVegan: true },
    { name: 'Grilled Chicken Wrap', price: 120, category: 'Main Course', description: 'Healthy grilled chicken wrap', calories: '300-350 Kcal', isVegetarian: false },
    { name: 'Quinoa Bowl', price: 100, category: 'Main Course', description: 'Nutritious quinoa with vegetables', calories: '250-300 Kcal', isVegetarian: true, isVegan: true },
    { name: 'Fresh Fruit Bowl', price: 60, category: 'Snacks', description: 'Assorted fresh fruits', calories: '150-200 Kcal', isVegetarian: true, isVegan: true },
    { name: 'Protein Smoothie', price: 70, category: 'Beverages', description: 'High protein smoothie', calories: '200-250 Kcal', isVegetarian: true }
  ],
  'Madurai lee corner': [
    { name: 'Madurai Idli', price: 40, category: 'Breakfast', description: 'Soft idli with sambar', calories: '150-200 Kcal', isVegetarian: true },
    { name: 'Kothu Parotta', price: 80, category: 'Main Course', description: 'Spicy kothu parotta', calories: '400-500 Kcal', isVegetarian: true },
    { name: 'Chicken Chettinad', price: 150, category: 'Main Course', description: 'Spicy Chettinad style chicken', calories: '350-450 Kcal', isVegetarian: false },
    { name: 'Mutton Biryani', price: 180, category: 'Lunch', description: 'Aromatic mutton biryani', calories: '500-600 Kcal', isVegetarian: false },
    { name: 'Filter Coffee', price: 25, category: 'Beverages', description: 'Traditional filter coffee', calories: '10-15 Kcal', isVegetarian: true }
  ],
  'Mercely\'s ice cream': [
    { name: 'Vanilla Ice Cream', price: 60, category: 'Desserts', description: 'Classic vanilla ice cream', calories: '200-250 Kcal', isVegetarian: true },
    { name: 'Chocolate Fudge', price: 80, category: 'Desserts', description: 'Rich chocolate fudge ice cream', calories: '280-330 Kcal', isVegetarian: true },
    { name: 'Strawberry Delight', price: 70, category: 'Desserts', description: 'Fresh strawberry ice cream', calories: '220-270 Kcal', isVegetarian: true },
    { name: 'Butterscotch', price: 75, category: 'Desserts', description: 'Creamy butterscotch ice cream', calories: '250-300 Kcal', isVegetarian: true },
    { name: 'Ice Cream Sundae', price: 100, category: 'Desserts', description: 'Ice cream with toppings', calories: '350-400 Kcal', isVegetarian: true }
  ],
  'Kunafa street': [
    { name: 'Classic Kunafa', price: 120, category: 'Desserts', description: 'Traditional kunafa with cream', calories: '400-500 Kcal', isVegetarian: true },
    { name: 'Chocolate Kunafa', price: 140, category: 'Desserts', description: 'Kunafa with chocolate', calories: '450-550 Kcal', isVegetarian: true },
    { name: 'Nutella Kunafa', price: 150, category: 'Desserts', description: 'Kunafa with Nutella', calories: '480-580 Kcal', isVegetarian: true },
    { name: 'Kunafa with Ice Cream', price: 160, category: 'Desserts', description: 'Kunafa served with ice cream', calories: '500-600 Kcal', isVegetarian: true }
  ],
  'Aasife': [
    { name: 'Chicken Biryani', price: 130, category: 'Lunch', description: 'Hyderabadi style biryani', calories: '450-550 Kcal', isVegetarian: false },
    { name: 'Mutton Biryani', price: 160, category: 'Lunch', description: 'Aromatic mutton biryani', calories: '500-600 Kcal', isVegetarian: false },
    { name: 'Chicken Curry', price: 120, category: 'Main Course', description: 'Spicy chicken curry', calories: '350-450 Kcal', isVegetarian: false },
    { name: 'Butter Naan', price: 30, category: 'Bread', description: 'Buttery soft naan', calories: '200-250 Kcal', isVegetarian: true },
    { name: 'Dal Makhani', price: 90, category: 'Main Course', description: 'Creamy dal makhani', calories: '300-350 Kcal', isVegetarian: true }
  ],
  'Raja resturant': [
    { name: 'Chicken Biryani', price: 120, category: 'Main Course', description: 'Fragrant chicken biryani', calories: '450-550 Kcal', isVegetarian: false },
    { name: 'Mutton Curry', price: 150, category: 'Main Course', description: 'Rich mutton curry', calories: '380-450 Kcal', isVegetarian: false },
    { name: 'Dal Makhani', price: 80, category: 'Main Course', description: 'Creamy dal makhani', calories: '250-300 Kcal', isVegetarian: true },
    { name: 'Butter Naan', price: 25, category: 'Bread', description: 'Buttery naan bread', calories: '180-220 Kcal', isVegetarian: true },
    { name: 'Raita', price: 30, category: 'Side Dish', description: 'Cooling yogurt raita', calories: '80-120 Kcal', isVegetarian: true },
    { name: 'Chicken Tikka', price: 140, category: 'Main Course', description: 'Tandoori chicken tikka', calories: '300-350 Kcal', isVegetarian: false }
  ],
  'Mr soda': [
    { name: 'Cola', price: 30, category: 'Beverages', description: 'Chilled cola', calories: '140-150 Kcal', isVegetarian: true },
    { name: 'Orange Soda', price: 35, category: 'Beverages', description: 'Refreshing orange soda', calories: '120-140 Kcal', isVegetarian: true },
    { name: 'Lemon Soda', price: 30, category: 'Beverages', description: 'Fresh lemon soda', calories: '100-120 Kcal', isVegetarian: true },
    { name: 'Ginger Ale', price: 40, category: 'Beverages', description: 'Spicy ginger ale', calories: '110-130 Kcal', isVegetarian: true },
    { name: 'Fruit Soda', price: 35, category: 'Beverages', description: 'Mixed fruit soda', calories: '130-150 Kcal', isVegetarian: true }
  ],
  'Namus cake shop': [
    { name: 'Chocolate Cake', price: 200, category: 'Desserts', description: 'Rich chocolate cake', calories: '400-500 Kcal', isVegetarian: true },
    { name: 'Vanilla Cupcake', price: 50, category: 'Desserts', description: 'Soft vanilla cupcake', calories: '200-250 Kcal', isVegetarian: true },
    { name: 'Red Velvet Cake', price: 180, category: 'Desserts', description: 'Classic red velvet', calories: '350-450 Kcal', isVegetarian: true },
    { name: 'Cheesecake', price: 150, category: 'Desserts', description: 'Creamy cheesecake', calories: '300-400 Kcal', isVegetarian: true },
    { name: 'Tiramisu', price: 120, category: 'Desserts', description: 'Italian tiramisu', calories: '250-350 Kcal', isVegetarian: true },
    { name: 'Black Forest', price: 160, category: 'Desserts', description: 'Classic black forest cake', calories: '380-480 Kcal', isVegetarian: true }
  ],
  'Velamal': [
    { name: 'South Indian Thali', price: 100, category: 'Lunch', description: 'Complete South Indian meal', calories: '400-500 Kcal', isVegetarian: true },
    { name: 'Dosa', price: 50, category: 'Breakfast', description: 'Crispy dosa with sambar', calories: '200-250 Kcal', isVegetarian: true },
    { name: 'Idli Sambar', price: 40, category: 'Breakfast', description: 'Soft idli with sambar', calories: '150-200 Kcal', isVegetarian: true },
    { name: 'Vada', price: 25, category: 'Snacks', description: 'Crispy vada', calories: '100-150 Kcal', isVegetarian: true },
    { name: 'Pongal', price: 45, category: 'Breakfast', description: 'Traditional pongal', calories: '250-300 Kcal', isVegetarian: true }
  ],
  'Kerala cafe': [
    { name: 'Kerala Parotta', price: 40, category: 'Bread', description: 'Flaky Kerala parotta', calories: '250-300 Kcal', isVegetarian: true },
    { name: 'Beef Fry', price: 140, category: 'Main Course', description: 'Spicy Kerala beef fry', calories: '350-450 Kcal', isVegetarian: false },
    { name: 'Chicken Curry', price: 120, category: 'Main Course', description: 'Kerala style chicken curry', calories: '300-400 Kcal', isVegetarian: false },
    { name: 'Appam with Stew', price: 80, category: 'Breakfast', description: 'Soft appam with vegetable stew', calories: '300-350 Kcal', isVegetarian: true },
    { name: 'Puttu', price: 50, category: 'Breakfast', description: 'Steamed puttu with kadala', calories: '250-300 Kcal', isVegetarian: true }
  ],
  'Namma ooru Jigarthanda': [
    { name: 'Fresh Orange Juice', price: 40, category: 'Beverages', description: 'Freshly squeezed orange juice', calories: '120-150 Kcal', isVegetarian: true },
    { name: 'Apple Juice', price: 35, category: 'Beverages', description: 'Fresh apple juice', calories: '100-130 Kcal', isVegetarian: true },
    { name: 'Mango Smoothie', price: 60, category: 'Beverages', description: 'Creamy mango smoothie', calories: '200-250 Kcal', isVegetarian: true },
    { name: 'Strawberry Shake', price: 55, category: 'Beverages', description: 'Fresh strawberry shake', calories: '180-220 Kcal', isVegetarian: true },
    { name: 'Jigarthanda', price: 50, category: 'Beverages', description: 'Traditional jigarthanda', calories: '250-300 Kcal', isVegetarian: true }
  ],
  'Sai fast food': [
    { name: 'Pani Puri', price: 30, category: 'Street Food', description: 'Crispy puris with tangy water', calories: '100-150 Kcal', isVegetarian: true },
    { name: 'Bhel Puri', price: 40, category: 'Street Food', description: 'Spicy bhel puri', calories: '150-200 Kcal', isVegetarian: true },
    { name: 'Pav Bhaji', price: 60, category: 'Street Food', description: 'Spicy vegetable curry with bread', calories: '300-400 Kcal', isVegetarian: true },
    { name: 'Vada Pav', price: 25, category: 'Street Food', description: 'Mumbai style vada pav', calories: '200-250 Kcal', isVegetarian: true },
    { name: 'Dahi Puri', price: 35, category: 'Street Food', description: 'Crispy puris with yogurt', calories: '120-170 Kcal', isVegetarian: true }
  ],
  'The essence': [
    { name: 'Pasta Carbonara', price: 120, category: 'Main Course', description: 'Creamy pasta carbonara', calories: '400-500 Kcal', isVegetarian: false },
    { name: 'Margherita Pizza', price: 150, category: 'Main Course', description: 'Classic margherita pizza', calories: '350-450 Kcal', isVegetarian: true },
    { name: 'Caesar Salad', price: 90, category: 'Main Course', description: 'Fresh caesar salad', calories: '200-250 Kcal', isVegetarian: false },
    { name: 'Garlic Bread', price: 50, category: 'Bread', description: 'Buttery garlic bread', calories: '250-300 Kcal', isVegetarian: true },
    { name: 'Chocolate Brownie', price: 80, category: 'Desserts', description: 'Warm chocolate brownie', calories: '300-350 Kcal', isVegetarian: true }
  ],
  'Hill view kerala mess': [
    { name: 'Mountain Tea', price: 20, category: 'Beverages', description: 'Traditional mountain tea', calories: '5-10 Kcal', isVegetarian: true },
    { name: 'Coffee', price: 25, category: 'Beverages', description: 'Hot coffee', calories: '10-15 Kcal', isVegetarian: true },
    { name: 'Hot Chocolate', price: 35, category: 'Beverages', description: 'Rich hot chocolate', calories: '150-200 Kcal', isVegetarian: true },
    { name: 'Sandwich', price: 60, category: 'Snacks', description: 'Fresh vegetable sandwich', calories: '250-300 Kcal', isVegetarian: true },
    { name: 'Samosa', price: 15, category: 'Snacks', description: 'Crispy samosa', calories: '120-150 Kcal', isVegetarian: true },
    { name: 'Kerala Meals', price: 90, category: 'Lunch', description: 'Traditional Kerala meals', calories: '400-500 Kcal', isVegetarian: true }
  ],
  'Godavari ruchulu': [
    { name: 'South Indian Thali', price: 100, category: 'Main Course', description: 'Complete South Indian meal', calories: '400-500 Kcal', isVegetarian: true },
    { name: 'Dosa', price: 50, category: 'Main Course', description: 'Crispy dosa', calories: '200-250 Kcal', isVegetarian: true },
    { name: 'Idli Sambar', price: 40, category: 'Breakfast', description: 'Soft idli with sambar', calories: '150-200 Kcal', isVegetarian: true },
    { name: 'Vada', price: 25, category: 'Snacks', description: 'Crispy vada', calories: '100-150 Kcal', isVegetarian: true },
    { name: 'Upma', price: 35, category: 'Breakfast', description: 'Spicy upma', calories: '200-250 Kcal', isVegetarian: true }
  ],
  'Vasu\'s cafe': [
    { name: 'Filter Coffee', price: 25, category: 'Beverages', description: 'Strong filter coffee', calories: '10-15 Kcal', isVegetarian: true },
    { name: 'Masala Chai', price: 20, category: 'Beverages', description: 'Spicy masala chai', calories: '30-40 Kcal', isVegetarian: true },
    { name: 'Bread Toast', price: 30, category: 'Snacks', description: 'Buttered bread toast', calories: '150-200 Kcal', isVegetarian: true },
    { name: 'Bun Butter', price: 25, category: 'Snacks', description: 'Buttered bun', calories: '180-220 Kcal', isVegetarian: true },
    { name: 'Egg Sandwich', price: 50, category: 'Snacks', description: 'Fresh egg sandwich', calories: '250-300 Kcal', isVegetarian: false }
  ],
  'Nalabagam canteen': [
    { name: 'Chicken Biryani', price: 110, category: 'Lunch', description: 'Spicy chicken biryani', calories: '450-550 Kcal', isVegetarian: false },
    { name: 'Veg Biryani', price: 80, category: 'Lunch', description: 'Aromatic vegetable biryani', calories: '350-450 Kcal', isVegetarian: true },
    { name: 'Chicken Curry', price: 110, category: 'Main Course', description: 'Spicy chicken curry', calories: '300-400 Kcal', isVegetarian: false },
    { name: 'Dal Fry', price: 60, category: 'Main Course', description: 'Tempered dal fry', calories: '200-250 Kcal', isVegetarian: true },
    { name: 'Roti', price: 15, category: 'Bread', description: 'Fresh roti', calories: '100-120 Kcal', isVegetarian: true }
  ]
};

// Generate random names
const firstNames = ['Raj', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Ananya', 'Karan', 'Meera', 'Rohan', 'Kavya', 'Aditya', 'Divya', 'Siddharth', 'Pooja', 'Nikhil', 'Shreya'];
const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Rao', 'Verma', 'Gupta', 'Malhotra', 'Joshi', 'Mehta', 'Agarwal'];

const getRandomName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

const getRandomEmail = (name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const randomNum = Math.floor(Math.random() * 1000);
  return `${cleanName}${randomNum}@klu.ac.in`;
};

const getRandomPhone = () => {
  return `9${Math.floor(Math.random() * 900000000) + 100000000}`;
};

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDatabase();

    console.log('🗑️  Clearing existing data...');
    await Review.deleteMany({});
    await Order.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Database cleared');

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const admin = await User.create({
      fullName: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@klu.ac.in',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      phoneNumber: '9999999999',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create canteen owners
    console.log('\n🏪 Creating canteen owners...');
    const canteenOwners = [];
    for (let i = 0; i < canteens.length; i++) {
      const canteen = canteens[i];
      const ownerName = `${canteen} Owner`;
      // Use proper @klu.ac.in email format
      const canteenSlug = canteen.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
      const ownerEmail = `owner${i + 1}.${canteenSlug}@klu.ac.in`;
      
      const owner = await User.create({
        fullName: ownerName,
        email: ownerEmail,
        password: 'Owner@123',
        phoneNumber: getRandomPhone(),
        role: 'canteen_owner',
        assignedCanteen: canteen,
        isEmailVerified: true,
        isActive: true
      });
      canteenOwners.push(owner);
    }
    console.log(`✅ Created ${canteenOwners.length} canteen owners`);

    // Create regular users
    console.log('\n👥 Creating regular users...');
    const users = [];
    for (let i = 0; i < 20; i++) {
      const fullName = getRandomName();
      const user = await User.create({
        fullName,
        email: getRandomEmail(fullName),
        password: 'User@123',
        phoneNumber: getRandomPhone(),
        role: 'user',
        isEmailVerified: Math.random() > 0.2, // 80% verified
        isActive: true
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} regular users`);

    // Create menu items
    console.log('\n🍽️  Creating menu items...');
    const allMenuItems = [];
    for (let i = 0; i < canteens.length; i++) {
      const canteen = canteens[i];
      const items = menuItemsByCanteen[canteen] || [];
      const owner = canteenOwners[i];
      
      for (const itemData of items) {
        const menuItem = await MenuItem.create({
          ...itemData,
          canteen,
          addedBy: owner._id,
          isAvailable: Math.random() > 0.1, // 90% available
          preparationTime: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
          ingredients: itemData.name.split(' ').slice(0, 3), // Simple ingredients
          allergens: itemData.isVegetarian ? ['None'] : ['Dairy'],
          spiceLevel: ['None', 'Mild', 'Medium', 'Hot'][Math.floor(Math.random() * 4)],
          rating: {
            average: Math.random() * 2 + 3, // 3-5 stars
            count: Math.floor(Math.random() * 20)
          },
          soldCount: Math.floor(Math.random() * 100),
          discount: {
            percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0, // 30% chance of discount
            validUntil: Math.random() > 0.7 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
          },
          image: `assets/images/${itemData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        });
        allMenuItems.push(menuItem);
      }
    }
    console.log(`✅ Created ${allMenuItems.length} menu items`);

    // Create orders
    console.log('\n📦 Creating orders...');
    const orders = [];
    const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    
    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
      const selectedItems = [];
      
      for (let j = 0; j < numItems; j++) {
        const menuItem = allMenuItems[Math.floor(Math.random() * allMenuItems.length)];
        if (menuItem.isAvailable) {
          const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
          const price = menuItem.discountedPrice || menuItem.price;
          selectedItems.push({
            menuItem: menuItem._id,
            name: menuItem.name,
            price: price,
            quantity: quantity,
            subtotal: price * quantity,
            canteen: menuItem.canteen,
            status: 'pending',
            statusUpdatedAt: new Date()
          });
        }
      }

      if (selectedItems.length > 0) {
        const totalAmount = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date in last 30 days

        const order = await Order.create({
          user: user._id,
          items: selectedItems,
          totalAmount: totalAmount,
          status: status,
          paymentStatus: status === 'cancelled' ? 'pending' : (Math.random() > 0.3 ? 'paid' : 'pending'),
          paymentMethod: ['cash', 'card', 'upi', 'wallet'][Math.floor(Math.random() * 4)],
          deliveryType: Math.random() > 0.5 ? 'pickup' : 'table_service',
          tableNumber: Math.random() > 0.5 ? `T${Math.floor(Math.random() * 20) + 1}` : null,
          specialInstructions: Math.random() > 0.7 ? 'Please make it less spicy' : '',
          estimatedReadyTime: new Date(createdAt.getTime() + 20 * 60 * 1000),
          statusHistory: [{
            status: 'pending',
            timestamp: createdAt
          }],
          createdAt: createdAt
        });

        // Update status history based on current status
        if (status !== 'pending') {
          const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
          const currentIndex = statusFlow.indexOf(status);
          for (let k = 1; k <= currentIndex; k++) {
            order.statusHistory.push({
              status: statusFlow[k],
              timestamp: new Date(createdAt.getTime() + k * 5 * 60 * 1000)
            });
          }
          await order.save();
        }

        orders.push(order);
      }
    }
    console.log(`✅ Created ${orders.length} orders`);

    // Create reviews
    console.log('\n⭐ Creating reviews...');
    const completedOrders = orders.filter(o => o.status === 'completed');
    let reviewCount = 0;

    for (const order of completedOrders.slice(0, 30)) { // Review 30 completed orders
      for (const item of order.items) {
        if (Math.random() > 0.5) { // 50% chance of review
          try {
            const review = await Review.create({
              user: order.user,
              menuItem: item.menuItem,
              order: order._id,
              rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
              comment: ['Great food!', 'Very tasty!', 'Loved it!', 'Amazing!', 'Will order again!', 'Highly recommended!'][Math.floor(Math.random() * 6)],
              isVerifiedPurchase: true,
              isVisible: true
            });
            reviewCount++;
          } catch (error) {
            // Skip if review already exists
          }
        }
      }
    }
    console.log(`✅ Created ${reviewCount} reviews`);

    // Update menu item ratings based on reviews
    console.log('\n📊 Updating menu item ratings...');
    const menuItemsWithReviews = await MenuItem.find();
    for (const menuItem of menuItemsWithReviews) {
      const reviews = await Review.find({ menuItem: menuItem._id, isVisible: true });
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        menuItem.rating.average = Math.round(avgRating * 10) / 10;
        menuItem.rating.count = reviews.length;
        await menuItem.save();
      }
    }
    console.log('✅ Menu item ratings updated');

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   👤 Users: ${await User.countDocuments()}`);
    console.log(`   🏪 Canteen Owners: ${await User.countDocuments({ role: 'canteen_owner' })}`);
    console.log(`   🍽️  Menu Items: ${await MenuItem.countDocuments()}`);
    console.log(`   📦 Orders: ${await Order.countDocuments()}`);
    console.log(`   ⭐ Reviews: ${await Review.countDocuments()}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('\n👨‍💼 Admin:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    
    console.log('\n🏪 Canteen Owners (Password: Owner@123):');
    canteenOwners.slice(0, 5).forEach(owner => {
      console.log(`   ${owner.assignedCanteen}: ${owner.email}`);
    });
    console.log(`   ... and ${canteenOwners.length - 5} more`);
    
    console.log('\n👤 Regular Users (Password: User@123):');
    users.slice(0, 5).forEach(user => {
      console.log(`   ${user.fullName}: ${user.email}`);
    });
    console.log(`   ... and ${users.length - 5} more`);
    
    console.log('\n' + '='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

seedDatabase();
