import { lazy, Suspense, useEffect, useState } from 'react';
import Hero from './components/Hero';
import Details from './components/Details';
import RSVP from './components/RSVP';
import Footer from './components/Footer';
import Quote from './components/Quote';
import Countdown from './components/Countdown';
import ThemeToggle from './components/ThemeToggle';
import ConfettiButton from './components/ConfettiButton';
import { Calendar, MapPin, Send } from 'lucide-react';

const Admin = lazy(() => import('./components/Admin'));

function Decor() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center transition-opacity duration-500 opacity-60 dark:opacity-20">
      
      {/* Top Left: Champagne */}
      <div 
        className="absolute top-[-5%] left-[-15%] md:top-[-10%] md:left-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] rotate-[30deg] md:rotate-[45deg] blur-[1px] select-none opacity-10 bg-accent"
        style={{
          WebkitMask: `url('/champagne.svg') no-repeat center / contain`,
          mask: `url('/champagne.svg') no-repeat center / contain`
        }}
      />

      {/* Bottom Right: 50 */}
      <div className="absolute bottom-[5%] right-[-15%] md:bottom-[5%] md:right-[-5%] font-serif text-[250px] md:text-[450px] leading-none text-accent/10 md:text-accent/5 -rotate-12 blur-[1px] select-none">
        50
      </div>

    </div>
  );
}

function AnchorNav() {
  const links = [
    { href: '#when', label: 'Когда', icon: Calendar },
    { href: '#where', label: 'Где', icon: MapPin },
    { href: '#rsvp', label: 'Ответить', icon: Send },
  ];

  return (
    <nav className="fixed left-4 top-6 z-40 flex min-h-12 max-w-[calc(100vw-5.75rem)] items-center overflow-x-auto rounded-full border border-border/80 bg-surface/80 p-1 shadow-sm backdrop-blur-md md:left-1/2 md:right-auto md:top-8 md:w-[calc(100vw-2rem)] md:max-w-max md:-translate-x-1/2">
      <div className="flex w-max items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium text-text/70 transition-colors hover:bg-accent/10 hover:text-accent sm:gap-2 sm:px-4 sm:text-sm"
          >
            <Icon size={16} strokeWidth={1.6} />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

function HeaderBlur() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 h-24 transition-all duration-500 md:h-28 ${
        isScrolled
          ? 'bg-gradient-to-b from-bg/55 via-bg/35 to-bg/0 opacity-100 backdrop-blur-2xl'
          : 'bg-bg/0 opacity-0 backdrop-blur-none'
      }`}
    />
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(window.location.pathname === '/admin');
    
    // Check initial theme from localStorage or system preference
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-bg-alt flex items-center justify-center text-text font-sans">Загрузка...</div>}>
        <Admin />
      </Suspense>
    );
  }

  return (
    <div className="relative min-h-screen scroll-smooth bg-bg text-text selection:bg-accent selection:text-white font-sans transition-colors duration-500">
      <div className="fixed inset-0 bg-noise z-50 pointer-events-none" />
      <div className="fixed inset-0 bg-bg transition-colors duration-500 -z-10" />
      <Decor />
      
      <HeaderBlur />
      <ThemeToggle />
      <ConfettiButton />
      <AnchorNav />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 md:px-16 py-8 md:py-20 flex flex-col gap-16 md:gap-32">
        <Hero />
        <Quote />
        <Countdown />
        <Details />
        <RSVP />
        <Footer />
      </div>
    </div>
  );
}
