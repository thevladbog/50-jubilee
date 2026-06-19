import { useState, type FormEvent } from 'react';
import { ArrowLeft, Download, Filter, Search } from 'lucide-react';
import {
  fetchAdminRsvps,
  updateAdminRsvpAttendance,
  updateAdminRsvpReadingStatus,
  type ReadingStatus,
  type RsvpRecord,
} from '../lib/rsvpApi';
import ThemeToggle from './ThemeToggle';

type AttendanceFilter = 'Все' | 'Будет' | 'Не сможет';
type ReadingFilter = 'Все' | ReadingStatus;

const csvHeaders = ['Имя', 'Статус', 'Статус пожелания', 'Пожелание', 'Дата отправки'];
const readingStatusOrder: ReadingStatus[] = ['Не прочитано', 'Готовится', 'Прочитано'];

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function getNextReadingStatus(status: ReadingStatus): ReadingStatus {
  const currentIndex = readingStatusOrder.indexOf(status);
  return readingStatusOrder[(currentIndex + 1) % readingStatusOrder.length];
}

function getWishStatusStyles(status: ReadingStatus) {
  if (status === 'Готовится') {
    return {
      card: 'border-accent/70 bg-accent/10 text-text shadow-[0_0_0_1px_rgba(212,175,55,0.18)]',
      badge: 'bg-accent/20 text-accent',
    };
  }

  if (status === 'Прочитано') {
    return {
      card: 'border-leaf/70 bg-leaf/10 text-text shadow-[0_0_0_1px_rgba(155,184,161,0.18)]',
      badge: 'bg-leaf/20 text-leaf',
    };
  }

  return {
    card: 'border-transparent text-text/80 hover:border-border hover:bg-surface-hover',
    badge: 'bg-text/10 text-text/50',
  };
}

function AdminNav() {
  return (
    <div className="hidden md:block">
      <a
        href="/"
        className="fixed left-6 top-6 z-50 rounded-full border border-border bg-surface/80 p-3 text-text/80 shadow-sm backdrop-blur-md transition-colors hover:border-accent hover:text-accent md:left-10 md:top-10"
        aria-label="Вернуться на главную"
      >
        <ArrowLeft size={20} strokeWidth={1.5} />
      </a>
      <ThemeToggle />
    </div>
  );
}

function AdminHeader() {
  return (
    <div className="mb-8 grid grid-cols-[3rem_1fr_3rem] items-center gap-3 md:mb-10 md:block">
      <a
        href="/"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface/80 text-text/80 shadow-sm backdrop-blur-md transition-colors hover:border-accent hover:text-accent md:hidden"
        aria-label="Вернуться на главную"
      >
        <ArrowLeft size={20} strokeWidth={1.5} />
      </a>
      <h1 className="whitespace-nowrap text-center font-serif text-3xl text-text md:text-5xl">Ответы гостей</h1>
      <ThemeToggle fixed={false} className="md:hidden" />
    </div>
  );
}

export default function Admin() {
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<AttendanceFilter>('Все');
  const [readingFilter, setReadingFilter] = useState<ReadingFilter>('Все');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingRsvpId, setUpdatingRsvpId] = useState<number | null>(null);
  const [updatingReadingStatusId, setUpdatingReadingStatusId] = useState<number | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [authError, setAuthError] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await fetchAdminRsvps(password);
      setRsvps(data);
      setIsAuthenticated(true);
      setAdminSecret(password);
      setAuthError(false);
      setPassword('');
    } catch (error) {
      console.error('Admin fetch error:', error);
      setAuthError(true);
      setIsAuthenticated(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAttendance = async (rsvp: RsvpRecord) => {
    const nextAttendance = rsvp.attendance === 'Будет' ? 'Не сможет' : 'Будет';

    setUpdatingRsvpId(rsvp.id);

    try {
      const updatedRsvp = await updateAdminRsvpAttendance(adminSecret, rsvp.id, nextAttendance);
      setRsvps((currentRsvps) =>
        currentRsvps.map((currentRsvp) =>
          currentRsvp.id === updatedRsvp.id ? updatedRsvp : currentRsvp,
        ),
      );
    } catch (error) {
      console.error('RSVP update error:', error);
      alert('Не удалось изменить статус. Пожалуйста, попробуйте еще раз.');
    } finally {
      setUpdatingRsvpId(null);
    }
  };

  const handleToggleReadingStatus = async (rsvp: RsvpRecord) => {
    if (!rsvp.wishes) {
      return;
    }

    const nextReadingStatus = getNextReadingStatus(rsvp.readingStatus);

    setUpdatingReadingStatusId(rsvp.id);

    try {
      const updatedRsvp = await updateAdminRsvpReadingStatus(adminSecret, rsvp.id, nextReadingStatus);
      setRsvps((currentRsvps) =>
        currentRsvps.map((currentRsvp) =>
          currentRsvp.id === updatedRsvp.id ? updatedRsvp : currentRsvp,
        ),
      );
    } catch (error) {
      console.error('RSVP reading status update error:', error);
      alert('Не удалось изменить статус пожелания. Пожалуйста, попробуйте еще раз.');
    } finally {
      setUpdatingReadingStatusId(null);
    }
  };

  const handleExportCsv = () => {
    const rows = filteredRsvps.map((rsvp) => [
      rsvp.name,
      rsvp.attendance,
      rsvp.readingStatus,
      rsvp.wishes || '',
      rsvp.date,
    ]);
    const csv = [
      csvHeaders,
      ...rows,
    ].map((row) => row.map(escapeCsvValue).join(';')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `Inna_jubilee_2607_${new Date().toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredRsvps = rsvps.filter(rsvp => {
    const matchesSearch = rsvp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (rsvp.wishes && rsvp.wishes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'Все' || rsvp.attendance === filter;
    const matchesReadingFilter = readingFilter === 'Все' || (Boolean(rsvp.wishes) && rsvp.readingStatus === readingFilter);
    return matchesSearch && matchesFilter && matchesReadingFilter;
  });
  const totalCount = rsvps.length;
  const attendingCount = rsvps.filter((rsvp) => rsvp.attendance === 'Будет').length;
  const declinedCount = rsvps.filter((rsvp) => rsvp.attendance === 'Не сможет').length;

  if (!isAuthenticated) {
    return (
      <>
        <AdminNav />
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
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-sm"
              >
                {isSubmitting ? 'Проверка...' : 'Войти'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-bg-alt p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          <AdminHeader />

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
              onChange={(e) => setFilter(e.target.value as AttendanceFilter)}
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
          <div className="relative min-w-[240px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={20} />
            <select
              value={readingFilter}
              onChange={(e) => setReadingFilter(e.target.value as ReadingFilter)}
              className="w-full pl-12 pr-10 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all appearance-none"
            >
              <option value="Все">Все пожелания</option>
              <option value="Не прочитано">Не прочитано</option>
              <option value="Готовится">Готовится к прочтению</option>
              <option value="Прочитано">Прочитано</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text/40">
              ▼
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:flex-1">
            <button
              type="button"
              onClick={() => setFilter('Все')}
              className={`rounded-2xl border p-3 text-left shadow-sm transition-all sm:p-5 ${
                filter === 'Все'
                  ? 'border-accent/40 bg-accent/10'
                  : 'border-border/80 bg-surface/80 hover:border-accent/30 hover:bg-accent/5'
              }`}
            >
              <p className="text-xs text-text/50 sm:text-sm">Всего</p>
              <p className="mt-1 text-2xl font-serif text-text sm:text-3xl">{totalCount}</p>
            </button>
            <button
              type="button"
              onClick={() => setFilter('Будет')}
              className={`rounded-2xl border p-3 text-left shadow-sm transition-all sm:p-5 ${
                filter === 'Будет'
                  ? 'border-leaf/50 bg-leaf/15'
                  : 'border-border/80 bg-surface/80 hover:border-leaf/30 hover:bg-leaf/10'
              }`}
            >
              <p className="text-xs text-text/50 sm:text-sm">Будут</p>
              <p className="mt-1 text-2xl font-serif text-leaf sm:text-3xl">{attendingCount}</p>
            </button>
            <button
              type="button"
              onClick={() => setFilter('Не сможет')}
              className={`rounded-2xl border p-3 text-left shadow-sm transition-all sm:p-5 ${
                filter === 'Не сможет'
                  ? 'border-text/30 bg-text/10'
                  : 'border-border/80 bg-surface/80 hover:border-text/20 hover:bg-text/5'
              }`}
            >
              <p className="text-xs text-text/50 sm:text-sm">Не смогут</p>
              <p className="mt-1 text-2xl font-serif text-text/60 sm:text-3xl">{declinedCount}</p>
            </button>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredRsvps.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent/20 bg-accent px-6 py-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50 lg:min-w-[180px]"
          >
            <Download size={18} />
            <span>Экспорт CSV</span>
          </button>
        </div>

          <div className="bg-surface/90 backdrop-blur-md rounded-3xl border border-border/80 overflow-hidden shadow-[0_20px_60px_-15px_rgba(225,122,136,0.1)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-accent/5 border-b border-accent/10 text-text/80 font-serif">
                    <th className="min-w-[180px] p-4 pl-6 font-medium">Имя</th>
                    <th className="min-w-[340px] p-4 font-medium">Пожелание</th>
                    <th className="min-w-[170px] p-4 font-medium">Дата отправки</th>
                    <th className="min-w-[130px] p-4 font-medium">Статус</th>
                    <th className="min-w-[210px] p-4 pr-6 font-medium text-right">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRsvps.length > 0 ? (
                    filteredRsvps.map((rsvp) => {
                      const wishStatusStyles = getWishStatusStyles(rsvp.readingStatus);

                      return (
                        <tr key={rsvp.id} className="border-b border-text/5 last:border-b-0 hover:bg-surface-hover transition-colors">
                          <td className="p-4 pl-6 font-medium text-text">{rsvp.name}</td>
                          <td className="p-4 text-sm leading-relaxed">
                            {rsvp.wishes ? (
                              <button
                                type="button"
                                onClick={() => handleToggleReadingStatus(rsvp)}
                                disabled={updatingReadingStatusId === rsvp.id}
                                className={`w-full rounded-2xl border p-3 text-left transition-all disabled:cursor-wait disabled:opacity-70 ${wishStatusStyles.card}`}
                              >
                                <span className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${wishStatusStyles.badge}`}>
                                  {updatingReadingStatusId === rsvp.id ? 'Сохраняю...' : rsvp.readingStatus}
                                </span>
                                <span className="block whitespace-pre-wrap break-words">
                                  {rsvp.wishes}
                                </span>
                              </button>
                            ) : (
                              <span className="text-text/40">—</span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-text/50">{rsvp.date}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              rsvp.attendance === 'Будет'
                                 ? 'bg-leaf/20 text-leaf bg-opacity-20'
                                 : 'bg-text/10 text-text/60'
                            }`}>
                              {rsvp.attendance}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(rsvp)}
                              disabled={updatingRsvpId === rsvp.id}
                              className="inline-flex min-w-[170px] items-center justify-center whitespace-nowrap rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text/80 transition-all hover:border-accent/40 hover:bg-accent/5 hover:text-text disabled:cursor-wait disabled:opacity-60"
                            >
                              {updatingRsvpId === rsvp.id
                                ? 'Сохраняю...'
                                : rsvp.attendance === 'Будет'
                                  ? 'Отметить «Не сможет»'
                                  : 'Отметить «Будет»'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-text/50">
                        {rsvps.length === 0 ? 'Пока нет ответов.' : 'Ответов, удовлетворяющих фильтрам, не найдено.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
