'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

// Optimized loading component
const AuthLoader = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
    </div>
  </div>
));

AuthLoader.displayName = 'AuthLoader';

// Optimized form component
const LoginForm = memo(() => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Optimized redirect effect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  // Memoized validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Optimized input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Optimized submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        email: formData.email,
        password: formData.password,
        device_name: 'web',
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, login, isSubmitting]);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-400/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8 mt-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg">
              Sign in to continue your journey
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 pl-14 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg ${
                      errors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 pl-14 pr-14 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg ${
                      errors.password
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center hover:bg-gray-50 rounded-r-2xl transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Remember Me */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-md flex items-center justify-center gap-3 group"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-500 hover:text-blue-700 transition-colors duration-200 hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
});

LoginForm.displayName = 'LoginForm';

// Main component with optimized loading
export default function LoginPage() {
  return <LoginForm />;
}