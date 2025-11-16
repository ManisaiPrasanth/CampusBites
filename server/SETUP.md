# 🚀 Database Setup Guide

## Step 1: Configure MongoDB Connection

1. Create a `.env` file in the `server` directory
2. Add your MongoDB connection string:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection - REPLACE WITH YOUR CLUSTER URL
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campusbites?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Admin Credentials
ADMIN_EMAIL=admin@klu.ac.in
ADMIN_PASSWORD=Admin@123

# Email Configuration (Optional - for email notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 2: Get Your MongoDB Connection String

### For MongoDB Atlas:
1. Go to your MongoDB Atlas cluster
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `campusbites` (or your preferred database name)

Example:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/campusbites?retryWrites=true&w=majority
```

## Step 3: Seed the Database

Run the seeder to populate your database with sample data:

```bash
cd server
npm run seed
```

This will create:
- ✅ 1 Admin user
- ✅ 18 Canteen owners (one for each canteen)
- ✅ 20 Regular users
- ✅ ~100+ Menu items (across all 18 canteens)
- ✅ 50 Sample orders
- ✅ 30+ Reviews

## Step 4: Verify Setup

After seeding, you should see:
```
✅ DATABASE SEEDED SUCCESSFULLY!
📊 Summary:
   👤 Users: 39
   🏪 Canteen Owners: 18
   🍽️  Menu Items: ~100+
   📦 Orders: 50
   ⭐ Reviews: 30+
```

## Default Login Credentials

After seeding:

**Admin:**
- Email: `admin@klu.ac.in`
- Password: `Admin@123`

**Canteen Owners:**
- Email: `[canteenname]@canteen.klu.ac.in`
- Password: `Owner@123`

**Regular Users:**
- Email: `[randomname][number]@klu.ac.in`
- Password: `User@123`

## Troubleshooting

### Connection Error
If you see `MongoDB connection failed`:
1. Check your `.env` file exists
2. Verify `MONGODB_URI` is correct
3. Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (or your IP)
4. Verify your database user has read/write permissions

### Seeder Errors
- Make sure MongoDB is accessible
- Check that the connection string is correct
- Verify you have write permissions to the database

## Next Steps

After successful seeding:
1. Start the server: `npm run dev`
2. Start the client: `cd ../client && npm run dev`
3. Login with admin credentials to test


