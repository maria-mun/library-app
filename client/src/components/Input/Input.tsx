import styles from './input.module.css';

function Input(props: {
  name: string;
  type: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isValid: boolean;
  isFocused: boolean;
  placeholder: string;
  value: string;
  errorMsg: string;
}) {
  return (
    <div
      className={`${styles['input-group']} ${
        !props.isValid && props.isFocused
          ? styles.invalid
          : `${props.isValid && props.isFocused ? styles.valid : ''}`
      }`}
    >
      <label htmlFor={props.name} className={styles.label}>
        {props.label}
      </label>
      <input
        className={styles.input}
        name={props.name}
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e)}
      />
      <span className={styles['input-error']}>{`${
        !props.isValid && props.isFocused ? props.errorMsg : ''
      }`}</span>
    </div>
  );
}

export default Input;
