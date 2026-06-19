import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

const getDeclension = (number: number, words: string[]) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};

export default function Countdown() {
  const targetDate = new Date('2026-07-26T17:30:00').getTime();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isMounted) return null;

  const timeUnits = [
    { label: getDeclension(timeLeft.days, ['День', 'Дня', 'Дней']), value: timeLeft.days },
    { label: getDeclension(timeLeft.hours, ['Час', 'Часа', 'Часов']), value: timeLeft.hours },
    { label: getDeclension(timeLeft.minutes, ['Минута', 'Минуты', 'Минут']), value: timeLeft.minutes },
    { label: getDeclension(timeLeft.seconds, ['Секунда', 'Секунды', 'Секунд']), value: timeLeft.seconds }
  ];

  return (
    <section className="relative z-10 w-full font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-12 p-10 md:p-14 bg-surface/80 backdrop-blur-md rounded-[3rem] border border-border/80 shadow-[0_20px_60px_-15px_rgba(225,122,136,0.1)] relative overflow-hidden group"
      >
        <div className="absolute -top-12 -right-12 text-rose/10 scale-150 rotate-[-15deg] pointer-events-none group-hover:rotate-0 transition-transform duration-1000 ease-out">
          <Clock size={250} strokeWidth={0.5} />
        </div>
        
        <h3 className="font-serif text-3xl md:text-5xl text-text text-center relative z-10">
          До встречи осталось
        </h3>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-20 relative z-10">
          {timeUnits.map((unit, idx) => (
            <div key={idx} className="flex flex-col items-center group/unit">
              <div className="text-5xl md:text-6xl font-serif text-accent mb-4 w-20 md:w-24 text-center tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-text/50 uppercase tracking-[0.2em] text-xs font-medium transition-colors">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
