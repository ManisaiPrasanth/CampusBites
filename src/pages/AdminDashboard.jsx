import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, menuAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isRestaurantAdmin = user?.role === 'canteen_owner';
  const assignedRestaurant = user?.assignedCanteen;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = isRestaurantAdmin && assignedRestaurant
        ? { canteen: assignedRestaurant }
        : {};
      
      const [statsData, ordersData] = await Promise.all([
        orderAPI.getStats(queryParams),
        orderAPI.getAllOrders({ ...queryParams, limit: 5, sort: '-createdAt' }),
      ]);

      setStats(statsData.stats || null);
      setRecentOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Navbar />

      <section className="admin-section">
        <div className="container">
          <div className="admin-header">
            <h1>{isRestaurantAdmin ? `${assignedRestaurant} Dashboard` : 'Admin Dashboard'}</h1>
            <div className="admin-actions">
              <Link to="/admin/menu/add" className="btn btn-secondary">
                <i className="fas fa-plus"></i> Add Menu Item
              </Link>
              <Link to="/admin/orders" className="btn btn-primary">
                <i className="fas fa-shopping-bag"></i> Manage Orders
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid grid grid-4">
            <div className="stat-card-admin card">
              <div className="stat-icon" style={{ background: '#3b82f6' }}>
                <i className="fas fa-shopping-bag"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.totalOrders || 0}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className="stat-card-admin card">
              <div className="stat-icon" style={{ background: '#10b981' }}>
                <i className="fas fa-rupee-sign"></i>
              </div>
              <div className="stat-content">
                <h3>₹{stats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
                <p>Total Revenue</p>
              </div>
            </div>

            <div className="stat-card-admin card">
              <div className="stat-icon" style={{ background: '#f59e0b' }}>
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.pendingOrders || 0}</h3>
                <p>Pending Orders</p>
              </div>
            </div>

            <div className="stat-card-admin card">
              <div className="stat-icon" style={{ background: '#8b5cf6' }}>
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.totalCustomers || 0}</h3>
                <p>Total Customers</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="dashboard-section card">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="btn btn-secondary">
                View All Orders
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="no-data text-center">
                <i className="fas fa-inbox" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
                <p>No recent orders</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-8)}</td>
                        <td>{order.user?.fullName || 'N/A'}</td>
                        <td>{order.items?.length || 0} items</td>
                        <td>₹{order.totalAmount}</td>
                        <td>
                          <span className={`status-badge status-${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

