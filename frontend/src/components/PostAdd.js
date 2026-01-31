import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PostAdd.css';

const PostAdd = ({ userData, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    posted_date: new Date().toISOString().split('T')[0],
    gem_type: '',
    gem_color: '',
    gem_weight: '',
    gem_weight_unit: 'g',
    owner_name: '',
    contact_number: '',
    address: '',
    other_info: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.posted_date) newErrors.posted_date = 'Posted date is required';
    if (!formData.gem_type) newErrors.gem_type = 'Gem type is required';
    if (!formData.gem_color) newErrors.gem_color = 'Gem color is required';
    if (!formData.gem_weight || formData.gem_weight <= 0) newErrors.gem_weight = 'Valid gem weight is required';
    if (!formData.owner_name.trim()) newErrors.owner_name = 'Owner name is required';
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/gem-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        alert('Gem post created successfully!');
        navigate('/');
      } else {
        setErrors({ submit: data.message || 'Failed to create gem post' });
      }
    } catch (error) {
      console.error('Error creating gem post:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-add-container">
      <header className="post-add-header">
        <h1>Add New Gem Post</h1>
        <nav className="nav-links">
          <Link to="/" className="nav-btn">Home</Link>
          <Link to="/search" className="nav-btn">Search</Link>
          <span className="welcome">Welcome, {userData?.name}!</span>
          <button onClick={onLogout} className="nav-btn logout">Logout</button>
        </nav>
      </header>

      <div className="form-container">
        <form className="post-add-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="posted_date">Posted Date *</label>
              <input
                type="date"
                id="posted_date"
                name="posted_date"
                value={formData.posted_date}
                onChange={handleChange}
              />
              {errors.posted_date && <span className="error">{errors.posted_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gem_type">Gem Type *</label>
              <select
                id="gem_type"
                name="gem_type"
                value={formData.gem_type}
                onChange={handleChange}
              >
                <option value="">Select Gem Type</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Sapphire">Sapphire</option>
                <option value="Emerald">Emerald</option>
              </select>
              {errors.gem_type && <span className="error">{errors.gem_type}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gem_color">Gem Color *</label>
              <select
                id="gem_color"
                name="gem_color"
                value={formData.gem_color}
                onChange={handleChange}
              >
                <option value="">Select Gem Color</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="White">White</option>
                <option value="Green">Green</option>
              </select>
              {errors.gem_color && <span className="error">{errors.gem_color}</span>}
            </div>

            <div className="form-group weight-group">
              <label htmlFor="gem_weight">Gem Weight *</label>
              <div className="weight-input">
                <input
                  type="number"
                  id="gem_weight"
                  name="gem_weight"
                  value={formData.gem_weight}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                <select
                  name="gem_weight_unit"
                  value={formData.gem_weight_unit}
                  onChange={handleChange}
                >
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                </select>
              </div>
              {errors.gem_weight && <span className="error">{errors.gem_weight}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="owner_name">Owner Name *</label>
            <input
              type="text"
              id="owner_name"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              placeholder="Enter owner's full name"
            />
            {errors.owner_name && <span className="error">{errors.owner_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contact_number">Contact Number *</label>
            <input
              type="text"
              id="contact_number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
            {errors.contact_number && <span className="error">{errors.contact_number}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter complete address"
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="other_info">Additional Information (Optional)</label>
            <textarea
              id="other_info"
              name="other_info"
              value={formData.other_info}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional details about the gem..."
            />
          </div>

          {errors.submit && <div className="error submit-error">{errors.submit}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Post...' : 'Create Gem Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostAdd;