'use client';

import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '../lib/context/LanguageContext';

export default function LogoutButton({ onClick }: { onClick?: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { t: translate } = useLanguage();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      onClick?.(); // Close menu before redirect
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-red-400 cursor-pointer w-full text-left disabled:opacity-50"
    >
      <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-sign-out'}`}></i>
      <span>{isLoading ? translate('common.loading') : 'Logout'}</span>
    </button>
  );
}
