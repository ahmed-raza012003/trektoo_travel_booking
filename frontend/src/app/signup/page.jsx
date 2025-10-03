'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

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

// Password strength component
const PasswordStrength = memo(({ strength }) => {
  const getStrengthColor = (strength) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength) => {
    if (strength <= 2) return { text: 'Weak', color: 'text-red-500' };
    if (strength <= 4) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const strengthInfo = getStrengthText(strength);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600">Password strength:</span>
        <span className={`font-medium ${strengthInfo.color}`}>
          {strengthInfo.text}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${getStrengthColor(strength)}`}
          initial={{ width: 0 }}
          animate={{ width: `${(strength / 6) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
});

PasswordStrength.displayName = 'PasswordStrength';

// Optimized form component
const SignupForm = memo(() => {
  const { register, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Optimized redirect effect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  // Memoized password strength calculation
  const calculatePasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  }, []);

  // Memoized validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Optimized input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  }, [errors, calculatePasswordStrength]);

  // Optimized submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const registrationData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password,
        terms: formData.terms,
        device_name: 'web',
      };

      await register(registrationData);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, register, isSubmitting]);

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
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-xl">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Create Account
            </h1>
            <p className="text-gray-600 text-lg">
              Join us and start your journey
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
              {/* Name Fields */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-2 gap-4"
              >
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    First Name
                  </label>
                  <div className="relative group">
                    <input
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 pl-14 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg ${
                        errors.first_name
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="First name"
                    />
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                  </div>
                  {errors.first_name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600"
                    >
                      {errors.first_name}
                    </motion.p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Last Name
                  </label>
                  <div className="relative group">
                    <input
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 pl-14 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg ${
                        errors.last_name
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Last name"
                    />
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                  </div>
                  {errors.last_name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600"
                    >
                      {errors.last_name}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
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
                transition={{ duration: 0.5, delay: 0.6 }}
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
                    placeholder="Create a password"
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <PasswordStrength strength={passwordStrength} />
                )}

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

              {/* Terms and Conditions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex items-start"
              >
                <div className="flex items-center h-5">
                  <input
                    name="terms"
                    type="checkbox"
                    checked={formData.terms}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="text-gray-600 cursor-pointer">
                    I agree to the{' '}
                    <Link
                      href="/terms-and-conditions"
                      className="text-blue-500 hover:text-blue-700 font-medium hover:underline"
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy-policy"
                      className="text-blue-500 hover:text-blue-700 font-medium hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.terms && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.terms}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-md flex items-center justify-center gap-3 group"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-blue-500 hover:text-blue-700 transition-colors duration-200 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
});

SignupForm.displayName = 'SignupForm';

// Main component with optimized loading
export default function SignupPage() {
  return <SignupForm />;
}