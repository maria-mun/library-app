import styles from './select.module.css';
import { useState } from 'react';
import ArrowIcon from '../Icons/ArrowIcon';

export type SelectOption = {
  value: string;
  label: string;
};

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
      const selected = value as SelectOption[];
      if (selected.some((o) => o.value === option.value)) {
        onChange(selected.filter((o) => o.value !== option.value));
      } else {
        onChange([...selected, option]);
      }
    } else {
      if ((value as SelectOption)?.value !== option.value) {
        onChange(option);
      }
    }
  }

  function isSelected(option: SelectOption) {
    if (multiple) {
      return (value as SelectOption[]).some((o) => o.value === option.value);
    }
    return (value as SelectOption)?.value === option.value;
  }

  return (
    <div>
      {label && (
        <div
          className={`${styles.placeholder} ${
            !value || (Array.isArray(value) && value.length === 0)
              ? ''
              : styles.label
          }`}
        >
          {label}
        </div>
      )}
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
            ? (value as SelectOption[]).map((v) => (
                <button
                  type="button"
                  key={v.value}
                  className={styles['option-badge']}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOption(v);
                  }}
                >
                  {v.label}
                  <span className={styles['remove-btn']}>&times;</span>
                </button>
              ))
            : (value as SelectOption)?.label}
        </span>
        {multiple && (
          <>
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
          </>
        )}

        <ArrowIcon isOpen={isOpen} />
        <ul className={`${styles.options} ${isOpen ? styles.show : ''}`}>
          {options.map((option) => (
            <li
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                selectOption(option);
                if (!multiple) setIsOpen(false);
              }}
              className={`${styles.option} ${
                isSelected(option) ? styles.selected : ''
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Select;
