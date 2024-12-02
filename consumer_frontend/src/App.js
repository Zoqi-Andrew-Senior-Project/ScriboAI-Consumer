import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CreateCourse from './CreateCourse';
import Signup from './Signup';


function Navbar() {
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
              <a className="nav-link" href="#">Settings</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="container-fluid main-content d-flex align-items-center">
      <div className="row w-100">
        {/* Left Column: Logo and Welcome Message */}
        <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center text-center mb-4">
          <div className="logo-placeholder mb-3"></div> {/* Placeholder for circular logo */}
          <h1>Hello from Scribo!</h1>
          <p>All of your training problems solved with just a few clicks!</p>
        </div>

        {/* Right Column: Buttons stacked on top of each other */}
        <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center">
          <Link to="/create-course" className="btn btn-primary btn-big mb-3 w-75">Create a Course</Link>
          <button className="btn btn-primary btn-big mb-3 w-75">Employee Management</button>
          <button className="btn btn-primary btn-big w-75">Existing Courses</button>
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
          <Route path="/" element={<Signup />} /> 
          <Route path="/home" element={<Home />} /> 
          <Route path="/create-course" element={<CreateCourse />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
