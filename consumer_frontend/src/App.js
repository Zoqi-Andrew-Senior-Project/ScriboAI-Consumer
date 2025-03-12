import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CreateCourse from './CreateCourse';
import Login from './Login';
import Logout from './Logout';
import CreateOrganization from './CreateOrganization';
import { useAuth } from './utils/AuthContext';
import { EmployeeHome } from './EmployeePages/EmployeeHome';
import { ProtectedRoute, ProtectedRouteAdmin, ProtectedRouteEmployee } from './utils/ProtectedRoute';
import HomeRedirect from './utils/HomeRedirect';
import { AdminHome } from './AdminPages/AdminHome';
import EmployeeDashboard from './AdminPages/EmployeeDashboard';
import Settings from './Settings'
import { useState } from 'react';
import DocumentEditor from './CourseManagement/CourseEditor';

function Navbar() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">Scribo.AI</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Training Programs</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Employees</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Analytics</a>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setShowSettings((prev) => !prev)}
                className="nav-link btn btn-link"
              > 
              Settings
              </button>
              {showSettings && <Settings />}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Welcome() {
  return (
    <div className="container-fluid main-content d-flex align-items-center">
      <div className="row w-100">
        <div className="d-flex flex-column align-items-center justify-content-center text-center mb-4">
          <div className="logo-placeholder mb-3"></div> {/* Placeholder for circular logo */}
          <h1>Hello from Scribo!</h1>
          <p>All of your training problems solved with just a few clicks!</p>
          <Link to="/create-organization" className="btn btn-primary btn-big mb-3 w-75">Create an Organization</Link>
          <Link to="/login" className="btn btn-primary btn-big mb-3 w-75">Log in</Link>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2024 Scribo.AI | Corporate Training Platform</p>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} /> 
          <Route path="/home" element={<HomeRedirect />} />
          <Route path="/employee/home" element={<ProtectedRouteEmployee><EmployeeHome /></ProtectedRouteEmployee>} />
          <Route path="/admin/home" element={<ProtectedRouteAdmin><AdminHome /></ProtectedRouteAdmin>} />

          {/* Admin Pages */}

          <Route path="/admin/employee-dashboard" element={<ProtectedRouteAdmin><EmployeeDashboard /></ProtectedRouteAdmin>} />

          <Route path="/create-course" element={<CreateCourse />} />

          <Route path="/create-organization" element={<CreateOrganization />} />
          <Route path="/login" element={<Login />} />
          <Route path="/document" element={<DocumentEditor docId="123" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
