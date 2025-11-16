import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { orderAPI, paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Cart.css';

const Cart = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processingPayment, setProcessingPayment] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      // Ask for payment method
      const paymentResult = await Swal.fire({
        title: 'Choose Payment Method',
        html: `
          <div style="text-align: left;">
            <p><strong>Total Items:</strong> ${cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p><strong>Total Amount:</strong> ₹${getCartTotal().toFixed(2)}</p>
            <p style="margin-top: 1rem;">How would you like to pay?</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Pay Online',
        cancelButtonText: 'Cash on Delivery',
        confirmButtonColor: '#1e3a8a',
        cancelButtonColor: '#10b981',
      });

      // Create order first
      const orderData = {
        items: cart.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: getCartTotal(),
        paymentMethod: paymentResult.isConfirmed ? 'card' : 'cash',
      };

      const orderResponse = await orderAPI.createOrder(orderData);
      const order = orderResponse.order;

      if (paymentResult.isConfirmed) {
        // Online payment via Razorpay
        await handleRazorpayPayment(order);
      } else {
        // Cash on delivery
        clearCart();
        closeCart();
        
        await Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully!',
          html: `
            <p>Your order has been placed.</p>
            <p><strong>Order Number:</strong> ${order.orderNumber || order._id}</p>
            <p><strong>Total:</strong> ₹${getCartTotal().toFixed(2)}</p>
            <p style="margin-top: 1rem; color: #10b981;">💵 Pay cash when you receive your order</p>
          `,
          confirmButtonText: 'View Orders',
          confirmButtonColor: '#1e3a8a',
        });
        
        navigate('/orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order');
    }
  };

  const handleRazorpayPayment = async (order) => {
    try {
      setProcessingPayment(true);

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection.');
      }

      // Create Razorpay order
      const paymentResponse = await paymentAPI.createRazorpayOrder(
        order.totalAmount,
        order._id
      );

      const { order: razorpayOrder, key } = paymentResponse;

      // Razorpay options
      const options = {
        key: key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'CampusBites',
        description: `Order #${order.orderNumber || order._id}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Verify payment
            await paymentAPI.verifyPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              order._id
            );

            clearCart();
            closeCart();

            await Swal.fire({
              icon: 'success',
              title: 'Payment Successful!',
              html: `
                <p>Your order has been placed and payment is confirmed.</p>
                <p><strong>Order Number:</strong> ${order.orderNumber || order._id}</p>
                <p><strong>Payment ID:</strong> ${response.razorpay_payment_id}</p>
                <p><strong>Total:</strong> ₹${order.totalAmount.toFixed(2)}</p>
              `,
              confirmButtonText: 'View Orders',
              confirmButtonColor: '#1e3a8a',
            });

            navigate('/orders');
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phoneNumber || '',
        },
        theme: {
          color: '#1e3a8a',
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setProcessingPayment(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={closeCart}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close-btn" onClick={closeCart}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <i className="fas fa-shopping-cart" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
              <p>Your cart is empty</p>
              <button className="btn btn-primary" onClick={closeCart}>
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="cart-item">
                <img 
                  src={item.image || '/placeholder-food.jpg'} 
                  alt={item.name}
                  onError={(e) => { e.target.src = '/placeholder-food.jpg' }}
                />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="cart-item-price">₹{item.price}</p>
                  <button 
                    className="cart-item-remove" 
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="cart-item-quantity">
                  <button onClick={() => incrementQuantity(item._id)}>
                    <i className="fas fa-chevron-up"></i>
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => decrementQuantity(item._id)}>
                    <i className="fas fa-chevron-down"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span className="cart-total-amount">₹{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="cart-actions">
              <button className="btn btn-secondary" onClick={clearCart} disabled={processingPayment}>
                Clear Cart
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCheckout}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-credit-card"></i> Checkout
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
