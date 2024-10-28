import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

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
              <a className="nav-link" href="#">Home</a>
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

function MainContent() {
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
          <button className="btn btn-primary btn-big mb-3 w-75">Create a Course</button>
          <button className="btn btn-primary btn-big mb-3 w-75">Employee Management</button>
          <button className="btn btn-primary btn-big w-75">Existing Courses</button>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer text-center">
      <p>&copy; 2024 Scribo.AI | Corporate Training Platform</p>
    </footer>
  );
}

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <MainContent />
      <Footer />
    </div>
  );
}

export default App;
