'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/types';
import { Sparkles, X, User, Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  guestUsageCount: number;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  guestUsageCount,
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Please enter a username with at least 3 characters.');
      return;
    }

    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!cleanPass || cleanPass.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Persist registered credentials in localStorage (simulated auth)
    const user: AuthUser = {
      username: cleanUsername,
      email: cleanEmail,
      createdAt: Date.now(),
    };

    try {
      localStorage.setItem('promptbridge_auth_user', JSON.stringify(user));
      // Save password hash mock in local accounts table
      const accountsRaw = localStorage.getItem('promptbridge_accounts') || '[]';
      const accounts = JSON.parse(accountsRaw);
      const existing = accounts.find((a: any) => a.email.toLowerCase() === cleanEmail.toLowerCase());
      if (!existing) {
        accounts.push({ username: cleanUsername, email: cleanEmail, password: cleanPass });
        localStorage.setItem('promptbridge_accounts', JSON.stringify(accounts));
      }
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }

    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#FFF3E0] border border-[#4E342E]/25 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#FFB74D]/30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[#C62828]/15 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#4E342E]/60 hover:text-[#1B0E07] hover:bg-[#4E342E]/10 transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C62828] to-[#4E342E] shadow-md shadow-[#C62828]/30 mb-1">
            <Sparkles className="w-6 h-6 text-[#FFB74D]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB74D]/30 border border-[#FFB74D]/70 text-[#1B0E07] text-[11px] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#C62828] fill-[#C62828]" />
            <span>{guestUsageCount >= 2 ? 'Free Limit Reached' : 'Create Free Account'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B0E07] tracking-tight">
            {guestUsageCount >= 2 ? 'Unlock Unlimited Prompts' : 'Welcome to PromptBridge'}
          </h2>

          <p className="text-xs text-[#4E342E]/80 leading-relaxed max-w-xs mx-auto">
            {guestUsageCount >= 2
              ? "You have used your 2 free guest prompts. Enter your username, email, and password to continue engineering without limits."
              : 'Specify your details to access your prompt history and custom settings.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 mb-5 bg-white/80 rounded-xl border border-[#4E342E]/20 text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#C62828] text-white shadow-xs'
                : 'text-[#4E342E] hover:text-[#C62828]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#C62828] text-white shadow-xs'
                : 'text-[#4E342E] hover:text-[#C62828]'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1B0E07] uppercase tracking-wider block">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#4E342E]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-username"
                type="text"
                required
                placeholder="e.g. prompt_architect"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full glass-input pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-[#1B0E07] placeholder-[#4E342E]/50 border border-[#4E342E]/25 focus:border-[#C62828]"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1B0E07] uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#4E342E]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-[#1B0E07] placeholder-[#4E342E]/50 border border-[#4E342E]/25 focus:border-[#C62828]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1B0E07] uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#4E342E]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-[#1B0E07] placeholder-[#4E342E]/50 border border-[#4E342E]/25 focus:border-[#C62828]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4E342E]/50 hover:text-[#1B0E07] transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#C62828] hover:bg-[#B71C1C] text-white shadow-md shadow-[#C62828]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFB74D]" />
            <span>{mode === 'signup' ? 'Create Free Account & Continue' : 'Sign In & Continue'}</span>
          </button>
        </form>

        {/* Feature Highlights */}
        <div className="mt-5 pt-4 border-t border-[#4E342E]/15 grid grid-cols-3 gap-2 text-center text-[10px] text-[#4E342E]/80 font-medium">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#C62828]" />
            <span>100% Free Forever</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-[#C62828]" />
            <span>Unlimited Prompts</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-[#C62828]" />
            <span>Sub-Second AI Speed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
