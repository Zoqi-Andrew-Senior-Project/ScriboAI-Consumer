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
import AcceptInvite from './EmployeePages/AcceptInvite';
import EmployeeCourseDashboard from './EmployeePages/EmployeeCourseDashboard';
import OutlineView from './CourseManagement/OutlineView';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-secondary text-accent-1">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand Logo */}
        <a className="text-3xl font-bold cursor-pointer" 
          onClick={() => navigate("/home")}
        >
          <img src="/logo.png" alt="Scribo.AI Logo" className="w-12 h-12 mr-2 inline-block" />
          ScriboAI
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
          <Link to="/home" className="hover:text-gray-400 text-2xl">Home</Link>
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className="hover:text-gray-400 text-2xl cursor-pointer"
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
      <div className="w-full max-w-xl text-center">
        <div className="w-60 h-60 rounded-full mx-auto mb-4 overflow-hidden">
          <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover" />
        </div>

        <h1 className="text-6xl font-bold text-accent-2">Welcome to ScriboAI!</h1>
        <p className="text-accent-2 mt-2 text-2xl">All of your training problems solved with just a few clicks!</p>

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
      <div className="min-h-screen flex flex-col bg-linear-to-r from-primary to-secondary ">
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/create-organization" element={<CreateOrganization />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />

          {/* Home Pahes */}
          <Route path="/home" element={<HomeRedirect />} />
          <Route path="/employee/home" element={<ProtectedRouteEmployee><EmployeeHome /></ProtectedRouteEmployee>} />
          <Route path="/admin/home" element={<ProtectedRouteAdmin><AdminHome /></ProtectedRouteAdmin>} />

          {/* Employee Management */}
          <Route path="/admin/employee-dashboard" element={<ProtectedRouteAdmin><EmployeeDashboard /></ProtectedRouteAdmin>} />

          {/* Course Management */}
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/edit/page/:docId" element={<PageEditor />} />
          <Route path="/edit/outline/:outId" element={<OutlineEditor />} />
          <Route path="/course-dashboard" element={<CourseDashboard />} />
          <Route path="/complete-course/:courseId" element={<CompleteCourse />} />

          {/* Course View */}
          <Route path="/view/page/:docId" element={<PageViewer />} />
          <Route path="/view/outline/:corId" element={<OutlineView />} />

          <Route path="/employee/course-dashboard" element={<EmployeeCourseDashboard />}></Route>
        </Routes>
        <ToastContainer />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
