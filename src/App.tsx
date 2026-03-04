import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import SleepProblems from './sections/SleepProblems';
import MarketOpportunity from './sections/MarketOpportunity';
import Technology from './sections/Technology';
import FranchiseAdvantages from './sections/FranchiseAdvantages';
import FranchisePolicy from './sections/FranchisePolicy';
import Process from './sections/Process';
import BrandStrength from './sections/BrandStrength';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="relative min-h-screen overflow-x-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1d33] to-[#0a1628]" />
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#2563eb]/10 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#f59e0b]/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <Navigation />
      
      <main className="relative z-10">
        <Hero />
        <SleepProblems />
        <MarketOpportunity />
        <Technology />
        <FranchiseAdvantages />
        <FranchisePolicy />
        <Process />
        <BrandStrength />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
