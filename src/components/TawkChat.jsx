import { useEffect } from 'react';

function TawkChat() {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart =
      new Date();

    const existingScript = document.querySelector(
      'script[src*="embed.tawk.to/6866d22026f81a190b2a0062"]'
    );

    if (existingScript) {
      return undefined;
    }

    const script = document.createElement(
      'script'
    );

    script.async = true;
    script.src =
      'https://embed.tawk.to/6866d22026f81a190b2a0062/1k39m8gkf';
    script.charset = 'UTF-8';
    script.setAttribute(
      'crossorigin',
      '*'
    );

    document.body.appendChild(script);

    return () => {
      const addedScript = document.querySelector(
        'script[src*="embed.tawk.to/6866d22026f81a190b2a0062"]'
      );

      if (addedScript) {
        addedScript.remove();
      }

      if (window.Tawk_API) {
        try {
          window.Tawk_API.hideWidget();
        } catch (error) {
          console.warn(
            'Tawk widget nije moguće sakriti:',
            error
          );
        }
      }
    };
  }, []);

  return null;
}

export default TawkChat;