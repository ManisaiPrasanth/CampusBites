import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    if (user) {
      const userId = user._id || user.id;
      const savedCart = localStorage.getItem(`cart_${userId}`);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      }
    } else {
      setCart([]);
    }
  }, [user]);

  // Save cart to localStorage
  useEffect(() => {
    if (user && cart.length > 0) {
      const userId = user._id || user.id;
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i._id === item._id);
      
      if (existingItem) {
        toast.success('Quantity updated in cart');
        return prevCart.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        toast.success('Item added to cart');
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((i) => i._id !== itemId);
      toast.success('Item removed from cart');
      return newCart;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((i) =>
        i._id === itemId ? { ...i, quantity } : i
      )
    );
  };

  const incrementQuantity = (itemId) => {
    setCart((prevCart) =>
      prevCart.map((i) =>
        i._id === itemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decrementQuantity = (itemId) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i._id === itemId);
      if (item && item.quantity <= 1) {
        removeFromCart(itemId);
        return prevCart;
      }
      return prevCart.map((i) =>
        i._id === itemId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    if (user) {
      const userId = user._id || user.id;
      localStorage.removeItem(`cart_${userId}`);
    }
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (itemId) => {
    return cart.some((i) => i._id === itemId);
  };

  const getItemQuantity = (itemId) => {
    const item = cart.find((i) => i._id === itemId);
    return item ? item.quantity : 0;
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const value = {
    cart,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getItemQuantity,
    toggleCart,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

