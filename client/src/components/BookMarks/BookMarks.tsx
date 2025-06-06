import styles from './bookmarks.module.css';
const lists = [
  { key: 'readBooks', label: 'Прочитано' },
  { key: 'currentlyReadingBooks', label: 'Читаю' },
  { key: 'plannedBooks', label: 'Планую' },
  { key: 'abandonedBooks', label: 'Закинуто' },
];

export default function BookMarks({ activeLists }: { activeLists: string[] }) {
  return (
    <div className={styles.bookmarks}>
      {lists.map((list) => {
        if (activeLists.includes(list.key)) {
          return (
            <div
              key={list.key}
              className={`${styles[list.key]} ${styles.bookmark}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="30"
                height="30"
                viewBox="0 0 64 64"
              >
                <path
                  fill="currentColor"
                  d="M45.41,55.83l-12.82-9.4a1,1,0,0,0-1.18,0l-12.82,9.4A1,1,0,0,1,17,55V8a1,1,0,0,1,1-1H46a1,1,0,0,1,1,1V55A1,1,0,0,1,45.41,55.83Z"
                ></path>
                <path
                  fill="#0000002c"
                  d="M45.41,48.83,33.77,40.3a3,3,0,0,0-3.55,0L18.59,48.83A1,1,0,0,1,17,48v7a1,1,0,0,0,1.59.81l12.82-9.4a1,1,0,0,1,1.18,0l12.82,9.4A1,1,0,0,0,47,55V48A1,1,0,0,1,45.41,48.83Z"
                ></path>
                <path
                  fill="#0000002c"
                  d="M46,7H18a1,1,0,0,0-1,1v5a1,1,0,0,1,1-1H46a1,1,0,0,1,1,1V8A1,1,0,0,0,46,7Z"
                ></path>
                <path
                  fill="black"
                  d="M45,6H19a3,3,0,0,0-3,3V55a2,2,0,0,0,3.18,1.61l12.22-9a1,1,0,0,1,1.18,0l12.23,9A2,2,0,0,0,48,55V9A3,3,0,0,0,45,6Zm1,49-12.23-9a3,3,0,0,0-3.55,0L18,55V9a1,1,0,0,1,1-1H45a1,1,0,0,1,1,1Z"
                ></path>
                <path
                  fill="black"
                  d="M37 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 37 10zM42 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 42 10zM22 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 22 10zM27 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 27 10zM32 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 32 10z"
                ></path>
              </svg>
            </div>
          );
        }
      })}
    </div>
  );
}
