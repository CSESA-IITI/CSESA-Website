import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      console.log('=== AuthCallback: Starting OAuth callback processing ===');
      
      // First check URL hash for OAuth response
      const hash = window.location.hash.substring(1);
      console.log('URL hash:', hash);
      const hashParams = new URLSearchParams(hash);
      
      // Get parameters from either hash or query string
      const code = searchParams.get('code') || hashParams.get('code');
      const error = searchParams.get('error') || hashParams.get('error');
      const state = searchParams.get('state') || hashParams.get('state');
      
      console.log('OAuth parameters:', { code, error, state });
      
      // Parse the state parameter
      let stateData = null;
      let storedState = null;
      
      try {
        stateData = state ? JSON.parse(decodeURIComponent(state)) : null;
        storedState = stateData?.state || null;
        console.log('Parsed state data:', stateData);
      } catch (e) {
        console.error('Error parsing state:', e);
        setStatus('error');
        setError('Invalid state format');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Clean up the stored state
      const savedState = localStorage.getItem('oauth_state');
      localStorage.removeItem('oauth_state');

      if (error) {
        setStatus('error');
        setError(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Verify state to prevent CSRF attacks
      if (!storedState || storedState !== savedState) {
        setStatus('error');
        setError('Invalid state parameter');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const response = await handleGoogleCallback(code, storedState);
        setStatus('success');
        
        // Use the redirect_uri from the response or fall back to the one in state
        const redirectTo = response.redirect_uri || stateData?.redirect_uri || '/';
        
        // Small delay to show success message before redirecting
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);
      } catch (err) {
        console.error('Authentication error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to authenticate with Google. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Signing you in...</h2>
              <p className="text-slate-400">Please wait while we complete your authentication</p>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Welcome to CSESA!</h2>
              <p className="text-slate-400">You've been successfully signed in. Redirecting...</p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Authentication Failed</h2>
              <p className="text-slate-400">{error}</p>
              <p className="text-sm text-slate-500">Redirecting to home page...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
