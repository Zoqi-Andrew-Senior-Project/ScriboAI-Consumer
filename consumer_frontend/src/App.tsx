import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateCourse from './CourseManagement/CreateCourse';
import Login from './Authentication/Login';
import CreateOrganization from './CreateOrganization';
import { useAuth } from './utils/AuthContext';
import EmployeeHome from './EmployeePages/EmployeeHome';
import { ProtectedRoute, ProtectedRouteAdmin, ProtectedRouteEmployee } from './utils/ProtectedRoute'
import HomeRedirect from './utils/HomeRedirect';
import AdminHome from './AdminPages/AdminHome';
import EmployeeDashboard from './AdminPages/EmployeeDashboard';
import Settings from './Settings';
import { useState } from 'react';
import PageEditor from './CourseManagement/PageEditor';
import OutlineEditor from './CourseManagement/OutlineEditor';
import CourseDashboard from './CourseManagement/CourseDashboard';
import CompleteCourse from './CourseManagement/CompleteCourse';
import PageViewer from './CourseManagement/PageViewer';

function Navbar() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <nav className="bg-secondary text-accent-1">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand Logo */}
        <a className="text-xl font-bold" href="#">
          <img src="/logo.png" alt="Scribo.AI Logo" className="w-12 h-12 mr-2 inline-block" />
          Scribo.AI
        </a>

        {/* Mobile Menu Button */}
        <button
          className="block md:hidden text-white focus:outline-none"
          onClick={() => setShowSettings((prev) => !prev)}
        >
          ☰
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/home" className="hover:text-gray-400">Home</Link>
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className="hover:text-gray-400"
          >
            Settings
          </button>
        </div>
      </div>
      {/* Settings Modal */}
      {showSettings && <Settings />}
    </nav>
  );
}

function Welcome() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg text-center">
        {/* Placeholder for circular logo */}
        <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
          <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover" />
        </div>

        <h1 className="text-3xl font-bold text-accent-2">Hello from Scribo!</h1>
        <p className="text-accent-2 mt-2">All of your training problems solved with just a few clicks!</p>

        <div className="mt-6 space-y-3">
          <Link 
            to="/create-organization" 
            className="block w-3/4 mx-auto bg-button-primary-bg text-button-primary-txt py-3 rounded-lg text-lg font-semibold hover:bg-button-hover"
          >
            Create an Organization
          </Link>
          <Link 
            to="/login" 
            className="block w-3/4 mx-auto bg-button-primary-bg text-button-primary-txt py-3 rounded-lg text-lg font-semibold hover:bg-button-hover"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
  <footer className="w-full bg-secondary text-accent-1 text-center py-4">
    <p>&copy; 2024 Scribo.AI | Corporate Training Platform</p>
  </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="bg-primary">
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/create-organization" element={<CreateOrganization />} />

          {/* Home Pahes */}
          <Route path="/home" element={<HomeRedirect />} />
          <Route path="/employee/home" element={<ProtectedRouteEmployee><EmployeeHome /></ProtectedRouteEmployee>} />
          <Route path="/admin/home" element={<ProtectedRouteAdmin><AdminHome /></ProtectedRouteAdmin>} />

          {/* Employee Management */}
          <Route path="/admin/employee-dashboard" element={<ProtectedRouteAdmin><EmployeeDashboard /></ProtectedRouteAdmin>} />

          {/* Course Management */}
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/document/:docId" element={<PageEditor />} />
          <Route path="/outline/:outId" element={<OutlineEditor />} />
          <Route path="/course-dashboard" element={<CourseDashboard />} />
          <Route path="/complete-course/:courseId" element={<CompleteCourse />} />

          {/* Course View */}
          <Route path="/view/:docId" element={<PageViewer />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
