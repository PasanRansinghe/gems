import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Home from "./components/Home";
import PostAdd from "./components/PostAdd";
import Search from "./components/Search";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUserData(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
                <Login onLogin={handleLogin} /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
            path="/signup" 
            element={
              !isAuthenticated ? 
                <SignUp onSignUp={handleLogin} /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
            path="/" 
            element={
              <Home userData={userData} onLogout={handleLogout} isAuthenticated={isAuthenticated} />
            } 
          />
          <Route 
            path="/add-post" 
            element={
              isAuthenticated ? 
                <PostAdd userData={userData} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/search" 
            element={
              <Search userData={userData} onLogout={handleLogout} isAuthenticated={isAuthenticated} />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;