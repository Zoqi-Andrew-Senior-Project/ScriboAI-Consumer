import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';

function AdminHome() {
    const { user, loading } = useAuth();
  
    if (loading) return <div>Loading...</div>;
  
    if (!user) return <div>Please log in.</div>;
  
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-4xl">
          {/* Left Column: Logo and Welcome Message */}
          <div className="flex flex-col items-center justify-center text-center mb-12">
            <div className="w-60 h-60 rounded-full mx-auto mb-4 overflow-hidden">
              <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-6xl font-bold text-tertiary mb-2">Hello {user.first_name}!</h1>
            <h2 className="text-4xl text-tertiary">Admin Dashboard</h2>
            <p className="text-2xl text-tertiary mt-2">All of your training problems solved with just a few clicks!</p>
          </div>
  
          {/* Right Column: Buttons stacked on top of each other */}
          <div className="flex flex-row items-center justify-center space-x-4">
            <Link to="/create-course" className="text-2xl bg-button-primary-bg hover:bg-button-hover text-white font-semibold py-4 px-8 rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-110">
              Create Course
            </Link>
            <Link to="/course-dashboard" className="text-2xl bg-button-primary-bg hover:bg-button-hover text-white font-semibold py-4 px-8 rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-110">
              Manage Courses
            </Link>
            <Link to="/admin/employee-dashboard" className="text-2xl bg-button-primary-bg hover:bg-button-hover text-white font-semibold py-4 px-8 rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-110">
              Employee Management
            </Link>
          </div>
        </div>
      </div>
    );
  }

export default AdminHome;