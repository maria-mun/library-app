type StarProps = {
  filled: boolean | null;
  color?: string;
  number?: number;
  size?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export default function StarIcon({
  filled,
  color = 'gold',
  number,
  size = 20,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: StarProps) {
  return (
    <div
      style={{
        color: 'rgb(158, 158, 158)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: 'pointer' }}
        fill={filled ? color : 'none'}
        height={size}
        width={size}
        stroke={filled ? color : 'currentColor'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {number && <div>{number}</div>}
    </div>
  );
}
