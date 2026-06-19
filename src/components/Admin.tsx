import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/auth';
import { Search, Filter } from 'lucide-react';

interface RSVPData {
  id: string;
  name: string;
  attendance: string;
  wishes: string;
  date: string;
  createdAt: string;
}

export default function Admin() {
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'Все' | 'Будет' | 'Не сможет'>('Все');
  const [loading, setLoading] = useState(true);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: RSVPData[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as RSVPData);
      });
      setRsvps(data);
      setLoading(false);
    }, (error) => {
      console.error("Ошибка при получении данных:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'МамеСнова18') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const filteredRsvps = rsvps.filter(rsvp => {
    const matchesSearch = rsvp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (rsvp.wishes && rsvp.wishes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'Все' || rsvp.attendance === filter;
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-alt p-4 md:p-8 font-sans flex items-center justify-center">
        <div className="w-full max-w-sm">
          <form onSubmit={handleLogin} className="bg-surface/80 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-border/80 shadow-[0_20px_60px_-15px_rgba(225,122,136,0.1)] text-center">
            <h1 className="font-serif text-3xl text-text mb-8">Вход для администратора</h1>
            <input 
              type="password" 
              placeholder="Введите кодовое слово"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-6 py-4 bg-surface border ${authError ? 'border-red-400' : 'border-border'} rounded-xl focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all mb-4 text-center`}
            />
            {authError && <p className="text-red-500 text-sm mb-6">Неверное кодовое слово</p>}
            <button 
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-sm"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-5xl font-serif text-text w-full text-center mb-10">Ответы гостей</h1>

        <div className="flex flex-col md:flex-row gap-4 bg-surface/80 backdrop-blur-md p-6 rounded-3xl border border-border/80 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={20} />
            <input 
              type="text" 
              placeholder="Поиск по имени или пожеланию..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={20} />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full pl-12 pr-10 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all appearance-none"
            >
              <option value="Все">Все ответы</option>
              <option value="Будет">Только присутствующие</option>
              <option value="Не сможет">Только 'Не сможет'</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text/40">
              ▼
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-surface/90 backdrop-blur-md rounded-3xl border border-border/80 overflow-hidden shadow-[0_20px_60px_-15px_rgba(225,122,136,0.1)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-accent/5 border-b border-accent/10 text-text/80 font-serif">
                    <th className="p-4 pl-6 font-medium">Имя</th>
                    <th className="p-4 font-medium">Статус</th>
                    <th className="p-4 font-medium min-w-[300px]">Пожелание</th>
                    <th className="p-4 pr-6 font-medium">Дата отправки</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRsvps.length > 0 ? (
                    filteredRsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="border-b border-text/5 last:border-b-0 hover:bg-surface-hover transition-colors">
                        <td className="p-4 pl-6 font-medium text-text">{rsvp.name}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            rsvp.attendance === 'Будет' 
                               ? 'bg-leaf/20 text-leaf bg-opacity-20' 
                               : 'bg-text/10 text-text/60'
                          }`}>
                            {rsvp.attendance}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-text/80 leading-relaxed whitespace-pre-wrap">{rsvp.wishes || '—'}</td>
                        <td className="p-4 pr-6 text-sm text-text/50">{rsvp.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-text/50">
                        {rsvps.length === 0 ? 'Пока нет ответов.' : 'Ответов, удовлетворяющих фильтрам, не найдено.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
