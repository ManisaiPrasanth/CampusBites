# CampusBites - React Frontend

A modern, feature-rich React application for campus food ordering built with Vite, React Router, and Context API.

## 🚀 Features

- **User Authentication**: Secure login and registration system with JWT
- **Menu Browsing**: Browse food items by category and canteen
- **Cart Management**: Add, remove, and update items in cart
- **Order Management**: Place orders and track order status
- **Admin Dashboard**: Comprehensive admin panel for order and menu management
- **Responsive Design**: Fully responsive UI that works on all devices
- **Real-time Updates**: Toast notifications for all user actions

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Next-generation frontend tooling
- **React Router v6**: Declarative routing
- **Axios**: HTTP client for API requests
- **Context API**: State management
- **SweetAlert2**: Beautiful alert modals
- **React Hot Toast**: Toast notifications
- **Font Awesome**: Icon library

## 📦 Installation

1. **Install dependencies**:
```bash
cd client
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```
VITE_API_URL=http://localhost:5000/api
```

3. **Start development server**:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
client/
├── public/
│   └── (static assets)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Cart.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Menu.jsx
│   │   ├── UserOrders.jsx
│   │   ├── Profile.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── AdminOrders.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## 🔑 Key Features

### Authentication System
- JWT-based authentication
- Protected routes for authenticated users
- Role-based access control (User/Admin)
- Persistent login with localStorage

### Cart Management
- Add/remove items
- Update quantities
- Calculate totals
- Persist cart data per user
- Real-time cart updates

### Order System
- Place orders with cart items
- Track order status
- View order history
- Cancel pending orders
- Order timeline with status updates

### Admin Panel
- Dashboard with statistics
- Manage all orders
- Update order status
- View customer information

## 🎨 Styling

The application uses a custom CSS architecture with:
- CSS Variables for theming
- Modular CSS files per component
- Responsive design with mobile-first approach
- Professional color scheme
- Smooth animations and transitions

## 📱 Responsive Design

The app is fully responsive and works seamlessly on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔒 Security Features

- Secure authentication with JWT
- Protected routes
- Role-based access control
- Input validation
- CORS configuration
- XSS protection

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy
The build output will be in the `dist/` directory. You can deploy this to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 🔧 Configuration

### API Integration
Update `VITE_API_URL` in `.env` to point to your backend server.

### Proxy Setup
Vite is configured to proxy API requests to the backend server during development (see `vite.config.js`).

## 🤝 API Endpoints Used

The frontend connects to these backend endpoints:

### Auth
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/update-profile` - Update profile
- PUT `/api/auth/change-password` - Change password

### Menu
- GET `/api/menu` - Get all menu items
- GET `/api/menu/:id` - Get single menu item
- GET `/api/menu/search?q=query` - Search menu items
- GET `/api/menu/canteen/:canteen` - Get items by canteen

### Orders
- POST `/api/orders` - Create order
- GET `/api/orders/my-orders` - Get user's orders
- GET `/api/orders/:id` - Get single order
- PUT `/api/orders/:id/cancel` - Cancel order
- GET `/api/orders` - Get all orders (Admin)
- PUT `/api/orders/:id/status` - Update order status (Admin)
- GET `/api/orders/stats/dashboard` - Get order stats (Admin)

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@campusbites.com or create an issue in the repository.

## 🎉 Acknowledgments

- React Team for the amazing framework
- Vite for the blazing fast build tool
- All open-source contributors

---

**Note**: Make sure the backend server is running before starting the frontend application.

