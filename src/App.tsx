/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Login } from './components/Login';
import { addNotification } from './utils/notifications';

export default function App() {
  const [user, setUser] = useState<{ email: string; name: string; photo?: string } | null>(() => {
    const saved = localStorage.getItem('medcore_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('medcore_theme') || 'classic';
  });

  useEffect(() => {
    if (user) {
      const hasWelcomed = sessionStorage.getItem('has_welcomed');
      if (!hasWelcomed) {
        addNotification({
          topic: 'healthTips',
          title: `Welcome back, ${user.name}!`,
          message: 'MedCore is ready to help you manage your health today.',
          iconType: 'info',
          color: 'bg-emerald-100 text-emerald-600'
        });
        sessionStorage.setItem('has_welcomed', 'true');
      }
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('medcore_theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('medcore_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Home 
      user={user} 
      onLogout={handleLogout} 
      currentTheme={theme} 
      onThemeChange={setTheme} 
    />
  );
}

