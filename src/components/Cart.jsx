import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { orderAPI } from '../services/api';
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
  
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Confirm Order',
        html: `
          <div style="text-align: left;">
            <p><strong>Total Items:</strong> ${cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p><strong>Total Amount:</strong> ₹${getCartTotal().toFixed(2)}</p>
            <p style="margin-top: 1rem;">Do you want to place this order?</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Place Order',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#1e3a8a',
        cancelButtonColor: '#ef4444',
      });

      if (result.isConfirmed) {
        const orderData = {
          items: cart.map((item) => ({
            menuItem: item._id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: getCartTotal(),
        };

        const response = await orderAPI.createOrder(orderData);
        
        clearCart();
        closeCart();
        
        await Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully!',
          html: `
            <p>Your order has been placed.</p>
            <p><strong>Order ID:</strong> ${response.order?._id || 'N/A'}</p>
            <p><strong>Total:</strong> ₹${getCartTotal().toFixed(2)}</p>
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
              <button className="btn btn-secondary" onClick={clearCart}>
                Clear Cart
              </button>
              <button className="btn btn-primary" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;

