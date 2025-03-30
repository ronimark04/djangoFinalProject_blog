# 📝 Django + React Blog Platform

## ✅ Project Overview

This is a full-stack blog platform built with Django (REST API backend) and React (Vite-based frontend). It features:

- User authentication (JWT-based)
- Role-based permissions (Moderators, Editors, Members, Superusers)
- Article creation, editing, deletion
- Threaded/nested comments
- Tag filtering and article search
- Profile management with avatars
- Data seeding with demo content

This project was developed as a school assignment and includes both backend and frontend components.

---

## ⚙️ Setup Instructions

### 📁 1. Repository & `.env` Files

After cloning the repository, extract the `env.zip` file you received alongside this project. It contains two folders:

```
env.zip
├── backend/
│   └── .env
└── frontend/
    └── .env
```

Move the `.env` files into the corresponding folders in your cloned repository like this:

```
final-blog-project/
├── backend/
│   └── .env         ← Place backend .env here
└── frontend/
    └── .env         ← Place frontend .env here
```

These files contain all necessary configuration variables including database credentials, JWT secrets, and backend URLs.

---

### 🐍 2. Backend Setup (Django)

#### ✅ Requirements

- Python 3.9+
- PostgreSQL
- Virtual environment (`venv`) or tool like `pipenv`

#### 📦 Install dependencies

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

#### 🛠️ Configure environment

Make sure `.env` is in the `backend/` folder as explained earlier.

Check that PostgreSQL is running and create a database matching the `.env`:

```sql
CREATE DATABASE fp_blog;
```

#### 🔧 Run migrations and seed data

```bash
python manage.py migrate
python manage.py runserver
```

On first run, if the database is empty, it will auto-seed demo data including:

- 6 users (with roles)
- Articles with tags
- Comments and nested replies
- Profile pictures and bios

Your backend will now be running at:

```
http://127.0.0.1:8000
```

If you're using a different host or port, update:

- `BASE_BACKEND_URL` in `backend/.env`
- `VITE_BACKEND_URL` in `frontend/.env`
- `CORS_ALLOWED_ORIGINS` in `backend/djangoFinalProject_blog/settings.py`

---

### ⚛️ 3. Frontend Setup (React)

#### ✅ Requirements

- Node.js 18+
- npm or yarn

#### 📦 Install dependencies

```bash
cd frontend
npm install
```

#### ▶️ Start the frontend

```bash
npm run dev
```

Your frontend will now be running at:

```
http://localhost:5173
```

Make sure this port matches the backend CORS settings if you change it.

---

## 🔐 Default Users (Seeded)

| Role       | Username | Password     |
|------------|----------|--------------|
| Moderator  | mod1     | modpass123   |
| Moderator  | mod2     | modpass123   |
| Editor     | editor   | editpass123  |
| Member     | mem1     | mempass123   |
| Member     | mem2     | mempass123   |
| Member     | mem3     | mempass123   |

A superuser must be created manually with:

```bash
python manage.py createsuperuser
```

---

## 🌐 Tech Stack

**Backend:**

- Django & Django REST Framework
- PostgreSQL
- JWT Auth (`djangorestframework-simplejwt`)
- `django-taggit` for tagging
- `python-decouple` for `.env` handling
- `django-cors-headers` for CORS

**Frontend:**

- React (Vite)
- Axios (API calls)
- Context API (auth state)
- React Router
- Bootstrap + CSS Modules
- Formik & Yup (form validation)
- react-toastify (notifications)

---

## ✨ Key Features

- 🔐 JWT Auth with role-based access
- 🧑‍💼 User registration with profile creation
- ✍️ Full CRUD for articles with tag support
- 💬 Nested comments with reply/edit/delete
- 🔍 Search by title, content, or tags
- 🖼 Profile avatars with default fallback
- 📦 Auto-seeding with demo data
- 🔧 Frontend role-based rendering of UI elements
- 🛡 Protected routes and forms

---

## ❗ Troubleshooting

- **CORS errors?**  
  Ensure `http://localhost:5173` is listed in `CORS_ALLOWED_ORIGINS` in `settings.py`.

- **Database connection issues?**  
  Check that PostgreSQL is running and that credentials in `.env` match your local setup.

- **Frontend can’t reach backend?**  
  Verify `VITE_BACKEND_URL` in `frontend/.env` matches the actual backend URL.

---

## 📄 License

This project was created for educational purposes. You are free to explore, test, and extend it as needed for learning or grading.
