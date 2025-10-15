import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const isRestaurantAdmin = user?.role === 'canteen_owner';
  const assignedRestaurant = user?.assignedCanteen;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Restaurant admins only see their restaurant's orders
      const queryParams = isRestaurantAdmin && assignedRestaurant
        ? { canteen: assignedRestaurant }
        : {};
      
      const response = await orderAPI.getAllOrders(queryParams);
      
      // Filter orders to only show those with items from assigned restaurant
      let filteredOrders = response.orders || [];
      
      if (isRestaurantAdmin && assignedRestaurant) {
        filteredOrders = filteredOrders.filter(order =>
          order.items.some(item => 
            item.menuItem?.canteen === assignedRestaurant
          )
        );
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: isRestaurantAdmin 
        ? `Update Status for ${assignedRestaurant} Items` 
        : 'Update Order Status',
      input: 'select',
      inputOptions: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        ready: 'Ready',
        delivered: 'Delivered',
        completed: 'Completed'
      },
      inputValue: currentStatus,
      inputPlaceholder: 'Select status',
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#1e3a8a',
      text: isRestaurantAdmin 
        ? 'This will update the status for your restaurant\'s items only' 
        : 'This will update the status for the entire order',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a status';
        }
      }
    });

    if (newStatus) {
      try {
        if (isRestaurantAdmin) {
          // Update only this restaurant's items
          await orderAPI.updateItemStatus(orderId, assignedRestaurant, newStatus);
          toast.success(`Status updated for ${assignedRestaurant} items`);
        } else {
          // Super admin updates entire order
          await orderAPI.updateStatus(orderId, newStatus, '');
          toast.success('Order status updated successfully');
        }
        fetchOrders();
      } catch (error) {
        console.error('Failed to update status:', error);
        toast.error(error.message || 'Failed to update status');
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="admin-orders-page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <Navbar />

      <section className="admin-orders-section">
        <div className="container">
          <div className="admin-orders-header">
            <h1>{isRestaurantAdmin ? `${assignedRestaurant} Orders` : 'Manage Orders'}</h1>
            
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
              <button
                className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                onClick={() => setFilter('delivered')}
              >
                Delivered ({orders.filter(o => o.status === 'delivered').length})
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-orders text-center">
              <i className="fas fa-inbox" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
              <h3>No orders found</h3>
            </div>
          ) : (
            <div className="admin-orders-grid">
              {filteredOrders.map((order) => (
                <div key={order._id} className="admin-order-card card">
                  <div className="order-card-header">
                    <div>
                      <h3>Order #{order._id.slice(-8)}</h3>
                      <p className="order-customer">
                        <i className="fas fa-user"></i> {order.user?.fullName || 'N/A'}
                      </p>
                      <p className="order-email">
                        <i className="fas fa-envelope"></i> {order.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div 
                      className="order-status-badge"
                      style={{ background: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-items-list">
                      <h4>Items:</h4>
                      {order.items
                        .filter(item => 
                          !isRestaurantAdmin || 
                          item.menuItem?.canteen === assignedRestaurant
                        )
                        .map((item, index) => (
                          <div key={index} className="order-item-row" style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '0.75rem',
                            borderBottom: '1px solid #e5e7eb',
                            gap: '1rem'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500' }}>{item.menuItem?.name || item.name}</div>
                              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                {item.canteen || item.menuItem?.canteen}
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
                        ))
                      }
                    </div>

                    <div className="order-total-row">
                      {isRestaurantAdmin ? (
                        <>
                          <strong>Your Restaurant Total:</strong>
                          <strong className="total-amount">
                            ₹{order.items
                              .filter(item => item.menuItem?.canteen === assignedRestaurant)
                              .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                            }
                          </strong>
                        </>
                      ) : (
                        <>
                          <strong>Total:</strong>
                          <strong className="total-amount">₹{order.totalAmount}</strong>
                        </>
                      )}
                    </div>
                    {isRestaurantAdmin && order.totalAmount !== order.items
                      .filter(item => item.menuItem?.canteen === assignedRestaurant)
                      .reduce((sum, item) => sum + (item.price * item.quantity), 0) && (
                      <div className="order-note" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                        <i className="fas fa-info-circle"></i> Full order total: ₹{order.totalAmount} (includes items from other restaurants)
                      </div>
                    )}

                    <div className="order-meta">
                      <p>
                        <i className="fas fa-calendar"></i> 
                        {new Date(order.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleStatusUpdate(order._id, order.status)}
                    >
                      <i className="fas fa-edit"></i> Update Status
                    </button>
                  </div>
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

export default AdminOrders;

