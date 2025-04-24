import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInUser, signInWithGoogle } from '../../api/login';
import ChatPopup from '../../pages/components/common/ChatPopup';
import { motion, useAnimation } from 'framer-motion';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountSuspended, setAccountSuspended] = useState(false);
  const [showAnonymousChat, setShowAnonymousChat] = useState(false);

  // Animation controls for inputs
  const emailControl = useAnimation();
  const passwordControl = useAnimation();

  // Khi user gõ, trigger nhún nhẹ
  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    emailControl.start({ scale: [1, 1.02, 1], transition: { duration: 0.15 } });
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    passwordControl.start({ scale: [1, 1.02, 1], transition: { duration: 0.15 } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    try {
      setError(''); setLoading(true); setAccountSuspended(false);
      const userCredential = await signInUser({ email, password });
      router.push(userCredential.role === 'admin' ? '/adminUI' : '/');
    } catch (err: any) {
      if (err.message === 'ACCOUNT_SUSPENDED') setAccountSuspended(true);
      else setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(''); setLoading(true); setAccountSuspended(false);
      const userCredential = await signInWithGoogle();
      router.push(userCredential.role === 'admin' ? '/adminUI' : '/');
    } catch (err: any) {
      if (err.message === 'ACCOUNT_SUSPENDED') setAccountSuspended(true);
      else setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const handleContactAdmin = () => setShowAnonymousChat(true);
  const handleCloseAnonymousChat = () => setShowAnonymousChat(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
      >
        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-extrabold text-green-700">NutriGen Bot</h1>
        </div>

        {accountSuspended && (
          <motion.div
            className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-start">
              <div className="text-red-500 mr-3">🚫</div>
              <div>
                <p className="text-sm font-semibold text-red-800">Account Suspended</p>
                <p className="text-sm text-red-700 mt-1">
                  Your account has been suspended. Please contact admin.
                </p>
                <button onClick={handleContactAdmin} className="mt-2 text-sm text-green-700 underline">
                  Contact Admin via Chat
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {error && !accountSuspended && (
          <motion.div
            className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <motion.input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={onEmailChange}
              animate={emailControl}
              whileFocus={{ borderColor: '#4b7e53', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.3)' }}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <motion.input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
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

          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.a
              href="/auth/signup"
              whileHover={{ scale: 1.05 }}
              className="text-sm text-green-600 hover:underline"
            >
              Create new account
            </motion.a>
            <Link href="/auth/forgotPassword" className="text-sm text-green-600 hover:underline">
              Forgot password?
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </motion.div>
        </form>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-gray-600">Or continue with</p>
          <button
            onClick={handleGoogleLogin}
            className="mt-3 w-full inline-flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
              />
            </svg>
            Google
          </button>
        </motion.div>
      </motion.div>

      {showAnonymousChat && (
        <ChatPopup isAnonymous anonymousIssue="Account Suspended" onClose={handleCloseAnonymousChat} />
      )}
    </div>
  );
};

export default Login;
