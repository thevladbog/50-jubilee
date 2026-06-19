import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

function Particles() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate particles only on the client
    const newParticles = Array.from({ length: 60 }).map((_, i) => {
      // type 0: golden spark (falling)
      // type 1: champagne bubble (rising)
      // type 2: pinkish ambient blur (falling slowly)
      const type = Math.floor(Math.random() * 3);
      return {
        id: i,
        x: Math.random() * 100, // percentage left
        size: type === 1 ? Math.random() * 8 + 4 : Math.random() * 5 + 2,
        duration: Math.random() * 15 + 10, // 10 to 25 seconds
        delay: -(Math.random() * 25), // negative delay starts animation midway
        type,
        drift: (Math.random() - 0.5) * 80, // horizontal drift pixels
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => {
        const isBubble = p.type === 1;
        const startY = isBubble ? '110%' : '-10%';
        const endY = isBubble ? '-10%' : '110%';
        const color = p.type === 0 ? '#F9D079' : p.type === 1 ? '#FFFFFF' : '#E17A88';
        const opacityTarget = p.type === 1 ? 0.4 : 0.7;

        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              background: color,
              filter: p.type === 2 ? 'blur(3px)' : 'blur(0.5px)',
              boxShadow: p.type === 0 ? '0 0 8px 2px rgba(249, 208, 121, 0.4)' : 'none',
              top: startY,
            }}
            animate={{
              top: [startY, endY],
              x: [0, p.drift, -p.drift / 2, p.drift / 2, 0],
              opacity: [0, opacityTarget, opacityTarget, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: p.delay,
            }}
          />
        );
      })}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="min-h-[85vh] flex flex-col justify-center items-center text-center relative pt-12 md:pt-0 overflow-hidden">
      
      {/* Анимация падающих искр и пузырьков */}
      <Particles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="space-y-6 z-10 w-full relative"
      >
        <div className="text-accent uppercase tracking-[0.3em] text-sm md:text-base font-medium flex items-center justify-center gap-3">
          <Sparkles className="w-4 h-4 text-accent/50" strokeWidth={1} />
          <span>Приглашение на юбилей</span>
          <Sparkles className="w-4 h-4 text-accent/50" strokeWidth={1} />
        </div>
        
        <div className="relative inline-block z-10">
          <h1 className="font-serif text-7xl md:text-8xl lg:text-9xl text-text tracking-tight leading-none whitespace-nowrap">
            Инна
          </h1>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-6 text-accent/80 italic font-serif mt-7 md:mt-12 relative z-10">
          <div className="flex items-center justify-center gap-5 md:gap-7 text-5xl md:text-7xl lg:text-8xl relative cursor-default">
            <span className="relative inline-block px-1 text-6xl text-text/50 md:text-8xl lg:text-9xl">
              50
              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.8 }}
                className="absolute top-[63%] left-[-4%] w-[108%] h-[1.08em] -translate-y-1/2 text-rose pointer-events-none origin-left"
                viewBox="0 0 100 60"
                preserveAspectRatio="none"
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: "easeInOut" }}
                  d="M 17,10 C 34,23 54,36 83,52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.65, delay: 1, ease: "easeInOut" }}
                  d="M 19,50 C 38,37 58,24 81,9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
              </motion.svg>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute -left-3 top-0 text-rose/25 text-7xl md:text-9xl lg:text-[10rem] -z-10 blur-[2px]"
              >
                50
              </motion.div>
              <motion.span 
                initial={{ opacity: 0, scale: 0, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: -12 }}
                transition={{ delay: 1.4, type: "spring" }}
                className="absolute -top-4 -right-10 text-xs md:-top-2 md:-right-12 md:text-base font-sans not-italic text-rose bg-bg-alt px-3 py-1 rounded-full border border-rose/20 shadow-sm whitespace-nowrap z-10"
              >
                Ой, нет
              </motion.span>
            </span>
            <div className="w-10 md:w-20 lg:w-24 h-px bg-accent/50" />
            <span className="text-7xl md:text-8xl lg:text-9xl text-text font-medium relative">
              18
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute -right-7 top-0 text-accent/25 text-8xl md:-right-9 md:text-9xl lg:text-[10rem] -z-10 blur-[2px]"
              >
                18
              </motion.div>
            </span>
          </div>
          <span className="text-xl md:text-2xl lg:text-3xl font-serif not-italic text-text/60 mt-1 md:mt-0">
            и 32 года опыта
          </span>
        </div>
        
        <p className="max-w-md mx-auto text-text/70 pt-8 leading-relaxed font-light">
          Приглашаю вас разделить со мной этот летний вечер, полный тепла, цветов, улыбок и искренней радости.
        </p>
      </motion.div>
    </section>
  );
}
