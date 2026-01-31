import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Search.css';

const Search = ({ userData, onLogout, isAuthenticated }) => {
  const [filters, setFilters] = useState({
    color: '',
    type: ''
  });
  const [gemPosts, setGemPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      const queryParams = new URLSearchParams();
      if (filters.color) queryParams.append('color', filters.color);
      if (filters.type) queryParams.append('type', filters.type);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/gem-posts/search?${queryParams}`);
      const data = await response.json();
      if (response.ok) {
        setGemPosts(data);
      } else {
        console.error('Failed to search gem posts');
      }
    } catch (error) {
      console.error('Error searching gem posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ color: '', type: '' });
    setGemPosts([]);
    setHasSearched(false);
  };

  // ADD DELETE FUNCTION FOR SEARCH PAGE
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this gem post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/gem-posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        // Remove the deleted post from state
        setGemPosts(gemPosts.filter(post => post.id !== postId));
        alert('Gem post deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete gem post');
      }
    } catch (error) {
      console.error('Error deleting gem post:', error);
      alert('Error deleting gem post. Please try again.');
    }
  };

  return (
    <div className="search-container">
      <header className="search-header">
        <h1>🔍 Search Gems</h1>
        <nav className="nav-links">
          <Link to="/" className="nav-btn">Home</Link>
          {isAuthenticated && <Link to="/add-post" className="nav-btn">Add Post</Link>}
          {isAuthenticated ? (
            <>
              <span className="welcome">Welcome, {userData?.name}!</span>
              <button onClick={onLogout} className="nav-btn logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn">Login</Link>
              <Link to="/signup" className="nav-btn">Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      <div className="search-content">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="color">Filter by Color</label>
              <select
                id="color"
                name="color"
                value={filters.color}
                onChange={handleFilterChange}
              >
                <option value="">All Colors</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="White">White</option>
                <option value="Green">Green</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="type">Filter by Type</label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Sapphire">Sapphire</option>
                <option value="Emerald">Emerald</option>
              </select>
            </div>

            <div className="filter-actions">
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button type="button" className="clear-btn" onClick={clearFilters}>
                Clear
              </button>
            </div>
          </div>
        </form>

        <div className="search-results">
          {hasSearched && (
            <>
              <h2>
                {gemPosts.length === 0 ? 'No gems found' : `Found ${gemPosts.length} gem(s)`}
                {(filters.color || filters.type) && (
                  <span className="filter-info">
                    {filters.color && ` • Color: ${filters.color}`}
                    {filters.type && ` • Type: ${filters.type}`}
                  </span>
                )}
              </h2>

              {loading ? (
                <div className="loading">Searching gems...</div>
              ) : (
                <div className="posts-grid">
                  {gemPosts.map(post => (
                    <div key={post.id} className="gem-card">
                      <div className="gem-header">
                        <h3>{post.gem_type}</h3>
                        <div className="gem-header-right">
                          <span className={`color-badge ${post.gem_color.toLowerCase()}`}>
                            {post.gem_color}
                          </span>
                          {/* ADD DELETE BUTTON - Only show if user owns the post */}
                          {isAuthenticated && userData && post.user_id === userData.id && (
                            <button
                              className="delete-btn"
                              onClick={() => handleDeletePost(post.id)}
                              title="Delete this post"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="gem-details">
                        <p><strong>Weight:</strong> {post.gem_weight} {post.gem_weight_unit}</p>
                        <p><strong>Owner:</strong> {post.owner_name}</p>
                        <p><strong>Contact:</strong> {post.contact_number}</p>
                        <p><strong>Address:</strong> {post.address}</p>
                        {post.other_info && (
                          <p><strong>Additional Info:</strong> {post.other_info}</p>
                        )}
                        <p className="post-date">
                          Posted on: {new Date(post.posted_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;