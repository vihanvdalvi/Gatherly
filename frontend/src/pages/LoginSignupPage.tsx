import React, { useState } from 'react';
import { LoginForm } from '../components/Auth/LoginForm';
import { SignupForm } from '../components/Auth/SignupForm';
import '../styles/components.css';

interface LoginSignupPageProps {
  onAuthSuccess?: () => void;
}

export const LoginSignupPage: React.FC<LoginSignupPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 'var(--spacing-md)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '450px',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-2xl)',
            paddingBottom: 'var(--spacing-lg)',
            borderBottom: '2px solid var(--neutral-200)',
          }}
        >
          <img
            src="/gatherly_logo.png"
            alt="Gatherly Logo"
            style={{
              height: '240px',
              marginBottom: '2px',
            }}
          />
          <p style={{ margin: 0, color: 'var(--neutral-600)' }}>
            Find the perfect time to meet together
          </p>
        </div>

        {/* Toggle Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          <button
            onClick={() => setIsLogin(true)}
            className={`btn btn-lg`}
            style={{
              flex: 1,
              backgroundColor: isLogin ? 'var(--primary)' : 'var(--neutral-200)',
              color: isLogin ? 'white' : 'var(--neutral-900)',
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`btn btn-lg`}
            style={{
              flex: 1,
              backgroundColor: !isLogin ? 'var(--primary)' : 'var(--neutral-200)',
              color: !isLogin ? 'white' : 'var(--neutral-900)',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        <div>
          {isLogin ? (
            <LoginForm onSuccess={onAuthSuccess} />
          ) : (
            <SignupForm onSuccess={onAuthSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};
