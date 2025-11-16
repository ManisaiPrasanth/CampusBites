import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

// ⚠️ SECURITY WARNING: Set this to true ONLY for development/testing
// In production, this should be FALSE to prevent unauthorized role selection
const ENABLE_ROLE_SELECTION = false; // Change to false for production

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [isGoogleEnabled, setIsGoogleEnabled] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validate college email
  const validateCollegeEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@klu\.ac\.in$/;
    const isValid = emailRegex.test(email);
    
    if (!email) {
      setEmailError('');
      setIsEmailValid(false);
      return false;
    }
    
    if (!isValid) {
      setEmailError('Only KLU college email addresses (@klu.ac.in) are allowed');
      setIsEmailValid(false);
      return false;
    }
    
    setEmailError('');
    setIsEmailValid(true);
    return true;
  };

  // Load Google OAuth script
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // Only load Google script if valid Client ID is configured
    if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com' || clientId.includes('your-')) {
      console.log('⚠️ Google Client ID not configured. Google Sign-In disabled.');
      setIsGoogleEnabled(false);
      return;
    }
    
    setIsGoogleEnabled(true);

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (error) {
          console.error('Failed to initialize Google Sign-In:', error);
        }
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate email in real-time
    if (name === 'email') {
      validateCollegeEmail(value);
    }
  };

  const handleGoogleSignIn = async (response) => {
    try {
      setLoading(true);
      const result = await authAPI.googleLogin(response.credential);
      
      // Redirect based on role
      const role = result.user.role;
      if (role === 'admin' || role === 'canteen_owner') {
        navigate('/admin');
      } else {
        navigate('/menu');
      }
      
      toast.success('Welcome! Signed in successfully with Google');
    } catch (error) {
      console.error('Google Sign-In error:', error);
      toast.error('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate college email before submission
    if (!validateCollegeEmail(formData.email)) {
      toast.error('Please enter a valid KLU college email address (@klu.ac.in)');
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Validate password strength (must contain uppercase, lowercase, and number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
      };

      await register(registrationData);
      navigate('/menu');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <h1>
              <span className="text-primary">Campus</span>
              <span className="text-accent">Bites</span>
            </h1>
            <h2>Create Account</h2>
            <p>Join us for an amazing dining experience</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">
                <i className="fas fa-user"></i> Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName" 
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i> College Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@klu.ac.in"
                className={emailError ? 'error' : (isEmailValid ? 'valid' : '')}
                required
              />
              {emailError && <div className="error-message">{emailError}</div>}
              {isEmailValid && <div className="success-message">✓ Valid KLU email</div>}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">
                <i className="fas fa-phone"></i> Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                required
                pattern="[0-9]{10}"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 6 chars, 1 uppercase, 1 lowercase, 1 number)"
                required
                minLength={6}
              />
              <small className="form-hint">
                Password must contain at least one uppercase letter, one lowercase letter, and one number
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i> Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading || !isEmailValid}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i> Sign Up
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In Section - Only show if configured */}
          {isGoogleEnabled && (
            <>
              {/* Divider */}
              <div className="auth-divider">
                <span>or</span>
              </div>

              {/* Google Sign-In Button */}
              <div className="google-signin-container">
                <button
                  type="button"
                  className="btn btn-google w-100"
                  onClick={() => window.google?.accounts.id.prompt()}
                  disabled={loading}
                >
                  <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </>
          )}

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
            <Link to="/" className="text-secondary">
              <i className="fas fa-home"></i> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

