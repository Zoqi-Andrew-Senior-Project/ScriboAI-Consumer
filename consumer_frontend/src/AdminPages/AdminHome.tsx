import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';

function AdminHome() {
    const { user, loading } = useAuth();
  
    if (loading) return <div>Loading...</div>;
  
    if (!user) return <div>Please log in.</div>;
  
    return (
      <div className="container-fluid main-content d-flex align-items-center">
        <div className="row w-100">
          {/* Left Column: Logo and Welcome Message */}
          <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center text-center mb-4">
            <div className="logo-placeholder mb-3"></div> {/* Placeholder for circular logo */}
            <h1>Hello {user.first_name}!</h1>
            <h2>Admin Dashboard</h2>
            <p>All of your training problems solved with just a few clicks!</p>
          </div>
  
          {/* Right Column: Buttons stacked on top of each other */}
          <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center">
            <Link to="/create-course" className="btn btn-primary btn-big mb-3 w-75">Create Course</Link>
            <Link to="/admin/employee-dashboard" className="btn btn-primary btn-big mb-3 w-75">Employee Management</Link>
            <button className="btn btn-primary btn-big mb-3 w-75">View your stats</button>
          </div>
        </div>
      </div>
    );
  }

export default AdminHome;