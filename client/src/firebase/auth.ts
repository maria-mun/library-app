import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './firebaseConfig.ts';

const registerUser = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await updateProfile(user, {
      displayName: name,
    });
    return user;
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    throw error;
  }
};

const loginUser = async (email: string, password: string) => {
  console.log(email, password);
  return null;
};

export { registerUser, loginUser };
