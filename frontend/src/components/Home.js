import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ userData, onLogout, isAuthenticated }) => {
  const [gemPosts, setGemPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGemPosts();
  }, []);

  const fetchGemPosts = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gem-posts');
      const data = await response.json();
      if (response.ok) {
        setGemPosts(data);
      } else {
        console.error('Failed to fetch gem posts');
      }
    } catch (error) {
      console.error('Error fetching gem posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // ADD DELETE FUNCTION
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this gem post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/gem-posts/${postId}`, {
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

  if (loading) {
    return <div className="loading">Loading gem posts...</div>;
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>💎 Gem Marketplace</h1>
        <nav className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/add-post" className="nav-btn">Add Gem Post</Link>
              <Link to="/search" className="nav-btn">Search Gems</Link>
              <span className="welcome">Welcome, {userData?.name}!</span>
              <button onClick={onLogout} className="nav-btn logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/search" className="nav-btn">Search Gems</Link>
              <Link to="/login" className="nav-btn">Login</Link>
              <Link to="/signup" className="nav-btn">Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      <main className="gem-posts-grid">
        <h2>Available Gems</h2>
        {gemPosts.length === 0 ? (
          <div className="no-posts">
            <p>No gem posts available yet.</p>
            {isAuthenticated && (
              <Link to="/add-post" className="cta-btn">Be the first to post a gem!</Link>
            )}
          </div>
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
                  <p className="posted-by">Posted by: {post.user_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
//56urtyurtyutry