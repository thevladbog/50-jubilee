import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Info, CalendarPlus } from 'lucide-react';

export default function Details() {
  const [showMap, setShowMap] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const generateICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InnaJubilee//Calendar//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Юбилей Инны | 50 лет
DTSTART;TZID=Europe/Moscow:20260726T173000
DTEND;TZID=Europe/Moscow:20260726T230000
LOCATION:Кафе Дача Ст.Ленинградская, Ленинградская, Краснодарский край, Россия, 353767
DESCRIPTION:Сбор гостей в 17:30. Начало в 18:00. Ждем вас!\\n\\nЯндекс Карты: https://yandex.ru/maps/-/CTA6qEN-\\nGoogle Карты: https://maps.app.goo.gl/5EWKoSK2jqcQHYjV9
URL:https://yandex.ru/maps/-/CTA6qEN-
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inna_jubilee.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-8 relative z-10 font-sans">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 text-center"
      >
        {/* Когда */}
        <motion.div variants={item} className="flex flex-col items-center p-8 md:p-10 bg-surface/80 backdrop-blur-md rounded-[2.5rem] border border-border/80 shadow-[0_20px_60px_-15px_rgba(225,122,136,0.1)] relative overflow-hidden group">
          <div className="absolute -top-8 -right-8 text-accent/5 scale-150 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 ease-out pointer-events-none">
            <Calendar size={250} strokeWidth={0.5} />
          </div>
          <div className="w-16 h-16 mb-5 shrink-0 rounded-2xl bg-surface-hover border border-border flex items-center justify-center text-accent shadow-sm relative z-10">
            <Calendar className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <div className="relative z-10 flex flex-col flex-1 w-full">
            <h3 className="font-serif text-3xl text-text mb-3">Когда</h3>
            <div className="text-text/70 text-base font-light leading-relaxed flex flex-col flex-1">
              <p className="font-medium text-text text-xl mb-3">26 Июля 2026</p>
              <p>Сбор гостей в 17:30</p>
              <p>Начало в 18:00</p>
              <div className="mt-auto pt-6 flex justify-center">
                <button 
                  onClick={generateICS}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full text-sm hover:bg-accent/90 transition-colors shadow-sm cursor-pointer"
                >
                  <CalendarPlus size={16} />
                  <span>В календарь</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Где */}
        <motion.div variants={item} className="flex flex-col items-center p-8 md:p-10 bg-surface/80 backdrop-blur-md rounded-[2.5rem] border border-border/80 shadow-[0_20px_60px_-15px_rgba(225,122,136,0.1)] relative overflow-hidden group">
          <div className="absolute -top-8 -right-8 text-rose/5 scale-150 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 ease-out pointer-events-none">
            <MapPin size={250} strokeWidth={0.5} />
          </div>
          <div className="w-16 h-16 mb-5 shrink-0 rounded-2xl bg-surface-hover border border-border flex items-center justify-center text-rose shadow-sm relative z-10">
            <MapPin className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <div className="relative z-10 flex flex-col flex-1 w-full">
            <h3 className="font-serif text-3xl text-text mb-3">Где</h3>
            <div className="text-text/70 text-base font-light leading-relaxed flex flex-col flex-1">
              <p className="font-medium text-text text-xl mb-3">Ресторан «Дача»</p>
              <div className="mt-auto pt-6 flex justify-center">
                <button 
                  onClick={() => setShowMap(!showMap)}
                  className="inline-block px-5 py-2.5 bg-rose text-white rounded-full text-sm hover:bg-rose-dark transition-colors shadow-sm cursor-pointer"
                >
                  {showMap ? 'Скрыть карту' : 'Показать на карте'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Формат */}
        <motion.div variants={item} className="flex flex-col items-center p-8 md:p-10 bg-surface/80 backdrop-blur-md rounded-[2.5rem] border border-border/80 shadow-[0_20px_60px_-15px_rgba(225,122,136,0.1)] relative overflow-hidden group">
          <div className="absolute -top-8 -right-8 text-accent/5 scale-150 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ease-out pointer-events-none">
            <Info size={250} strokeWidth={0.5} />
          </div>
          <div className="w-16 h-16 mb-5 shrink-0 rounded-2xl bg-surface-hover border border-border flex items-center justify-center text-accent shadow-sm relative z-10">
            <Info className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <div className="relative z-10 flex flex-col flex-1 w-full">
            <h3 className="font-serif text-3xl text-text mb-3">Формат</h3>
            <div className="text-text/70 text-base font-light leading-relaxed flex flex-col flex-1">
              <p>Летний ужин в кругу близких.</p>
              <p>Без строгой программы —</p>
              <p>только тепло, цветы,</p>
              <p>радость и звон бокалов.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="w-full max-w-5xl mx-auto mt-6"
          >
            <div className="bg-surface/80 backdrop-blur-md p-4 rounded-[2.5rem] border border-border/80 shadow-[0_20px_60px_-15px_rgba(225,122,136,0.1)] w-full">
              <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-inner">
                <iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3A22fb7a0af3eaf743609ecb49c60d8ba9092f45cf5abb0c13b22ef25b899de567&source=constructor" width="100%" height="100%" frameBorder="0"></iframe>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
