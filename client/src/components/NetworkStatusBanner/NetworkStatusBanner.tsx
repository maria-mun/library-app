import { useEffect, useState } from 'react';
import styles from './network-status-banner.module.css';

export default function NetworkStatusBanner() {
  const [status, setStatus] = useState<'online' | 'offline' | null>(null);

  useEffect(() => {
    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (status === 'online') {
      const timeout = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  if (status === null) return null;

  return (
    <div
      className={
        status === 'offline' ? styles.offlineBanner : styles.onlineBanner
      }
    >
      {status === 'offline'
        ? 'Відсутнє з’єднання з інтернетом'
        : 'З’єднання відновлено'}
    </div>
  );
}
