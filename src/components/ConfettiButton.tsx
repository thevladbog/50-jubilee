import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

type ConfettiPiece = {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  color: string;
};

const confettiColors = ['#D4AF37', '#F3D675', '#F9E8A8', '#B5952F'];

function createConfettiBurst(): ConfettiPiece[] {
  return Array.from({ length: 34 }, (_, index) => ({
    id: Date.now() + index,
    left: Math.random() * 100,
    size: Math.random() * 6 + 4,
    delay: Math.random() * 0.35,
    duration: Math.random() * 1.4 + 3,
    drift: (Math.random() - 0.5) * 140,
    rotate: Math.random() * 540 + 180,
    color: confettiColors[index % confettiColors.length],
  }));
}

export default function ConfettiButton() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const scrollStopTimer = useRef<number | null>(null);
  const lastLaunchAt = useRef(0);
  const hasScrolled = useRef(false);

  const launchConfetti = useCallback(() => {
    const nextPieces = createConfettiBurst();

    setPieces(nextPieces);
    window.setTimeout(() => {
      setPieces((currentPieces) =>
        currentPieces.filter((piece) => !nextPieces.some((nextPiece) => nextPiece.id === piece.id)),
      );
    }, 5200);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    const handleScroll = () => {
      hasScrolled.current = true;

      if (scrollStopTimer.current) {
        window.clearTimeout(scrollStopTimer.current);
      }

      scrollStopTimer.current = window.setTimeout(() => {
        const now = Date.now();

        if (!hasScrolled.current || now - lastLaunchAt.current < 4500) {
          return;
        }

        lastLaunchAt.current = now;
        launchConfetti();
      }, 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (scrollStopTimer.current) {
        window.clearTimeout(scrollStopTimer.current);
      }
    };
  }, [launchConfetti]);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.span
            key={piece.id}
            className="absolute top-[-8vh] rounded-[2px]"
            style={{
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size * 1.8,
              backgroundColor: piece.color,
              boxShadow: `0 0 10px ${piece.color}55`,
            }}
            initial={{ y: '-8vh', x: 0, rotate: 0, opacity: 0 }}
            animate={{
              y: '112vh',
              x: [0, piece.drift, -piece.drift * 0.35, piece.drift * 0.25],
              rotate: piece.rotate,
              opacity: [0, 0.85, 0.75, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
