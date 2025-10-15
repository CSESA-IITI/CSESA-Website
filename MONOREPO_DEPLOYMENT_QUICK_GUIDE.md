# 🚀 Quick Monorepo Deployment Reference

## 📁 Your Repository Structure
```
your-repo/
├── backend/          # Django backend → PythonAnywhere
├── frontend/         # React frontend → Vercel
├── DEPLOYMENT_GUIDE.md
└── README.md
```

## ⚡ Quick Steps

### 🐍 PythonAnywhere (Backend)
1. **Clone monorepo**: `git clone https://github.com/yourusername/your-repo.git`
2. **Navigate to backend**: `cd your-repo/backend`
3. **Install deps**: `pip install -r requirements-production.txt`
4. **Setup database**: Create MySQL database in PythonAnywhere dashboard
5. **Configure WSGI**: Point to `/home/yourusername/your-repo/backend`
6. **Set environment variables** in `.env` file
7. **Run migrations**: `python manage.py migrate --settings=csesa_backend.production_settings`

### ⚡ Vercel (Frontend)
1. **Import GitHub repo** (the same monorepo)
2. **Set Root Directory**: `frontend` ⚠️ **CRITICAL**
3. **Framework**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Add env vars**: `VITE_API_BASE_URL=https://yourusername.pythonanywhere.com/api`

## 🔧 Key Monorepo Settings

### PythonAnywhere Paths:
- **Source code**: `/home/yourusername/your-repo/backend`
- **Working directory**: `/home/yourusername/your-repo/backend`
- **Static files**: `/home/yourusername/your-repo/backend/staticfiles`

### Vercel Settings:
- **Root Directory**: `frontend` (tells Vercel to only build the frontend folder)
- **Build Command**: `npm run build` (runs in frontend/ directory)
- **Output Directory**: `dist` (relative to frontend/)

## 🚨 Common Monorepo Mistakes

❌ **Don't do this:**
- Forget to set Root Directory in Vercel → Build fails
- Use wrong paths in PythonAnywhere WSGI → 500 errors
- Clone to wrong directory → Import errors

✅ **Do this:**
- Always set Vercel Root Directory to `frontend`
- Use full paths in PythonAnywhere: `/home/username/repo-name/backend`
- Test both deployments after any changes

## 🔄 Update Process

### Backend Updates:
```bash
# On PythonAnywhere console
cd /home/yourusername/your-repo
git pull origin main
# Reload web app in dashboard
```

### Frontend Updates:
```bash
# Local machine
git push origin main
# Vercel auto-deploys
```

## 🎯 Final URLs
- **Backend API**: `https://yourusername.pythonanywhere.com/api/`
- **Frontend**: `https://your-app-name.vercel.app`
- **Admin Panel**: `https://yourusername.pythonanywhere.com/admin/`

---
💡 **Pro Tip**: Keep both deployments in sync by always pushing to the same GitHub branch!