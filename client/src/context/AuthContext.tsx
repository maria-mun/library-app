import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseConfig.ts'; // Імпорт Firebase
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { loginUser, registerUser } from '../firebase/auth'; // Функції логіну та реєстрації

// Типи для контексту
interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<User | null>;
  registerUser: (
    email: string,
    password: string,
    name: string
  ) => Promise<User | null>;
  logoutUser: () => Promise<void>;
}

// Створюємо контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контексту
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Стежимо за зміною авторизації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe(); // Прибираємо підписку при розмонтуванні
  }, []);

  // Функція для виходу
  const logoutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, registerUser, logoutUser }}
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
