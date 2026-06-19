import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { submitRsvp } from '../lib/rsvpApi';

export default function RSVP() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const attendance = formData.get('attendance') === 'yes' ? 'Будет' : 'Не сможет';
      const wishes = formData.get('wishes') as string;

      await submitRsvp({ name, attendance, wishes });

      setSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="bg-surface/80 backdrop-blur-xl p-8 md:p-16 rounded-[3rem] border border-border/80 shadow-[0_30px_100px_-20px_rgba(225,122,136,0.15)] text-center relative overflow-hidden mt-8"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-leaf/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      
      <div className="relative z-10 max-w-lg mx-auto">
        <h2 className="font-serif text-5xl md:text-6xl text-text mb-6">Жду вас</h2>
        <p className="text-text/70 font-light text-base md:text-lg mb-12 leading-relaxed">
          Пожалуйста, подтвердите ваше присутствие до <span className="font-medium text-text whitespace-nowrap">15&nbsp;Июля</span>, чтобы я могла с любовью подготовить наш летний праздник.
        </p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface/90 text-text p-8 rounded-2xl border border-accent/20"
            >
              <p className="font-serif text-3xl mb-2 text-accent">Благодарю!</p>
              <p className="text-sm font-light text-text/80">Ваш ответ успешно сохранен! До встречи на празднике.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 text-left"
            >
              <div>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ваше Имя и Фамилия" 
                  className="w-full bg-surface border border-border rounded-2xl px-6 py-4 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all text-text placeholder-text/40 font-light shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-center gap-3 p-4 border border-border rounded-2xl cursor-pointer hover:border-accent/50 hover:bg-bg-alt transition-all bg-surface group shadow-sm text-center">
                  <input type="radio" name="attendance" value="yes" required className="accent-accent w-4 h-4 scale-125" />
                  <span className="font-light text-base group-hover:text-accent transition-colors text-text/90">Я буду</span>
                </label>
                <label className="flex items-center justify-center gap-3 p-4 border border-border rounded-2xl cursor-pointer hover:border-text/30 hover:bg-surface-hover transition-all bg-surface group shadow-sm text-center">
                  <input type="radio" name="attendance" value="no" className="accent-text w-4 h-4 scale-125 grayscale" />
                  <span className="font-light text-base text-text/60 group-hover:text-text/90 transition-colors">Не смогу</span>
                </label>
              </div>
              <div>
                <textarea 
                  name="wishes"
                  placeholder="Ваши теплые слова и пожелания (по желанию)" 
                  rows={3}
                  className="w-full bg-surface border border-border rounded-2xl px-6 py-4 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all text-text placeholder-text/40 font-light resize-none mt-2 shadow-sm"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-dark text-white font-medium text-lg py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-accent/30 disabled:opacity-70 flex justify-center items-center mt-6 h-14"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Отправить ответ"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
