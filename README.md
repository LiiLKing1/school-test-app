# School Testing System (React + Firebase)

A full-stack web application for creating and taking multiple-choice tests at school. Admins manage tests and view results; students register, take tests, and see results.

## Stack
- React + Vite
- TailwindCSS + DaisyUI
- React Router 6
- Firebase Authentication + Firestore
- Firebase Hosting
- Context API for state

## Project Structure
```
src/
 ├── admin/
 │   ├── AdminDashboard.jsx
 │   ├── ResultsTable.jsx
 │   ├── StudentsTable.jsx
 │   ├── TestForm.jsx
 │   └── TestsList.jsx
 ├── components/
 │   ├── Layout.jsx
 │   └── Loading.jsx
 ├── context/
 │   └── AuthContext.jsx
 ├── firebase/
 │   └── firebase.js
 ├── pages/
 │   ├── Login.jsx
 │   ├── NotFound.jsx
 │   └── Register.jsx
 ├── student/
 │   ├── ResultView.jsx
 │   ├── TestSolve.jsx
 │   └── TestsList.jsx
 ├── utils/
 │   ├── AdminRoute.jsx
 │   ├── ProtectedRoute.jsx
 │   └── firestore.js
 ├── App.jsx
 ├── index.css
 └── main.jsx
```

## Features
- Admin: create/edit/delete tests, view students, view results with wrong answers.
- Student: register (full name, class), login, list available tests, solve tests, submit, see results.
- Auth: email + password using Firebase Auth. Admins recognized via `VITE_ADMIN_EMAILS`.
- Data: Firestore collections `users`, `tests`, `results`.

## Environment variables
Copy `.env.example` to `.env` and fill values from your Firebase web app config.
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
# Comma-separated list of admin emails
VITE_ADMIN_EMAILS=admin@example.com,otheradmin@example.com
```

## Getting started (local)
1. Install dependencies
   - `npm install`
2. Create Firebase project (console.firebase.google.com)
   - Enable Authentication → Email/Password
   - Create Firestore database (Start in production or test mode)
   - Add a Web App and copy config into `.env`
   - Add your admin email(s) to `VITE_ADMIN_EMAILS`
3. Start dev server
   - `npm run dev`
   - Open the shown localhost URL.

Admin account options:
- Option A: Create the admin user in Firebase Console (Auth → Add user) using one of the `VITE_ADMIN_EMAILS`.
- Option B: Register via the app and later add that email to `VITE_ADMIN_EMAILS` — the role will upgrade to admin on next sign-in.

## Data model (Firestore)
- `users/{uid}`: { uid, email, displayName, class, role: 'student' | 'admin', createdAt }
- `tests/{testId}`: { title, description, questions: [{ text, options: [..], correctIndex }], createdAt, updatedAt }
- `results/{resultId}`: { userId, studentName, studentClass, testId, testTitle, answers: number[], correctCount, wrongAnswers: [{ index, question, selectedIndex, correctIndex, options }], createdAt }

## Deploy to Firebase Hosting
1. Build
   - `npm run build`
2. Login
   - `npx firebase login`
3. Initialize (first time only)
   - `npx firebase init hosting`
   - Use existing project or create new.
   - Public directory: `dist`
   - Single-page app rewrite: `Yes`
   - This repo already contains `firebase.json` with the SPA rewrite.
4. Deploy
   - `npx firebase deploy --only hosting`

## Notes
- Admin routes are protected under `/admin` via `AdminRoute`.
- Student pages require authentication via `ProtectedRoute`.
- Tailwind and DaisyUI are preconfigured; styles compile via PostCSS when running dev/build.
