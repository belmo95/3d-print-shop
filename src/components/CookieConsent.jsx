import { useEffect, useState } from 'react';

const STORAGE_KEY = 'layerlab3d_cookie_preferences';

const defaultPreferences = {
  necessary: true,
  analytics: false,
  functional: false,
};

function readSavedPreferences() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return null;
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error(
      'Greška pri čitanju cookie postavki:',
      error
    );

    return null;
  }
}

export default function CookieConsent() {
  const [
    savedPreferences,
    setSavedPreferences,
  ] = useState(undefined);

  const [showSettings, setShowSettings] =
    useState(false);

  const [analytics, setAnalytics] =
    useState(false);

  const [functional, setFunctional] =
    useState(false);

  useEffect(() => {
    const saved = readSavedPreferences();

    setSavedPreferences(saved);

    if (saved) {
      setAnalytics(saved.analytics === true);
      setFunctional(saved.functional === true);
    }
  }, []);

  useEffect(() => {
    const openSettings = () => {
      setShowSettings(true);
    };

    window.addEventListener(
      'open-cookie-settings',
      openSettings
    );

    return () => {
      window.removeEventListener(
        'open-cookie-settings',
        openSettings
      );
    };
  }, []);

  const savePreferences = (preferences) => {
    const finalPreferences = {
      ...defaultPreferences,
      ...preferences,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(finalPreferences)
    );

    setSavedPreferences(finalPreferences);
    setAnalytics(finalPreferences.analytics);
    setFunctional(finalPreferences.functional);
    setShowSettings(false);

    window.dispatchEvent(
      new CustomEvent('cookie-consent-updated', {
        detail: finalPreferences,
      })
    );
  };

  // Čekamo da se provjeri localStorage.
  if (savedPreferences === undefined) {
    return null;
  }

  if (!savedPreferences || showSettings) {
    return (
      <div
        className="cookie-consent-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
      >
        <div className="cookie-consent-box">
          <h2 id="cookie-consent-title">
            {showSettings
              ? 'Postavke kolačića'
              : 'Koristimo kolačiće'}
          </h2>

          {!showSettings && (
            <p>
              Koristimo neophodne kolačiće za rad
              stranice. Analitičke i funkcionalne
              kolačiće koristimo samo uz vaš pristanak.
              <a href="/kolacici">
                {' '}
                Saznajte više
              </a>.
            </p>
          )}

          {showSettings && (
            <>
              <p>
                Izaberite koje kategorije kolačića
                dozvoljavate.
              </p>

              <label className="cookie-option">
                <input
                  type="checkbox"
                  checked
                  disabled
                />
                <span>
                  Neophodni kolačići
                </span>
              </label>

              <label className="cookie-option">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) =>
                    setAnalytics(event.target.checked)
                  }
                />
                <span>
                  Analitički kolačići
                </span>
              </label>

              <label className="cookie-option">
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(event) =>
                    setFunctional(event.target.checked)
                  }
                />
                <span>
                  Funkcionalni kolačići
                </span>
              </label>
            </>
          )}

          <div className="cookie-consent-actions">
            {!showSettings && (
              <>
                <button
                  type="button"
                  className="cookie-button primary"
                  onClick={() =>
                    savePreferences({
                      analytics: true,
                      functional: true,
                    })
                  }
                >
                  Prihvati sve
                </button>

                <button
                  type="button"
                  className="cookie-button secondary"
                  onClick={() =>
                    savePreferences({
                      analytics: false,
                      functional: false,
                    })
                  }
                >
                  Odbij opcionalne
                </button>

                <button
                  type="button"
                  className="cookie-button outline"
                  onClick={() =>
                    setShowSettings(true)
                  }
                >
                  Postavke
                </button>
              </>
            )}

            {showSettings && (
              <>
                <button
                  type="button"
                  className="cookie-button primary"
                  onClick={() =>
                    savePreferences({
                      analytics,
                      functional,
                    })
                  }
                >
                  Sačuvaj izbor
                </button>

                <button
                  type="button"
                  className="cookie-button secondary"
                  onClick={() =>
                    savePreferences({
                      analytics: false,
                      functional: false,
                    })
                  }
                >
                  Odbij opcionalne
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}