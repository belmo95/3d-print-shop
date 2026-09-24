import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import { useEffect, useState } from 'react';

import {
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import TawkChat from './components/TawkChat';
import ScrollToTop from './components/ScrollToTop';
import UserNotifications from './components/UserNotifications';
import CookieConsent from './components/CookieConsent';

import { auth, db } from './firebase';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import Checkout from './components/Checkout';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';

import './styles/App.css';
import './styles/Header.css';
import './styles/Footer.css';

function Navigation({ user, isAdmin }) {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeUserMenu();
      navigate('/');
    } catch (error) {
      console.error('Greška prilikom odjave:', error);
    }
  };

  const handleProductsClick = (event) => {
    event.preventDefault();
    closeUserMenu();

    if (window.location.pathname === '/') {
      const productsArea = document.getElementById('products-area');

      if (productsArea) {
        productsArea.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    } else {
      navigate('/#products-area');
    }
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeUserMenu}>
          <img
            src="/layerlab3d-site-icon.png"
            alt="LayerLab3D logo"
            className="nav-logo-icon"
          />
          <span className="nav-logo-text">LayerLab3DE</span>
        </Link>

        <div className="nav-links">
          <Link to="/" onClick={closeUserMenu}>
            Početna
          </Link>

          <a href="/#products-area" onClick={handleProductsClick}>
            Proizvodi
          </a>

          {isAdmin && (
            <Link
              to="/admin"
              className="nav-admin-link"
              onClick={closeUserMenu}
            >
              Admin panel
            </Link>
          )}

          {user ? (
            <div className="user-menu">
              <button
                type="button"
                className="user-menu-button"
                onClick={() => setUserMenuOpen((isOpen) => !isOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="user-icon">👤</span>
                <span className="user-menu-text">
                  {user.displayName || user.email}
                </span>
                <UserNotifications />
                <span className="user-menu-arrow">
                  {userMenuOpen ? '▲' : '▼'}
                </span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/profil" onClick={closeUserMenu}>
                    Moj profil
                  </Link>

                  <Link to="/moje-narudzbe" onClick={closeUserMenu}>
                    Moje narudžbe
                  </Link>

                  {isAdmin && (
                    <Link to="/admin" onClick={closeUserMenu}>
                      Admin panel
                    </Link>
                  )}

                  <button type="button" onClick={handleLogout}>
                    Odjavi se
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/prijava" onClick={closeUserMenu}>
                Prijava
              </Link>

              <Link
                to="/registracija"
                className="nav-register"
                onClick={closeUserMenu}
              >
                Registracija
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer({ isAdmin }) {
  const handleFooterProductsClick = (event) => {
    event.preventDefault();

    if (window.location.pathname === '/') {
      const productsArea = document.getElementById('products-area');

      if (productsArea) {
        productsArea.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    } else {
      window.location.href = '/#products-area';
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>O nama</h3>
            <p>
              Mi smo mali tim entuzijasta posvećenih kreiranju unikatnih
              3D printanih proizvoda za vaš dom, posao i zabavu.
            </p>
          </div>

          <div className="footer-section">
            <h3>Brzi linkovi</h3>
            <ul>
              <li>
                <Link to="/">Početna</Link>
              </li>
              <li>
                <a href="/#products-area" onClick={handleFooterProductsClick}>
                  Proizvodi
                </a>
              </li>
              <li>
                <Link to="/profil">Moj profil</Link>
              </li>
              <li>
                <Link to="/moje-narudzbe">Moje narudžbe</Link>
              </li>
              <li>
                <Link to="/privatnost">Politika privatnosti</Link>
              </li>
              <li>
                <Link to="/kolacici">Politika kolačića</Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin">Admin panel</Link>
                </li>
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h3>Kontakt</h3>
            <p>📍 Bosna i Hercegovina</p>
            <p>
              📧{' '}
              <a href="mailto:layerlab.3de@gmail.com">
                layerlab.3de@gmail.com
              </a>
            </p>
            <p>
              📞 <a href="tel:+38762489886">+387 62 489 886</a>
            </p>
            <p>
              📞 VIBER{' '}
              <a href="tel:+38762351830">+387 62 351 830</a>
            </p>

            <div className="footer-social">
              <a
                href="#"
                aria-label="Facebook"
                onClick={(event) => event.preventDefault()}
              >
                📘
              </a>
              <a
                href="#"
                aria-label="Instagram"
                onClick={(event) => event.preventDefault()}
              >
                📷
              </a>
              <a
                href="#"
                aria-label="TikTok"
                onClick={(event) => event.preventDefault()}
              >
                🎵
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} LayerLab3DE. Sva prava zadržana.
          </p>
        </div>
      </div>
    </footer>
  );
}

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return undefined;
    }

    const elementId = location.hash.substring(1);

    const timeoutId = setTimeout(() => {
      const element = document.getElementById(elementId);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [location.hash]);

  return null;
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAdmin(false);

      if (!currentUser) {
        setAuthLoading(false);
        return;
      }

      try {
        const adminReference = doc(db, 'admins', currentUser.uid);
        const adminSnapshot = await getDoc(adminReference);
        const adminData = adminSnapshot.exists()
          ? adminSnapshot.data()
          : null;

        const userIsAdmin =
          adminSnapshot.exists() && adminData?.role === 'admin';

        setIsAdmin(userIsAdmin);
      } catch (error) {
        console.error('Greška pri provjeri admin pristupa:', error);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Provjera korisničkog naloga...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <ScrollToTop />
      <ScrollToHash />

      <Navigation user={user} isAdmin={isAdmin} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/prijava" element={<Login />} />
          <Route path="/registracija" element={<Register />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/moje-narudzbe" element={<MyOrders />} />
          <Route path="/privatnost" element={<PrivacyPolicy />} />
          <Route path="/kolacici" element={<CookiePolicy />} />
          <Route
            path="*"
            element={
              <div className="not-found">
                <h1 className="not-found-title">
                  Stranica nije pronađena
                </h1>
                <Link to="/" className="not-found-link">
                  Vrati se na početnu stranicu
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer isAdmin={isAdmin} />

      <CookieConsent />
      <TawkChat />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;