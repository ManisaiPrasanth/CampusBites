import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { canteenOwnerAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './CanteenOwnerOrders.css';

const CanteenOwnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [canteen, setCanteen] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await canteenOwnerAPI.getMyOrders();
      setOrders(response.orders || []);
      setCanteen(response.canteen);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const statusFlow = {
      pending: { next: 'confirmed', label: 'Confirm Order', color: '#3b82f6' },
      confirmed: { next: 'preparing', label: 'Start Preparing', color: '#8b5cf6' },
      preparing: { next: 'ready', label: 'Mark as Ready', color: '#10b981' },
      ready: { next: 'delivered', label: 'Mark as Delivered', color: '#059669' },
    };

    const nextStatus = statusFlow[currentStatus];

    if (!nextStatus) {
      toast.error('Order is already in final status');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: nextStatus.label,
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 1rem;">Update order status to <strong>${nextStatus.next}</strong></p>
          ${nextStatus.next === 'ready' ? `
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              Ready Time (minutes from now):
            </label>
            <input id="ready-time" type="number" class="swal2-input" 
                   style="width: 100%; margin: 0;" 
                   placeholder="e.g., 15" min="1" max="120" value="15">
          ` : `
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              Add a note (optional):
            </label>
            <textarea id="status-note" class="swal2-textarea" 
                      style="width: 100%; margin: 0;" 
                      placeholder="Any additional information..."></textarea>
          `}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: nextStatus.label,
      cancelButtonText: 'Cancel',
      confirmButtonColor: nextStatus.color,
      preConfirm: () => {
        if (nextStatus.next === 'ready') {
          const readyTime = document.getElementById('ready-time').value;
          return { readyTime: parseInt(readyTime) || 15 };
        } else {
          const note = document.getElementById('status-note').value;
          return { note };
        }
      }
    });

    if (formValues) {
      try {
        let note = formValues.note || '';
        
        if (nextStatus.next === 'ready' && formValues.readyTime) {
          note = `Your order will be ready in ${formValues.readyTime} minutes`;
          
          // Show countdown toast
          toast.success(`Order marked as ready! Customer notified: ${formValues.readyTime} minutes`, {
            duration: 5000,
            icon: '⏰',
          });
        } else {
          toast.success(`Order status updated to ${nextStatus.next}`);
        }

        await canteenOwnerAPI.updateOrderStatus(orderId, nextStatus.next, note);
        fetchOrders();
      } catch (error) {
        console.error('Failed to update status:', error);
        toast.error(error.message || 'Failed to update order status');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#8b5cf6',
      ready: '#10b981',
      delivered: '#059669',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'clock',
      confirmed: 'check-circle',
      preparing: 'utensils',
      ready: 'bell',
      delivered: 'check-double',
      cancelled: 'times-circle',
    };
    return icons[status] || 'info-circle';
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="canteen-orders-page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="canteen-orders-page">
      <Navbar />

      <section className="orders-management-section">
        <div className="container">
          {/* Header */}
          <div className="orders-header">
            <div>
              <Link to="/canteen-owner" className="back-link">
                <i className="fas fa-arrow-left"></i> Back to Dashboard
              </Link>
              <h1>Orders Management</h1>
              <p className="canteen-name">{canteen}</p>
            </div>
            <button className="btn btn-secondary" onClick={fetchOrders}>
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="orders-filter">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({orders.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              Confirmed ({orders.filter(o => o.status === 'confirmed').length})
            </button>
            <button
              className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`}
              onClick={() => setFilter('preparing')}
            >
              Preparing ({orders.filter(o => o.status === 'preparing').length})
            </button>
            <button
              className={`filter-btn ${filter === 'ready' ? 'active' : ''}`}
              onClick={() => setFilter('ready')}
            >
              Ready ({orders.filter(o => o.status === 'ready').length})
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="no-orders card text-center">
              <i className="fas fa-shopping-bag" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
              <h3>No orders found</h3>
              <p>Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map((order) => (
                <div key={order._id} className="order-card card">
                  <div className="order-card-header">
                    <div>
                      <h3>Order #{order._id.slice(-8)}</h3>
                      <p className="order-customer">
                        <i className="fas fa-user"></i> {order.user?.fullName || 'N/A'}
                      </p>
                      <p className="order-contact">
                        <i className="fas fa-phone"></i> {order.user?.phoneNumber || 'N/A'}
                      </p>
                      <p className="order-date">
                        <i className="fas fa-calendar"></i> 
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div 
                      className="order-status-badge"
                      style={{ background: getStatusColor(order.status) }}
                    >
                      <i className={`fas fa-${getStatusIcon(order.status)}`}></i>
                      {order.status}
                    </div>
                  </div>

                  <div className="order-card-body">
                    <h4>Items:</h4>
                    <div className="order-items-list">
                      {order.items
                        .filter(item => item.menuItem?.canteen === canteen)
                        .map((item, index) => (
                          <div key={index} className="order-item-row">
                            <div>
                              <span className="item-name">{item.menuItem?.name || 'Item'}</span>
                              {item.menuItem?.preparationTime && (
                                <span className="prep-time">
                                  <i className="fas fa-clock"></i> {item.menuItem.preparationTime} min
                                </span>
                              )}
                            </div>
                            <div className="item-qty-price">
                              <span className="item-quantity">x{item.quantity}</span>
                              <span className="item-price">₹{item.price * item.quantity}</span>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="order-total-row">
                      <strong>Total:</strong>
                      <strong className="total-amount">₹{order.totalAmount}</strong>
                    </div>
                  </div>

                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="order-card-footer">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusUpdate(order._id, order.status)}
                      >
                        <i className="fas fa-arrow-right"></i> Update Status
                      </button>
                    </div>
                  )}

                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="order-history">
                      <h5>Status History:</h5>
                      {order.statusHistory.slice(-3).reverse().map((history, index) => (
                        <div key={index} className="history-item">
                          <i className={`fas fa-${getStatusIcon(history.status)}`}></i>
                          <div>
                            <strong>{history.status}</strong>
                            <small>{new Date(history.timestamp).toLocaleString('en-IN')}</small>
                            {history.note && <p className="history-note">{history.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CanteenOwnerOrders;

