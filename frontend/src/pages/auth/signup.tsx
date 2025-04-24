import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { registerUser, signUpWithGoogle } from '../../api/signup';
import { motion, useAnimation } from 'framer-motion';

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation controls for inputs
  const nameControl = useAnimation();
  const emailControl = useAnimation();
  const passwordControl = useAnimation();
  const confirmControl = useAnimation();

  // Trigger subtle bounce on typing
  const onNameChange = (e) => {
    setFormData({ ...formData, displayName: e.target.value });
    nameControl.start({ scale: [1, 1.02, 1], transition: { duration: 0.15 } });
  };
  const onEmailChange = (e) => {
    setFormData({ ...formData, email: e.target.value });
    emailControl.start({ scale: [1, 1.02, 1], transition: { duration: 0.15 } });
  };
  const onPasswordChange = (e) => {
    setFormData({ ...formData, password: e.target.value });
    passwordControl.start({ scale: [1, 1.02, 1], transition: { duration: 0.15 } });
  };
  const onConfirmChange = (e) => {
    setFormData({ ...formData, confirmPassword: e.target.value });
    confirmControl.start({ scale: [1, 1.02, 1], transition: { duration: 0.15 } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await registerUser(formData);
      router.push('/auth/login');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Email address is already in use.');
      else setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError('');
      setLoading(true);
      await signUpWithGoogle();
      router.push('/');
    } catch (err) {
      setError(err.message || 'Google signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-8 py-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-extrabold text-gray-900 text-center"
          >
            Create your account
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-center text-sm text-gray-600"
          >
            Or{' '}
            <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-500">
              sign in if you already have an account
            </Link>
          </motion.p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <motion.input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                value={formData.displayName}
                onChange={onNameChange}
                animate={nameControl}
                whileFocus={{ borderColor: '#4b7e53', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.3)' }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              />
            </motion.div>

            {/* Email */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <motion.input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={onEmailChange}
                animate={emailControl}
                whileFocus={{ borderColor: '#4b7e53', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.3)' }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              />
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <motion.input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={onPasswordChange}
                  animate={passwordControl}
                  whileFocus={{ borderColor: '#4b7e53', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.3)' }}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-green-600 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <motion.input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={onConfirmChange}
                  animate={confirmControl}
                  whileFocus={{ borderColor: '#4b7e53', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.3)' }}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-green-600 text-sm"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </motion.div>

            <input type="hidden" name="role" value={formData.role} />

            {/* Submit Button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </motion.div>
          </form>

          {/* Or continue with */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <motion.button
              onClick={handleGoogleSignup}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                />
              </svg>
              Google
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;