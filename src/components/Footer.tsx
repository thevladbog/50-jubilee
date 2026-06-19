import { motion } from 'motion/react';

export default function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="text-center pb-8 pt-12 border-t border-text/10"
    >
      <p className="font-serif text-2xl text-text mb-2">Инна | 50</p>
      <p className="text-text/50 text-xs font-light uppercase tracking-[0.2em]">До встречи на празднике</p>
    </motion.footer>
  );
}
