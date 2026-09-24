import { useState } from 'react';
import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { auth } from '../firebase';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath =
    location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (!email.trim() || !password) {
      setError('Unesite email adresu i lozinku.');
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate(redirectPath, { replace: true });
    } catch (loginError) {
      console.error('Greška prilikom prijave:', loginError);

      switch (loginError.code) {
        case 'auth/invalid-email':
          setError('Email adresa nije ispravna.');
          break;

        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError(
            'Email ili lozinka nisu ispravni.'
          );
          break;

        case 'auth/too-many-requests':
          setError(
            'Previše pokušaja. Pokušajte ponovo kasnije.'
          );
          break;

        default:
          setError(
            'Prijava nije uspjela. Pokušajte ponovo.'
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">👤</div>

            <h1 className="auth-title">
              Prijava
            </h1>

            <p className="auth-subtitle">
              Prijavite se na svoj LayerLab3DE nalog.
            </p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="form-group">
              <label
                htmlFor="login-email"
                className="form-label"
              >
                Email adresa
              </label>

              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="vas@email.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="login-password"
                className="form-label"
              >
                Lozinka
              </label>

              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Unesite lozinku"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading
                ? 'Prijavljivanje...'
                : 'Prijavi se'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Nemate nalog?{' '}
              <Link to="/registracija">
                Registrujte se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;