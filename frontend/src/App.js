import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import BookManager from './components/BookManager';
import Navbar from './components/Navbar';
import EBookManager from './components/EBookManager';

function App() {
  const [activeTab, setActiveTab] = useState('books');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'books') {
      window.location.href = '/books';
    } else if (tab === 'ebooks') {
      window.location.href = '/ebooks';
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <div className="books-nav-container">
            <div className="books-nav">
              <button 
                className={`books-nav-button ${activeTab === 'books' ? 'active' : ''}`}
                onClick={() => handleTabChange('books')}
              >
                <div className="button-content">
                  <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div className="button-text">
                    <span className="button-title">My Books</span>
                    <span className="button-subtitle">Manage your personal collection</span>
                  </div>
                </div>
              </button>
              <button 
                className={`books-nav-button ${activeTab === 'ebooks' ? 'active' : ''}`}
                onClick={() => handleTabChange('ebooks')}
              >
                <div className="button-content">
                  <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <div className="button-text">
                    <span className="button-title">eBook Collection</span>
                    <span className="button-subtitle">Explore digital library</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <Routes>
            <Route path="/" element={<BookManager />} />
            <Route path="/books" element={<BookManager />} />
            <Route path="/ebooks" element={<EBookManager />} />
            <Route path="/clients" element={<div>Clients Page Coming Soon</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
