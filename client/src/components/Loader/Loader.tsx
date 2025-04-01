import styles from './loader.module.css';

export default function Loader({ dotSize }: { dotSize: number }) {
  return (
    <div className={styles.container}>
      <div style={{ width: dotSize }} className={styles.loader}></div>
    </div>
  );
}
