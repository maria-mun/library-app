📚 Library App
Full-stack single-page application for managing and exploring books and authors.

🛠 Features
- Authentication — user registration/login via Firebase
- Book and author CRUD — add, edit, view, and (admin-only) delete entries
- Ratings and comments — users can rate and comment on books
- Reading lists — users can add books to private lists
- Admin restrictions — only admins can delete entries from database
- Search and sorting — find books by title or author, sort by rating/date
- Client-side routing — smooth navigation with React Router
- Form validation — proper handling of user input
- Error handling — user-friendly error messages and fallback pages

🧪 Tech Stack
- Frontend: React + TypeScript, CSS Modules
- Backend: Node.js, Express, MongoDB
- Auth: Firebase Authentication
- Deployment: Render

💾 Local Setup
- git clone git@github.com:maria-mun/library-app.git
- cd library-app

# install frontend
- cd client
- npm install
- npm run dev

# install backend
- cd ../server
- npm install
- npm run dev

⚠️ Environment variables (e.g., Firebase credentials, MongoDB URI) are required to run the app and are not included in the repository.

🚀 Live Demo
🔗 https://library-app-client-qnql.onrender.com
