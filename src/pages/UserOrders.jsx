import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './UserOrders.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: 'Are you sure you want to cancel this order?',
      icon: 'warning',
      input: 'textarea',
      inputPlaceholder: 'Reason for cancellation (optional)',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Order',
      cancelButtonText: 'No, Keep Order',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      try {
        await orderAPI.cancelOrder(orderId, result.value || '');
        toast.success('Order cancelled successfully');
        fetchOrders();
      } catch (error) {
        console.error('Failed to cancel order:', error);
        toast.error(error.message || 'Failed to cancel order');
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
      <div className="orders-page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Navbar />

      <section className="orders-section">
        <div className="container">
          <div className="orders-header">
            <h1>My Orders</h1>
            
            <div className="orders-filter">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Orders
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                onClick={() => setFilter('delivered')}
              >
                Delivered
              </button>
              <button
                className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-orders text-center">
              <i className="fas fa-shopping-bag" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
              <h3>No orders found</h3>
              <p>Start ordering from our menu!</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map((order) => (
                <div key={order._id} className="order-card card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{order._id.slice(-8)}</h3>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div 
                      className="order-status"
                      style={{ background: getStatusColor(order.status) }}
                    >
                      <i className={`fas fa-${getStatusIcon(order.status)}`}></i>
                      {order.status}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderBottom: '1px solid #e5e7eb',
                        gap: '1rem'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                            {item.menuItem?.name || item.name}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            {item.canteen || item.menuItem?.canteen || 'Restaurant'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '60px' }}>
                          x{item.quantity}
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '80px', fontWeight: '500' }}>
                          ₹{item.price * item.quantity}
                        </div>
                        <div style={{ minWidth: '100px', textAlign: 'right' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: getStatusColor(item.status || 'pending') + '20',
                            color: getStatusColor(item.status || 'pending'),
                            border: `1px solid ${getStatusColor(item.status || 'pending')}`
                          }}>
                            {(item.status || 'pending').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <span>Total:</span>
                      <span className="total-amount">₹{order.totalAmount}</span>
                    </div>

                    {order.status === 'pending' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        <i className="fas fa-times"></i> Cancel Order
                      </button>
                    )}
                  </div>

                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="order-timeline">
                      <h4>Order Timeline</h4>
                      {order.statusHistory.map((history, index) => (
                        <div key={index} className="timeline-item">
                          <i className={`fas fa-${getStatusIcon(history.status)}`}></i>
                          <div>
                            <strong>{history.status}</strong>
                            <p>{new Date(history.timestamp).toLocaleString()}</p>
                            {history.note && <p className="timeline-note">{history.note}</p>}
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

export default UserOrders;

