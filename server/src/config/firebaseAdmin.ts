import * as admin from 'firebase-admin'; // Потрібно імпортувати весь Firebase Admin SDK
import serviceAccount from './firebaseAdmin.json'; // Твій конфігураційний файл для Firebase

// Ініціалізація Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Використовуємо сертифікат з файлу для авторизації
});

const auth = admin.auth(); // Отримуємо доступ до аутентифікації
export { auth }; // Експортуємо auth для подальшого використання в інших частинах коду
