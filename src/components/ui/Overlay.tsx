import { motion, AnimatePresence } from 'motion/react';
import { useStore, SceneState, STATE_ORDER } from '../../lib/store';
import { useEffect, useState } from 'react';

const COPY: Record<SceneState, string[]> = {
  LAND: [
    "The communities we work in don’t stand still.",
    "They rely on people who show up."
  ],
  IDENTITY: [
    "Staff Giving. Easy. Impactful. Yours.",
    "Supporting partners like the Royal Flying Doctor Service."
  ],
  AIRCRAFT: [
    "Together, we help keep the Flying Doctor in the air."
  ],
  FLIGHT: [
    "Critical equipment, ready when it matters",
    "Pilatus PC-12 aircraft connecting remote Australia",
    "Clinics and telehealth, reaching places like William Creek"
  ],
  IMPACT: [
    "47,000+ patients each year",
    "One every 10 minutes",
    "Right now, someone is waiting."
  ],
  CONTRIBUTION: [
    "Start from $2"
  ],
  HUMAN: [
    "Pilot: \"Your support keeps us flying.\"",
    "Nurse: \"And ready when it matters.\"",
    "Engineer: \"Every dollar makes a difference.\""
  ],
  OWNERSHIP: [
    "This is FOXTROT WHISKEY.",
    "Elders helps keep it flying.",
    "So can you."
  ],
  CTA: [
    "Support the RFDS today.",
    "Donate from $2.",
    "Start on The Shed → Staff Giving"
  ]
};

export default function Overlay() {
  const { currentScene, progress, transitionProgress, setProgress, setMousePosition, setCohesionActive } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [humanLineIndex, setHumanLineIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setProgress(scrollY / maxScroll);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setProgress, setMousePosition]);

  // Rotate human lines
  useEffect(() => {
    if (currentScene === 'HUMAN') {
      const interval = setInterval(() => {
        setHumanLineIndex((prev) => (prev + 1) % 3);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentScene]);

  const handleClick = () => {
    if (currentScene === 'LAND') {
      setCohesionActive(true);
    }
  };

  const getActiveCopy = () => {
    const lines = COPY[currentScene];
    if (!lines) return "";

    if (currentScene === 'IDENTITY') {
      return transitionProgress < 0.5 ? lines[0] : lines[1];
    }
    if (currentScene === 'FLIGHT') {
      if (transitionProgress < 0.33) return lines[0];
      if (transitionProgress < 0.66) return lines[1];
      return lines[2];
    }
    if (currentScene === 'IMPACT') {
      if (transitionProgress < 0.33) return lines[0];
      if (transitionProgress < 0.66) return lines[1];
      return lines[2];
    }
    if (currentScene === 'HUMAN') {
      return lines[humanLineIndex];
    }
    if (currentScene === 'OWNERSHIP') {
      if (transitionProgress < 0.33) return lines[0];
      if (transitionProgress < 0.66) return lines[1];
      return lines[2];
    }
    if (currentScene === 'LAND') {
      return transitionProgress < 0.5 ? lines[0] : lines[1];
    }
    
    return lines[0];
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-10 flex flex-col items-center justify-center text-white"
      onClick={handleClick}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene + getActiveCopy()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-3xl px-6"
        >
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4 font-sans leading-tight">
            {getActiveCopy()}
          </h1>
          
          {currentScene === 'CONTRIBUTION' && (
            <motion.div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="mt-8 pointer-events-auto cursor-pointer"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={isHovered ? 'matched' : 'start'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl text-[#e699ac] font-medium tracking-widest uppercase"
                >
                  {isHovered ? "Elders matches every dollar." : "Hover to see the Elders match"}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {currentScene === 'CTA' && (
            <div className="mt-12 flex flex-col gap-4 items-center pointer-events-auto">
              <p className="text-white/60 uppercase tracking-widest text-sm mb-2">
                {COPY.CTA[1]}
              </p>
              <button className="px-10 py-4 bg-[#f05b22] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
                Donate Now
              </button>
              <p className="text-white/40 text-xs mt-4 italic">
                {COPY.CTA[2]}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <motion.div 
          className="h-full bg-white/40"
          style={{ scaleX: progress, transformOrigin: 'left' }}
        />
      </div>

      {/* State labels rail */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 items-start">
        {STATE_ORDER.map((state) => (
          <div 
            key={state}
            className={`text-[10px] uppercase tracking-[0.3em] transition-all duration-700 flex items-center gap-4 ${
              currentScene === state ? 'text-white opacity-100 translate-x-2' : 'text-white/20 opacity-50'
            }`}
          >
            <span className={`w-8 h-[1px] transition-all duration-700 ${currentScene === state ? 'bg-white w-12' : 'bg-white/20'}`} />
            {state}
          </div>
        ))}
      </div>
    </div>
  );
}
