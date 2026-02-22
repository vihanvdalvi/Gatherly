import React, { useState, useEffect } from 'react';
import { authAPI, scheduleAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { AuthResponse } from '../../types/index';
import '../../styles/components.css';

interface SignupFormProps {
  onSuccess?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [homeLocation, setHomeLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();

  // Fetch available locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await scheduleAPI.getLocationsList();
        setLocations(response.data.locations || []);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // Filter locations based on input
  useEffect(() => {
    if (homeLocation.trim()) {
      const filtered = locations.filter((loc) =>
        loc.toLowerCase().includes(homeLocation.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowLocationDropdown(true);
    } else {
      setFilteredLocations(locations);
      setShowLocationDropdown(false);
    }
  }, [homeLocation, locations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !homeLocation) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.signup({
        name,
        email,
        password,
        home_location: homeLocation,
      });
      const data = response.data as AuthResponse;

      setUser({
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        home_location: data.home_location,
      });

      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Signup failed. Please try again.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Home Location</label>
        <input
          type="text"
          className="form-input"
          placeholder="Start typing to search locations..."
          value={homeLocation}
          onChange={(e) => setHomeLocation(e.target.value)}
          onFocus={() => homeLocation && setShowLocationDropdown(true)}
          autoComplete="off"
          required
        />
        {showLocationDropdown && filteredLocations.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid var(--neutral-300)',
              borderRadius: 'var(--radius-md)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              marginTop: '4px',
            }}
          >
            {filteredLocations.map((loc) => (
              <div
                key={loc}
                onClick={() => {
                  setHomeLocation(loc);
                  setShowLocationDropdown(false);
                }}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--neutral-200)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--neutral-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                {loc}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <input
          type="password"
          className="form-input"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
};
