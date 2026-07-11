# CSESA Website

Welcome to the official repository for the **Computer Science and Engineering Students Association (CSESA)** website. 

This platform serves as the digital hub for CSESA, showcasing our events, projects, team members, and providing a gateway for students to connect and collaborate.

## 🚀 Features

- **Dynamic Landing Page**: Engaging animations using Framer Motion and Three.js.
- **Events & Projects Showcase**: Detailed listings of past and upcoming events, as well as ongoing technical projects.
- **Team Directory**: Profiles of the core team members and contributors.
- **Authentication System**: Secure login and profile management with JWT authentication.
- **Contact Us**: Built-in messaging system to reach out to the organization.
- **Smart Loading State**: Intelligent loading screens that adapt to the backend server's response time (especially useful for cold starts on free hosting tiers).

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion, GSAP, Three.js
- **Routing**: React Router v7

### Backend
- **Framework**: Django & Django REST Framework (DRF)
- **Language**: Python
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Authentication**: djangorestframework-simplejwt

## 🛠️ Local Development Setup

To run this project locally, you will need Node.js and Python installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/CSESA-IITI/CSESA-Website.git
cd CSESA-Website
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```
The backend API will run on `http://127.0.0.1:8000/`.

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory:
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend application will be available at `http://localhost:5173/`.

## ☁️ Deployment

- **Frontend**: Designed to be easily deployed on Vercel or Netlify.
- **Backend**: Pre-configured for deployment on Render. Includes a `render.yaml` for infrastructure as code, and handles cold-starts gracefully on the frontend.

## 🤝 Contributing

Contributions are always welcome! Please feel free to open a pull request or submit an issue if you find any bugs or have feature requests.

---

*Developed with ❤️ by the CSESA Team.*
