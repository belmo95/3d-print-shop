import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import Checkout from './components/Checkout';
import './styles/App.css';
import './styles/Header.css';
import './styles/Footer.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav">
  <div className="nav-container">
    <h1 className="nav-logo" onClick={() => window.location.href = '/'}>
      <span className="nav-logo-icon">🎨</span>
      <span className="nav-logo-text">3D Print Shop</span>
    </h1>
    <div className="nav-links">
      <a href="/">Početna</a>
      <a href="/admin">Admin</a>
    </div>
  </div>
</nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>

        <footer className="footer">
          <div className="footer-container">
            <div className="footer-grid">
              <div className="footer-section">
                <h3>O nama</h3>
                <p>Mi smo mali tim entuzijasta posvećenih kreiranju unikatnih 3D printanih proizvoda za vaš dom i zabavu.</p>
              </div>
              <div className="footer-section">
                <h3>Brzi linkovi</h3>
                <ul>
                  <li><a href="/">Početna</a></li>
                  <li><a href="/admin">Admin panel</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h3>Kontakt</h3>
                <p>📍 Bosna i Hercegovina</p>
                <p>📧 info@3dprintshop.ba</p>
                <p>📞 +387 61 123 456</p>
                <div className="footer-social">
                  <a href="#">📘</a>
                  <a href="#">📷</a>
                  <a href="#">🎵</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2026 3D Print Shop. Sva prava zadržana.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;