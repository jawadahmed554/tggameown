'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [webApp, setWebApp] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    script.onload = () => {
      if (window.Telegram?.WebApp) {
        const tgWebApp = window.Telegram.WebApp;
        setWebApp(tgWebApp);
        tgWebApp.ready();
        setIsReady(true);
        validateUser(tgWebApp.initData);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const validateUser = async (initData) => {
    try {
      const response = await fetch('/api/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });
      const data = await response.json();
      if (data.valid) {
        setUser(data.user);
      } else {
        console.error('User validation failed');
      }
    } catch (error) {
      console.error('Error validating user:', error);
    }
  };

  const handleClose = () => {
    if (webApp) {
      webApp.close();
    }
  };

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome to Our Telegram WebApp!</h1>
      <p>Next.js app embedded in Telegram.</p>
      {user ? (
        <p>Welcome, {user.username || user.first_name}!</p>
      ) : (
        <p>User not authenticated</p>
      )}
      <button onClick={handleClose} style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }}>
        Close WebApp
      </button>
    </div>
  );
}