import styles from './button.module.css';

function Button(props: {
  text: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled: boolean;
}) {
  return (
    <button
      className={`${styles.btn} ${props.disabled ? styles.disabled : ''}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.text}
    </button>
  );
}

export default Button;
