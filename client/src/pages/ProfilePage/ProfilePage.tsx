import styles from './profile-page.module.css';
import { useAuth } from '../../AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig.ts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.tsx';
import Loader from '../../components/Loader/Loader.tsx';
const API_URL = import.meta.env.VITE_API_URL;

function ProfilePage() {
  const { getFreshToken, user, loadingUser } = useAuth();
  const navigate = useNavigate();

  const [confirmModalOpened, setConfirmModalOpened] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');

  useEffect(() => {
    if (!loadingUser && user) {
      setName(user.displayName || 'Анонім');
      setOriginalName(user.displayName || 'Анонім');
    }
  }, [loadingUser, user]);

  const handleSaveNewName = async () => {
    const token = await getFreshToken();
    if (!token) return;
    try {
      await fetch(`${API_URL}/auth/updateName`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newName: name }),
      });
      setOriginalName(name);
      setEditingName(false);
    } catch (error) {
      console.error(error);
      navigate('/error', {
        state: {
          code: 500,
          message: 'Помилка при з’єднанні з сервером. Спробуйте ще раз.',
        },
      });
    }
  };
  const handleDeleteProfile = async () => {
    const token = await getFreshToken();
    if (!token) return;
    if (name.length < 2) return;

    try {
      const res = await fetch(`${API_URL}/auth/deleteMe`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Помилка при видаленні профілю');
      }

      await signOut(auth);
      navigate('/allBooks');
    } catch (err) {
      console.error(err);
      navigate('/error', {
        state: {
          code: 500,
          message: 'Помилка при з’єднанні з сервером. Спробуйте ще раз.',
        },
      });
    }
  };

  if (loadingUser) return <Loader />;

  return (
    <div>
      <div>Мій профіль</div>
      {editingName ? (
        <div>
          <input
            type="text"
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleSaveNewName} disabled={name.length < 2}>
            Зберегти
          </button>
          <button
            onClick={() => {
              setName(originalName);
              setEditingName(false);
            }}
          >
            Скасувати
          </button>
        </div>
      ) : (
        <div>
          <div className={styles.name}>{name}</div>
          <button onClick={() => setEditingName(true)}>Змінити ім'я</button>
        </div>
      )}

      <div className={styles.email}>{user?.email}</div>
      <button onClick={() => setConfirmModalOpened(true)}>
        Видалити профіль
      </button>
      {confirmModalOpened && (
        <ConfirmModal
          message="Впевнені, що хочете видалити свій профіль назавжди?"
          onClose={() => setConfirmModalOpened(false)}
          onConfirm={handleDeleteProfile}
        />
      )}
    </div>
  );
}

export default ProfilePage;
