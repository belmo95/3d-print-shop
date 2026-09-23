import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { auth, db } from '../firebase';

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError('Popunite sva obavezna polja.');
      return;
    }

    if (password.length < 6) {
      setError(
        'Lozinka mora imati najmanje 6 karaktera.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Lozinke se ne podudaraju.');
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const currentUser = userCredential.user;

      await updateProfile(currentUser, {
        displayName: name.trim(),
      });

      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        name: name.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
      });

      navigate('/profil', { replace: true });
    } catch (registerError) {
      console.error(
        'Greška prilikom registracije:',
        registerError
      );

      switch (registerError.code) {
        case 'auth/email-already-in-use':
          setError(
            'Ova email adresa je već registrovana.'
          );
          break;

        case 'auth/invalid-email':
          setError('Email adresa nije ispravna.');
          break;

        case 'auth/weak-password':
          setError(
            'Lozinka je preslaba. Koristite najmanje 6 karaktera.'
          );
          break;

        default:
          setError(
            'Registracija nije uspjela. Pokušajte ponovo.'
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
            <div className="auth-icon">✨</div>

            <h1 className="auth-title">
              Registracija
            </h1>

            <p className="auth-subtitle">
              Kreirajte svoj LayerLab3D nalog.
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
                htmlFor="register-name"
                className="form-label"
              >
                Ime i prezime
              </label>

              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="Vaše ime i prezime"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="register-email"
                className="form-label"
              >
                Email adresa
              </label>

              <input
                id="register-email"
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
                htmlFor="register-password"
                className="form-label"
              >
                Lozinka
              </label>

              <input
                id="register-password"
                type="password"
                className="form-input"
                placeholder="Najmanje 6 karaktera"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="register-confirm-password"
                className="form-label"
              >
                Ponovite lozinku
              </label>

              <input
                id="register-confirm-password"
                type="password"
                className="form-input"
                placeholder="Ponovite lozinku"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading
                ? 'Kreiranje naloga...'
                : 'Kreiraj nalog'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Već imate nalog?{' '}
              <Link to="/prijava">
                Prijavite se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;