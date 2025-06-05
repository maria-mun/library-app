import styles from './load-more.module.css'; // стиль кнопки та індикатора

type LoadMoreButtonProps = {
  onClick: () => void;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
};

export default function LoadMoreButton({
  onClick,
  hasMore,
  loading,
  error,
}: LoadMoreButtonProps) {
  return (
    <div className={styles.wrapper}>
      {error && <div className={styles.error}>{error}</div>}
      {hasMore ? (
        <button className={styles.button} onClick={onClick} disabled={loading}>
          {loading ? 'Завантаження…' : 'Завантажити ще'}
        </button>
      ) : (
        <div className={styles.done}>Більше немає</div>
      )}
    </div>
  );
}
