import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Menu, 
  X, 
  LogOut, 
  MessageSquare, 
  PlusCircle, 
  Map as MapIcon,
  Package,
  Construction,
  ChevronRight,
  CalendarCheck,
  CreditCard as CardIcon,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuthStore();
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ka' ? 'en' : 'ka';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { name: t('common.home'), path: '/', icon: <Truck className="h-4 w-4" /> },
    { name: t('common.cargo'), path: '/cargo', icon: <Package className="h-4 w-4" /> },
    { name: t('common.routes'), path: '/routes', icon: <Truck className="h-4 w-4" /> },
    { name: t('common.heavyEquipment'), path: '/heavy-equipment', icon: <Construction className="h-4 w-4" /> },
    { name: t('common.map'), path: '/map', icon: <MapIcon className="h-4 w-4" /> },
    { name: t('common.packets'), path: '/packets', icon: <PlusCircle className="h-4 w-4" /> },
    ...(user ? [
      { name: t('common.myPosts'), path: '/my-posts', icon: <Package className="h-4 w-4" /> },
      { name: t('common.myBookings'), path: '/my-bookings', icon: <CalendarCheck className="h-4 w-4" /> }
    ] : []),
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-3' : 'py-4 md:py-6'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className={`mx-auto max-w-screen-xl rounded-2xl transition-all duration-500 ${
            scrolled 
              ? 'bg-background/90 backdrop-blur-xl py-3 px-4 md:px-6 shadow-lg shadow-black/5 border border-border/50' 
              : 'bg-transparent py-3 px-4 md:px-6'
          }`}>
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-2 rounded-xl shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 group-hover:scale-105 transition-all duration-300">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-lg font-black tracking-tight hidden sm:block">
                  Cargo<span className="text-amber-500">Connect</span>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border/30">
                {navLinks.slice(0, 6).map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Right Side Actions */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Language Toggle */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleLanguage}
                  className="rounded-lg font-bold text-xs h-9 px-3 hover:bg-secondary transition-all"
                >
                  {i18n.language === 'ka' ? 'EN' : 'KA'}
                </Button>

                {user ? (
                  <>
                    {profile?.role === 'owner' && (
                      <Link to="/owner">
                        <Button variant="ghost" size="sm" className="rounded-lg font-bold text-xs h-9 px-3 hover:bg-secondary">
                          {t('common.dashboard')}
                        </Button>
                      </Link>
                    )}
                    
                    <div className="flex items-center gap-1.5">
                      <Link to="/messages">
                        <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 hover:bg-secondary relative">
                          <MessageSquare className="h-4 w-4" />
                          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-amber-500 rounded-full ring-2 ring-background" />
                        </Button>
                      </Link>
                      <Link to="/billing">
                        <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 hover:bg-secondary">
                          <CardIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>

                    <Link to="/create-post">
                      <Button className="rounded-xl font-bold text-xs px-5 h-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 border-0 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        {t('common.createPost')}
                      </Button>
                    </Link>

                    <div className="h-5 w-px bg-border mx-1" />
                    
                    <Link to="/profile" className="flex items-center gap-2 group">
                      <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-amber-500/50 transition-all duration-300">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-amber-500/10 text-amber-600 font-bold text-sm">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </>
                ) : (
                  <Link to="/login">
                    <Button className="rounded-xl font-bold text-xs px-6 h-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 border-0 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      {t('common.login')}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <div className="lg:hidden flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleLanguage}
                  className="rounded-lg font-bold text-xs h-9 px-3"
                >
                  {i18n.language === 'ka' ? 'EN' : 'KA'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg h-10 w-10"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border p-4 space-y-6 shadow-xl"
            >
              {/* Nav Links */}
              <div className="grid gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        location.pathname === link.path
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                          : 'bg-secondary/50 text-foreground hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          location.pathname === link.path 
                            ? 'bg-white/20' 
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {link.icon}
                        </div>
                        <span className="font-bold text-sm">{link.name}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${
                        location.pathname === link.path ? 'opacity-100' : 'opacity-30'
                      }`} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* User Section */}
              {user ? (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-4 px-2">
                    <Avatar className="h-12 w-12 border-2 border-amber-500/30">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-amber-500/10 text-amber-600 font-bold">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{profile?.full_name || user?.email}</p>
                      <p className="text-xs text-muted-foreground">{t(`auth.${profile?.role}`)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-12">
                        {t('common.profile')}
                      </Button>
                    </Link>
                    <Link to="/messages" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-12">
                        {t('common.chats')}
                      </Button>
                    </Link>
                    <Link to="/billing" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-12">
                        {t('common.billing')}
                      </Button>
                    </Link>
                    {profile?.role === 'owner' && (
                      <Link to="/owner" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-12">
                          {t('common.dashboard')}
                        </Button>
                      </Link>
                    )}
                  </div>

                  <Link to="/create-post" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-xl font-bold text-sm h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20">
                      {t('common.createPost')}
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    className="w-full rounded-xl h-12 text-destructive font-bold text-sm"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('common.logout')}
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-xl font-bold text-sm h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20">
                    {t('common.login')}
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20 md:h-24" />
    </>
  );
};

export default Navbar;
