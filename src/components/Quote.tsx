import { motion } from "motion/react";
import { Flower } from "lucide-react";

export default function Quote() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="relative px-4 py-8 md:py-16 text-center flex flex-col items-center justify-center"
    >
      <div className="relative z-10 max-w-4xl mx-auto bg-surface/80 backdrop-blur-md border border-border/80 p-8 md:p-16 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(225,122,136,0.1)]">
        <Flower className="w-12 h-12 text-rose/50 mx-auto mb-8" strokeWidth={1} />
        <h2 className="font-serif text-2xl md:text-5xl text-text/90 leading-tight mb-8">
          «Жизнь только начинается, когда ты наконец-то знаешь, чего хочешь, и можешь себе это позволить.»
        </h2>
        <div className="flex items-center justify-center gap-4 text-rose">
          <div className="w-8 md:w-12 h-[1px] bg-rose/40" />
          <span className="uppercase tracking-[0.2em] text-xs md:text-sm font-medium">С любовью</span>
          <div className="w-8 md:w-12 h-[1px] bg-rose/40" />
        </div>
      </div>
    </motion.section>
  );
}
