import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple authentication
    if (username === 'Belmo' && password === 'Elmedin.1') {
      // Store auth state in sessionStorage
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setTimeout(() => {
        setLoading(false);
        navigate('/admin');
      }, 500);
    } else {
      setLoading(false);
      setError('Pogrešno korisničko ime ili lozinka!');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h1 className="login-title">Admin Login</h1>
            <p className="login-subtitle">Unesite podatke za pristup Admin panelu</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="username">
                <span className="label-icon">👤</span>
                Korisničko ime
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Unesite korisničko ime"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                <span className="label-icon">🔑</span>
                Lozinka
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Unesite lozinku"
                required
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Prijava...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Prijavi se
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <a href="/" className="back-link">
              ← Nazad na početnu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;