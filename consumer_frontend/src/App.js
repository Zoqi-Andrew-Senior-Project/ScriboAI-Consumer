import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <header className="navbar">
        <h1>Scribo</h1>
      </header>

      <div className="main-content">
        <div className="left-section">
          <div className="logo">
            <img src="logo.png" alt="Scribo Logo" className="circular-logo" />
          </div>
          <div className="greeting">
            <h2>Hello from Scribo</h2>
            <p>The answer to all your job training needs is just a few clicks of a button away!</p>
          </div>
        </div>

        <div className="right-section">
          <button className="btn create-course">Create a Course</button>
          <button className="btn existing-courses">Existing Courses</button>
          <button className="btn employee-management">Employee Management</button>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Scribo. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
