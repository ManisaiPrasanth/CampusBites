require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');

const migrateItemStatus = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusbites', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Get all orders
    const orders = await Order.find({});
    console.log(`📦 Found ${orders.length} orders to migrate`);

    let updated = 0;

    for (const order of orders) {
      let needsUpdate = false;

      // Update each item in the order
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];

        // If item doesn't have status, add it
        if (!item.status) {
          item.status = order.status || 'pending';
          item.statusUpdatedAt = order.updatedAt || new Date();
          needsUpdate = true;
        }

        // If item doesn't have canteen, fetch it from menuItem
        if (!item.canteen && item.menuItem) {
          const menuItem = await MenuItem.findById(item.menuItem);
          if (menuItem) {
            item.canteen = menuItem.canteen;
            needsUpdate = true;
            console.log(`  ✓ Added canteen "${menuItem.canteen}" to item "${item.name}"`);
          }
        }
      }

      if (needsUpdate) {
        // Use markModified to ensure Mongoose detects the changes in the array
        order.markModified('items');
        await order.save();
        updated++;
        console.log(`✓ Updated order ${order.orderNumber}`);
      }
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Migration completed!`);
    console.log(`   Total orders: ${orders.length}`);
    console.log(`   Updated: ${updated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateItemStatus();

