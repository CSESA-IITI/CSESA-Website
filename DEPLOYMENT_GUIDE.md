# 🚀 Complete Deployment Guide: PythonAnywhere + Vercel (Monorepo)

This guide will help you deploy your Django backend on PythonAnywhere and React frontend on Vercel from a single GitHub repository containing both backend and frontend code.

## 📋 Prerequisites

- PythonAnywhere account (free tier available)
- Vercel account (free tier available)
- GitHub account
- Your monorepo with both `backend/` and `frontend/` folders pushed to GitHub

## 📁 Repository Structure

```
your-repo/
├── backend/          # Django backend
├── frontend/         # React frontend
├── README.md
└── DEPLOYMENT_GUIDE.md
```

## 🔧 Part 1: Deploy Backend on PythonAnywhere

### Step 1: Setup PythonAnywhere Account

1. **Sign up** at [pythonanywhere.com](https://www.pythonanywhere.com)
2. **Choose a username** (this will be part of your domain: `yourusername.pythonanywhere.com`)

### Step 2: Upload Your Code (Monorepo)

1. **Open a Bash console** in PythonAnywhere
2. **Clone your monorepo**:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ls  # You should see both 'backend' and 'frontend' folders
   cd backend  # Navigate to backend for Django setup
   ```

### Step 3: Setup Virtual Environment

```bash
# Create virtual environment
mkvirtualenv --python=/usr/bin/python3.10 csesa-env

# Install dependencies
pip install -r requirements-production.txt
```

### Step 4: Setup Database

1. **Go to Databases tab** in PythonAnywhere dashboard
2. **Create a MySQL database** named `yourusername$csesa_db`
3. **Set a password** for your database
4. **Note down the connection details**

### Step 5: Configure Environment Variables

1. **Open a Bash console**
2. **Create environment file**:
   ```bash
   cd /home/yourusername/your-repo-name/backend
   nano .env
   ```
3. **Add these variables**:
   ```
   SECRET_KEY=your-super-secret-key-here
   DB_PASSWORD=your-database-password
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   ```

### Step 6: Update Configuration Files

1. **Edit `production_settings.py`**:

   - Replace `yourusername` with your actual PythonAnywhere username
   - Update database name and host

2. **Edit `wsgi.py`**:
   - Replace `yourusername` with your actual username

### Step 7: Run Migrations

```bash
cd /home/yourusername/your-repo-name/backend
python manage.py migrate --settings=csesa_backend.production_settings
python manage.py collectstatic --settings=csesa_backend.production_settings
python manage.py createsuperuser --settings=csesa_backend.production_settings
```

### Step 8: Configure Web App

1. **Go to Web tab** in PythonAnywhere dashboard
2. **Create a new web app**
3. **Choose Manual configuration** with Python 3.10
4. **Set the following**:

   - **Source code**: `/home/yourusername/your-repo-name/backend`
   - **Working directory**: `/home/yourusername/your-repo-name/backend`
   - **WSGI configuration file**: `/var/www/yourusername_pythonanywhere_com_wsgi.py`

5. **Edit the WSGI file** and replace its contents with:

   ```python
   import os
   import sys

   path = '/home/yourusername/your-repo-name/backend'
   if path not in sys.path:
       sys.path.insert(0, path)

   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'csesa_backend.production_settings')

   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```

6. **Set up static files**:

   - **URL**: `/static/`
   - **Directory**: `/home/yourusername/your-repo-name/backend/staticfiles`

7. **Set up media files**:
   - **URL**: `/media/`
   - **Directory**: `/home/yourusername/your-repo-name/backend/media`

### Step 9: Test Backend

1. **Reload your web app**
2. **Visit**: `https://yourusername.pythonanywhere.com/api/`
3. **You should see the Django REST framework page**

## 🌐 Part 2: Deploy Frontend on Vercel

### Step 1: Prepare Frontend

1. **Update environment files**:
   - Edit `frontend/.env.production`
   - Replace `yourusername.pythonanywhere.com` with your actual domain

### Step 2: Update Backend CORS Settings

1. **SSH into PythonAnywhere**
2. **Edit production_settings.py**:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'https://your-app-name.vercel.app',  # Your Vercel domain
       'http://localhost:5173',
   ]
   ```
3. **Reload your web app**

### Step 3: Deploy to Vercel (Monorepo Setup)

1. **Push your code to GitHub**:

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
3. **Sign in with GitHub**
4. **Import your repository** (the one containing both backend and frontend)
5. **Configure the project for monorepo**:

   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT: Set this to `frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (Vercel will automatically find package.json in frontend folder)

6. **Add environment variables** in Vercel dashboard:

   - `VITE_API_BASE_URL`: `https://yourusername.pythonanywhere.com/api`
   - `VITE_APP_ENV`: `production`

7. **Deploy**

> **💡 Monorepo Tip**: Vercel will automatically detect that your frontend code is in the `frontend/` directory and only build that part of your repository.

### Step 4: Update CORS Settings (Final)

1. **Get your Vercel domain** (e.g., `your-app-name.vercel.app`)
2. **Update PythonAnywhere settings**:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'https://your-app-name.vercel.app',  # Your actual Vercel domain
       'http://localhost:5173',
   ]
   ```
3. **Reload your PythonAnywhere web app**

## 🔧 Part 3: Final Configuration

### Update Frontend Package.json

Remove the GitHub Pages configuration:

```json
{
  "name": "csesa",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

## 🧪 Testing Your Deployment

### Backend Tests

1. **API Endpoints**: `https://yourusername.pythonanywhere.com/api/`
2. **Admin Panel**: `https://yourusername.pythonanywhere.com/admin/`
3. **Authentication**: Test login/register functionality

### Frontend Tests

1. **Main Site**: `https://your-app-name.vercel.app`
2. **API Calls**: Check browser network tab for successful API calls
3. **Authentication**: Test login/logout functionality

## 🚨 Common Issues & Solutions

### Backend Issues

**Issue**: 500 Internal Server Error
**Solution**:

- Check error logs in PythonAnywhere
- Ensure all environment variables are set
- Verify database connection

**Issue**: CORS errors
**Solution**:

- Update `CORS_ALLOWED_ORIGINS` in production_settings.py
- Reload web app after changes

**Issue**: Static files not loading
**Solution**:

- Run `python manage.py collectstatic`
- Check static files configuration in web app settings

### Frontend Issues

**Issue**: API calls failing
**Solution**:

- Check `VITE_API_BASE_URL` environment variable
- Verify CORS settings on backend
- Check network tab in browser dev tools

**Issue**: Build failures
**Solution**:

- Check TypeScript errors
- Ensure all dependencies are installed
- Verify build command in Vercel settings

## 📝 Environment Variables Summary

### PythonAnywhere (.env file)

```
SECRET_KEY=your-super-secret-key
DB_PASSWORD=your-database-password
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Vercel Environment Variables

```
VITE_API_BASE_URL=https://yourusername.pythonanywhere.com/api
VITE_APP_ENV=production
```

## 🎉 You're Done!

Your application should now be live at:

- **Backend**: `https://yourusername.pythonanywhere.com`
- **Frontend**: `https://your-app-name.vercel.app`

## 🔄 Future Updates

### Backend Updates

1. Push changes to GitHub
2. SSH into PythonAnywhere
3. `git pull origin main`
4. Reload web app

### Frontend Updates

1. Push changes to GitHub
2. Vercel will automatically redeploy

## 📁 Monorepo Specific Notes

### Advantages of Monorepo Deployment:

- **Single repository** to manage both frontend and backend
- **Easier version control** - both parts stay in sync
- **Shared configuration** files and documentation
- **Simpler CI/CD** setup

### Key Differences from Separate Repos:

#### For PythonAnywhere:

- Clone the entire repo, then navigate to `backend/` folder
- All paths reference `/your-repo-name/backend/` instead of just `/backend/`

#### For Vercel:

- **Must set Root Directory to `frontend`** in project settings
- Vercel will only build the frontend part of your repo
- Environment variables work the same way

### File Structure After Deployment:

```
PythonAnywhere: /home/yourusername/your-repo-name/
├── backend/     ← Django app runs from here
├── frontend/    ← Not used on PythonAnywhere
└── other files

Vercel: Uses only frontend/ folder
├── src/
├── package.json
├── vite.config.ts
└── dist/        ← Built files served by Vercel
```

### Future Updates with Monorepo:

1. **Make changes** to either backend or frontend
2. **Commit and push** to GitHub
3. **Backend**: SSH to PythonAnywhere → `git pull` → reload web app
4. **Frontend**: Vercel automatically redeploys on push

---

**Need help?** Check the error logs and ensure all configuration files have the correct domains and usernames replaced.
