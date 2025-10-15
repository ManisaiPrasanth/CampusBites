import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { menuAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const AdminAddMenuItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRestaurantAdmin = user?.role === 'canteen_owner';
  const assignedRestaurant = user?.assignedCanteen;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    canteen: isRestaurantAdmin ? assignedRestaurant : '',
    calories: '',
    isVegetarian: true,
    preparationTime: '15',
  });
  
  const [loading, setLoading] = useState(false);
  
  const categories = [
    'Main Course', 'Snacks', 'Beverages', 'Desserts', 
    'Street Food', 'Bread', 'Side Dish', 'Breakfast', 'Lunch', 'Dinner'
  ];
  
  const canteens = [
    'Raja resturant', 'Namus cake shop', 'Namma ooru Jigarthanda',
    'Hill view kerala mess', 'Godavari ruchulu', 'Sai fast food',
    'Healthy Hotel', 'Kerala cafe', 'Anandam cool down shop',
    'Madurai lee corner', "Mercely's ice cream", 'Kunafa street',
    'Aasife', 'Mr soda', 'Velamal', 'The essence', "Vasu's cafe", 
    'Nalabagam canteen'
  ];
  
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    
    if (!formData.canteen) {
      toast.error('Please select a restaurant');
      return;
    }
    
    setLoading(true);
    
    try {
      await menuAPI.createItem({
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime)
      });
      
      toast.success('Menu item added successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Failed to add menu item:', error);
      toast.error(error.message || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-add-item-page">
      <Navbar />
      
      <section className="admin-section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1>Add New Menu Item</h1>
          
          <form onSubmit={handleSubmit} className="admin-form card" style={{ padding: '2rem' }}>
            <div className="form-group">
              <label htmlFor="name">Item Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Chicken Biryani"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the item"
                rows="3"
              />
            </div>
            
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="price">Price (₹) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="preparationTime">Prep Time (minutes) *</label>
                <input
                  type="number"
                  id="preparationTime"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="canteen">Restaurant *</label>
                <select
                  id="canteen"
                  name="canteen"
                  value={formData.canteen}
                  onChange={handleChange}
                  disabled={isRestaurantAdmin}
                  required
                >
                  <option value="">Select Restaurant</option>
                  {canteens.map(canteen => (
                    <option key={canteen} value={canteen}>{canteen}</option>
                  ))}
                </select>
                {isRestaurantAdmin && (
                  <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    Locked to your assigned restaurant
                  </small>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="calories">Calories</label>
              <input
                type="text"
                id="calories"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                placeholder="e.g., 450-550 Kcal"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="isVegetarian"
                  checked={formData.isVegetarian}
                  onChange={handleChange}
                />
                Vegetarian Item
              </label>
            </div>
            
            <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/admin')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></span> Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i> Add Menu Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AdminAddMenuItem;

