import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import MindMap from '@/components/MindMap';
import { useState } from 'react';

const MindMapPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-mono ${
        theme === 'light' ? 'bg-stone-100 text-stone-900' : 'bg-zinc-900 text-zinc-100'
      }`}>
        <div className="w-16 h-16 mb-8">
          <motion.div
            className="w-full h-full border-4 border-black"
            style={{ backgroundColor: '#00e6c4' }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>
        <div className="text-xl font-black tracking-wider">{t('common.loading')} TUTORLY...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const themeClasses = theme === 'light' ? 'bg-stone-100 text-stone-900' : 'bg-zinc-900 text-zinc-100';

  return (
    <div className={`min-h-screen flex flex-col font-mono ${themeClasses}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-1 relative">
        <MindMap className="w-full h-full" />
      </main>

      <Footer />
      <BottomNav theme={theme} />
    </div>
  );
};

export default MindMapPage;
