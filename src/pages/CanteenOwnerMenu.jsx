import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { canteenOwnerAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './CanteenOwnerMenu.css';

const CanteenOwnerMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [canteen, setCanteen] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    preparationTime: '',
    calories: '',
    isVegetarian: true,
    available: true,
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await canteenOwnerAPI.getMyMenuItems();
      setMenuItems(response.menuItems || []);
      setCanteen(response.canteen);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await canteenOwnerAPI.updateMenuItem(editingItem._id, formData);
        toast.success('Menu item updated successfully!');
      } else {
        await canteenOwnerAPI.createMenuItem(formData);
        toast.success('Menu item added successfully!');
      }

      resetForm();
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      toast.error(error.message || 'Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category || '',
      description: item.description || '',
      preparationTime: item.preparationTime || '',
      calories: item.calories || '',
      isVegetarian: item.isVegetarian ?? true,
      available: item.available ?? true,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Delete Menu Item?',
      html: `Are you sure you want to delete <strong>${item.name}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      try {
        await canteenOwnerAPI.deleteMenuItem(item._id);
        toast.success('Menu item deleted successfully!');
        fetchMenuItems();
      } catch (error) {
        console.error('Failed to delete item:', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await canteenOwnerAPI.updateMenuItem(item._id, {
        available: !item.available,
      });
      toast.success(`${item.name} is now ${!item.available ? 'available' : 'unavailable'}`);
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      preparationTime: '',
      calories: '',
      isVegetarian: true,
      available: true,
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="canteen-menu-page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="canteen-menu-page">
      <Navbar />

      <section className="menu-management-section">
        <div className="container">
          {/* Header */}
          <div className="menu-header">
            <div>
              <Link to="/canteen-owner" className="back-link">
                <i className="fas fa-arrow-left"></i> Back to Dashboard
              </Link>
              <h1>Menu Management</h1>
              <p className="canteen-name">{canteen}</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <i className="fas fa-plus"></i> 
              {showAddForm ? 'Cancel' : 'Add New Item'}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="menu-form-card card fade-in">
              <h2>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <form onSubmit={handleSubmit} className="menu-form">
                <div className="form-row grid grid-2">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Chicken Biryani"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g., 120"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-row grid grid-2">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Street Food">Street Food</option>
                      <option value="Bread">Bread</option>
                      <option value="Side Dish">Side Dish</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preparation Time (minutes)</label>
                    <input
                      type="number"
                      name="preparationTime"
                      value={formData.preparationTime}
                      onChange={handleChange}
                      placeholder="e.g., 15"
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the item..."
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-row grid grid-2">
                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      type="text"
                      name="calories"
                      value={formData.calories}
                      onChange={handleChange}
                      placeholder="e.g., 450-550 Kcal"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isVegetarian"
                        checked={formData.isVegetarian}
                        onChange={handleChange}
                      />
                      <span>Vegetarian</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="available"
                        checked={formData.available}
                        onChange={handleChange}
                      />
                      <span>Available</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save"></i> 
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Menu Items List */}
          <div className="menu-items-section">
            <h2>
              Your Menu Items ({menuItems.length})
            </h2>

            {menuItems.length === 0 ? (
              <div className="no-items card text-center">
                <i className="fas fa-utensils" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
                <h3>No menu items yet</h3>
                <p>Add your first menu item to get started!</p>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                  <i className="fas fa-plus"></i> Add First Item
                </button>
              </div>
            ) : (
              <div className="menu-items-grid grid grid-2">
                {menuItems.map((item) => (
                  <div key={item._id} className={`menu-item-card card ${!item.available ? 'unavailable' : ''}`}>
                    <div className="item-header">
                      <div>
                        <h3>{item.name}</h3>
                        {item.isVegetarian && (
                          <span className="veg-badge">🌿 Veg</span>
                        )}
                      </div>
                      <div className="item-price">₹{item.price}</div>
                    </div>

                    <div className="item-meta">
                      {item.category && (
                        <span className="meta-badge">
                          <i className="fas fa-tag"></i> {item.category}
                        </span>
                      )}
                      {item.preparationTime && (
                        <span className="meta-badge">
                          <i className="fas fa-clock"></i> {item.preparationTime} min
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}

                    {item.calories && (
                      <p className="item-calories">
                        <i className="fas fa-fire"></i> {item.calories}
                      </p>
                    )}

                    <div className="item-status">
                      <span className={`status-badge ${item.available ? 'available' : 'unavailable'}`}>
                        {item.available ? '✓ Available' : '✗ Unavailable'}
                      </span>
                    </div>

                    <div className="item-actions">
                      <button 
                        className="btn-icon btn-success"
                        onClick={() => toggleAvailability(item)}
                        title={item.available ? 'Mark Unavailable' : 'Mark Available'}
                      >
                        <i className={`fas fa-${item.available ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                      <button 
                        className="btn-icon btn-primary"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(item)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CanteenOwnerMenu;

