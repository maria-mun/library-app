import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCBZz1nvN7Om5kEpZHbQYhGYTeuuxZhJZA',
  authDomain: 'library-app-6c41d.firebaseapp.com',
  projectId: 'library-app-6c41d',
  storageBucket: 'library-app-6c41d.firebasestorage.app',
  messagingSenderId: '1092570427135',
  appId: '1:1092570427135:web:951d103bdfc5314bc926ca',
  measurementId: 'G-DT7YYK35NC',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
