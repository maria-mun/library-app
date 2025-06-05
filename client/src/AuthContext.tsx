import { createContext, useContext, useEffect, useState } from 'react';

import { auth } from './firebase/firebaseConfig.ts';
import { onIdTokenChanged, signOut, User } from 'firebase/auth';
import { loginUser, registerUser } from './firebase/auth';
const API_URL = import.meta.env.VITE_API_URL;

// Типи для контексту
interface AuthContextType {
  user: User | null;
  role: string | null;
  userId: string | null;
  photo: string | null;

  loadingUser: boolean;
  loginUser: (email: string, password: string) => Promise<User | null>;
  registerUser: (
    email: string,
    password: string,
    name: string
  ) => Promise<User | null>;
  logoutUser: () => Promise<void>;
  getFreshToken: () => Promise<string | null>;
}

// Створюємо контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контексту
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoadingUser(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          await new Promise((res) => setTimeout(res, 3000));
          const { role, userMongoId, photo } = await fetchUserInfo(
            firebaseUser
          );
          setRole(role);
          setUserId(userMongoId);
          setPhoto(photo);
        } catch (err) {
          setRole(null);
          setUserId(null);
          setPhoto(null);

          console.error('Помилка при отриманні ролі:', err);
        }
      } else {
        setUser(null);
        setRole(null);
        setUserId(null);
        setPhoto(null);
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserInfo = async (firebaseUser: User) => {
    const token = await firebaseUser.getIdToken();
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Не вдалося отримати роль');
    }
    const data = await res.json();
    console.log('role', data);
    const role = data.role;
    const userMongoId = data.userId;
    const photo = data.photo;
    const listCounts = data.listCounts;
    return { role, userMongoId, photo, listCounts };
  };

  const logoutUser = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setUserId(null);
    setLoadingUser(false);
  };

  const getFreshToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        userId,
        photo,

        loadingUser,
        loginUser,
        registerUser,
        logoutUser,
        getFreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Кастомний хук для використання контексту
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
