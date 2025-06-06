import styles from './error.module.css';

type ErrorProps = {
  error: string;
  tryAgain?: () => void;
};

export default function Error({ error, tryAgain }: ErrorProps) {
  return (
    <div className={styles.container}>
      <p className={styles.error}>{error}</p>
      {tryAgain && (
        <button className={styles.button} onClick={tryAgain}>
          Спробувати знову
        </button>
      )}
    </div>
  );
}
