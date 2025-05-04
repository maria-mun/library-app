import styles from './select.module.css';
import { useState } from 'react';

export type SelectOption = string;

type SingleSelectProps = {
  multiple?: false;
  value?: SelectOption;
  onChange: (value: SelectOption | undefined) => void;
};

type MultipleSelectProps = {
  multiple: true;
  value: SelectOption[];
  onChange: (value: SelectOption[]) => void;
};

type SelectProps = {
  options: SelectOption[];
  label?: string;
} & (SingleSelectProps | MultipleSelectProps);

const Select = ({ multiple, label, value, onChange, options }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  function clearSelected() {
    if (multiple) {
      onChange([]);
    } else {
      onChange(undefined);
    }
  }

  function selectOption(option: SelectOption) {
    if (multiple) {
      if (value.includes(option)) {
        onChange(value.filter((o) => o !== option));
      } else {
        onChange([...value, option]);
      }
    } else {
      if (option !== value) onChange(option);
    }
  }

  function isSelected(option: SelectOption) {
    return multiple ? value.includes(option) : value === option;
  }

  return (
    <div>
      <div
        className={`${styles.placeholder} ${
          !value || (Array.isArray(value) && value.length === 0)
            ? ''
            : styles.label
        }
        `}
      >
        {label}
      </div>
      <div
        onBlur={() => {
          setIsOpen(false);
        }}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        tabIndex={0}
        className={styles.container}
      >
        <span className={styles.value}>
          {multiple
            ? value.map((v) => (
                <button
                  type="button"
                  key={v}
                  className={styles['option-badge']}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOption(v);
                  }}
                >
                  {v}
                  <span className={styles['remove-btn']}>&times;</span>
                </button>
              ))
            : value}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            clearSelected();
          }}
          type="button"
          className={styles['clear-btn']}
        >
          &times;
        </button>
        <div className={styles.divider}></div>
        <div className={styles.caret}></div>
        <ul className={`${styles.options} ${isOpen ? styles.show : ''}`}>
          {options.map((option) => (
            <li
              onClick={(e) => {
                e.stopPropagation();
                selectOption(option);
                if (!multiple) setIsOpen(false);
              }}
              key={option}
              className={`${styles.option} ${
                isSelected(option) ? styles.selected : ''
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Select;
