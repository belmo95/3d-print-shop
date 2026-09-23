import { useEffect, useState } from 'react';

import {
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { auth, db } from '../firebase';
import Messages from '../components/Messages';

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          navigate('/prijava', {
            replace: true,
            state: {
              from: {
                pathname: '/profil',
              },
            },
          });

          return;
        }

        setUser(currentUser);

        try {
          const userReference = doc(
            db,
            'users',
            currentUser.uid
          );

          const userSnapshot = await getDoc(
            userReference
          );

          if (userSnapshot.exists()) {
            const userData =
              userSnapshot.data();

            setName(
              userData.name ||
                currentUser.displayName ||
                ''
            );

            setPhone(userData.phone || '');
            setAddress(userData.address || '');
          } else {
            setName(
              currentUser.displayName || ''
            );
          }
        } catch (profileError) {
          console.error(
            'Greška pri učitavanju profila:',
            profileError
          );

          setError(
            'Profil nije moguće učitati.'
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setError('');
    setMessage('');

    if (!name.trim()) {
      setError(
        'Unesite ime i prezime.'
      );
      return;
    }

    try {
      setSaving(true);

      await updateProfile(user, {
        displayName: name.trim(),
      });

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          name: name.trim(),
          email: user.email || '',
          phone: phone.trim(),
          address: address.trim(),
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setMessage(
        'Podaci profila su uspješno sačuvani.'
      );
    } catch (saveError) {
      console.error(
        'Greška pri čuvanju profila:',
        saveError
      );

      setError(
        'Podaci nisu sačuvani.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>

        <p className="loading-text">
          Učitavanje profila...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {name?.charAt(0)?.toUpperCase() || '👤'}
          </div>

          <div>
            <h1 className="profile-title">
              Moj profil
            </h1>

            <p className="profile-subtitle">
              Upravljajte podacima, narudžbama i
              porukama.
            </p>
          </div>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div
            className="success-message"
            role="status"
          >
            ✅ {message}
          </div>
        )}

        <div className="profile-layout">
          <section className="profile-card">
            <h2 className="profile-card-title">
              Lični podaci
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label
                  htmlFor="profile-name"
                  className="form-label"
                >
                  Ime i prezime
                </label>

                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="profile-email"
                  className="form-label"
                >
                  Email adresa
                </label>

                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={user.email || ''}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="profile-phone"
                  className="form-label"
                >
                  Telefon
                </label>

                <input
                  id="profile-phone"
                  type="tel"
                  className="form-input"
                  placeholder="+387 62 000 000"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="profile-address"
                  className="form-label"
                >
                  Adresa za dostavu
                </label>

                <textarea
                  id="profile-address"
                  className="form-textarea"
                  placeholder="Ulica, broj, grad"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                />
              </div>

              <button
                type="submit"
                className="form-button"
                disabled={saving}
              >
                {saving
                  ? 'Čuvanje...'
                  : 'Sačuvaj podatke'}
              </button>
            </form>
          </section>

          <aside className="profile-card profile-actions">
            <h2 className="profile-card-title">
              Moj nalog
            </h2>

            <Link
              to="/moje-narudzbe"
              className="profile-action-link"
            >
              📦 Moje narudžbe
            </Link>

            <Link
              to="/"
              className="profile-action-link"
            >
              🛍️ Pogledaj proizvode
            </Link>
          </aside>
        </div>

        <Messages />
      </div>
    </main>
  );
}

export default Profile;