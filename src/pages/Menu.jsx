import { useState, useEffect } from 'react';
import { menuAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/Navbar';
import Cart from '../components/Cart';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCanteen, setSelectedCanteen] = useState('all');
  const [canteens, setCanteens] = useState([]);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, searchQuery, selectedCanteen]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAllItems();
      setMenuItems(response.menuItems || []);
      
      // Extract unique canteens
      const uniqueCanteens = [...new Set((response.menuItems || []).map(item => item.canteen))];
      setCanteens(uniqueCanteens.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    // Filter by canteen
    if (selectedCanteen !== 'all') {
      filtered = filtered.filter(item => item.canteen === selectedCanteen);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  if (loading) {
    return (
      <div className="menu-page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="menu-page">
      <Navbar />
      <Cart />

      {/* Hero Banner */}
      <section className="menu-hero">
        <div className="container text-center">
          <h1>Premium Menu</h1>
          <p>Discover our delicious selection of food and beverages</p>
        </div>
      </section>

      {/* Menu Section */}
      <section className="menu-section">
        <div className="container">
          {/* Search and Filter */}
          <div className="menu-controls">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-canteen">
              <label>Filter by Canteen:</label>
              <select 
                value={selectedCanteen} 
                onChange={(e) => setSelectedCanteen(e.target.value)}
              >
                <option value="all">All Canteens</option>
                {canteens.map((canteen) => (
                  <option key={canteen} value={canteen}>
                    {canteen}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="no-items text-center">
              <i className="fas fa-search" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
              <h3>No items found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="menu-grid grid grid-3">
              {filteredItems.map((item) => (
                <div key={item._id} className="menu-item card">
                  <div className="menu-item-image">
                    <img
                      src={item.image || '/placeholder-food.jpg'}
                      alt={item.name}
                      onError={(e) => { e.target.src = '/placeholder-food.jpg' }}
                    />
                    {!item.isAvailable && (
                      <div className="unavailable-badge">Unavailable</div>
                    )}
                  </div>

                  <div className="menu-item-content">
                    <h3>{item.name}</h3>
                    
                    <div className="menu-item-meta">
                      {item.category && (
                        <span className="category-badge">{item.category}</span>
                      )}
                      {item.canteen && (
                        <span className="canteen-badge">{item.canteen}</span>
                      )}
                    </div>

                    {item.description && (
                      <p className="menu-item-description">{item.description}</p>
                    )}

                    <div className="menu-item-footer">
                      <div className="price">₹{item.price}</div>
                      
                      {item.isAvailable !== false ? (
                        <button
                          className={`btn ${isInCart(item._id) ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleAddToCart(item)}
                        >
                          {isInCart(item._id) ? (
                            <>
                              <i className="fas fa-check"></i> In Cart
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus"></i> Add to Cart
                            </>
                          )}
                        </button>
                      ) : (
                        <button className="btn" disabled>
                          Unavailable
                        </button>
                      )}
                    </div>
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

export default Menu;

