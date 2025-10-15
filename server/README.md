# 🍽️ CampusBites MongoDB Backend

Professional Node.js + Express + MongoDB backend for the CampusBites canteen ordering system.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (copy from .env.example)
cp .env.example .env

# 3. Start MongoDB (if not running)
mongod

# 4. Seed database with sample data
npm run seed

# 5. Start server
npm run dev
```

Server will start at: **http://localhost:5000**

## 📂 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection config
├── controllers/
│   ├── auth.controller.js   # Authentication logic
│   ├── menu.controller.js   # Menu management
│   ├── order.controller.js  # Order processing
│   └── review.controller.js # Reviews & ratings
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Global error handling
│   └── validation.js        # Request validation
├── models/
│   ├── User.js              # User schema & methods
│   ├── MenuItem.js          # Menu item schema
│   ├── Order.js             # Order schema
│   └── Review.js            # Review schema
├── routes/
│   ├── auth.routes.js       # Auth endpoints
│   ├── menu.routes.js       # Menu endpoints
│   ├── order.routes.js      # Order endpoints
│   └── review.routes.js     # Review endpoints
├── seeders/
│   └── seed.js              # Database seeder
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies & scripts
├── README.md                # This file
└── server.js                # Main entry point
```

## 🔑 Environment Variables

Create a `.env` file with these variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campusbites
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
ADMIN_EMAIL=admin@campusbites.com
ADMIN_PASSWORD=Admin@123
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/search?q=query` - Search items
- `GET /api/menu/canteen/:canteen` - Items by canteen
- `GET /api/menu/:id` - Get single item
- `POST /api/menu` - Create item (Admin)
- `PUT /api/menu/:id` - Update item (Admin)
- `DELETE /api/menu/:id` - Delete item (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - User's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders` - All orders (Admin)
- `PUT /api/orders/:id/status` - Update status (Admin)

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/item/:menuItemId` - Item reviews
- `GET /api/reviews/my-reviews` - User reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation
- ✅ Account lockout protection

## 🛠️ NPM Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server (nodemon)
npm run seed    # Seed database with sample data
```

## 📊 Database Collections

- **users** - User accounts & authentication
- **menuitems** - Food menu items
- **orders** - Customer orders
- **reviews** - Item reviews & ratings

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/health

# Get menu items
curl http://localhost:5000/api/menu

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@example.com","password":"Test@123","phoneNumber":"9876543210"}'
```

## 📝 Default Credentials

After running `npm run seed`:

- **Admin:** admin@campusbites.com / Admin@123
- **User:** john@example.com / Password123

## 🔧 Development

```bash
# Install dependencies
npm install

# Start MongoDB
mongod

# Run in development mode
npm run dev
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Use process manager (PM2)
5. Enable MongoDB authentication
6. Set up SSL/TLS
7. Configure backups

## 📄 License

MIT License - See parent project for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Built with ❤️ using Node.js, Express & MongoDB**

