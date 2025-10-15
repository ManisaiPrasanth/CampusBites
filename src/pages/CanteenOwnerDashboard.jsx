import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { canteenOwnerAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import './CanteenOwnerDashboard.css';

const CanteenOwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await canteenOwnerAPI.getDashboard();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="canteen-owner-page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="canteen-owner-page">
      <Navbar />

      <section className="dashboard-section">
        <div className="container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>🏪 My Canteen Dashboard</h1>
              <p className="canteen-name">{stats?.canteen}</p>
            </div>
            <div className="dashboard-actions">
              <Link to="/canteen-owner/menu" className="btn btn-primary">
                <i className="fas fa-plus"></i> Manage Menu
              </Link>
              <Link to="/canteen-owner/orders" className="btn btn-accent">
                <i className="fas fa-shopping-bag"></i> View Orders
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid grid grid-4">
            <div className="stat-card card">
              <div className="stat-icon" style={{ background: '#3b82f6' }}>
                <i className="fas fa-utensils"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.totalMenuItems || 0}</h3>
                <p>Total Menu Items</p>
                <small>{stats?.availableItems || 0} available</small>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon" style={{ background: '#f59e0b' }}>
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.pendingOrders || 0}</h3>
                <p>Pending Orders</p>
                <small>Need attention</small>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon" style={{ background: '#10b981' }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.completedOrders || 0}</h3>
                <p>Completed Orders</p>
                <small>All time</small>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon" style={{ background: '#8b5cf6' }}>
                <i className="fas fa-rupee-sign"></i>
              </div>
              <div className="stat-content">
                <h3>₹{stats?.totalRevenue || '0.00'}</h3>
                <p>Total Revenue</p>
                <small>From delivered orders</small>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="dashboard-row grid grid-2">
            <div className="summary-card card">
              <h3>
                <i className="fas fa-calendar-day"></i> Today's Summary
              </h3>
              <div className="summary-content">
                <div className="summary-item">
                  <span>Orders Today:</span>
                  <strong>{stats?.todayOrders || 0}</strong>
                </div>
                <div className="summary-item">
                  <span>Pending:</span>
                  <strong className="text-warning">{stats?.pendingOrders || 0}</strong>
                </div>
              </div>
            </div>

            <div className="quick-actions card">
              <h3>
                <i className="fas fa-bolt"></i> Quick Actions
              </h3>
              <div className="action-buttons">
                <Link to="/canteen-owner/menu/add" className="action-btn">
                  <i className="fas fa-plus-circle"></i>
                  <span>Add Menu Item</span>
                </Link>
                <Link to="/canteen-owner/orders?status=pending" className="action-btn">
                  <i className="fas fa-bell"></i>
                  <span>Pending Orders</span>
                </Link>
                <button className="action-btn" onClick={fetchDashboardStats}>
                  <i className="fas fa-sync"></i>
                  <span>Refresh Stats</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="tips-card card">
            <h3>
              <i className="fas fa-lightbulb"></i> Tips for Success
            </h3>
            <ul className="tips-list">
              <li>
                <i className="fas fa-check"></i>
                Keep your menu items updated with accurate prices and availability
              </li>
              <li>
                <i className="fas fa-check"></i>
                Respond to orders quickly to maintain customer satisfaction
              </li>
              <li>
                <i className="fas fa-check"></i>
                Set realistic preparation times for each dish
              </li>
              <li>
                <i className="fas fa-check"></i>
                Update order status promptly to keep customers informed
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CanteenOwnerDashboard;

