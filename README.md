# Cosmic Crash - Project Tracker (Prototype)

This is a self-contained React + Vite prototype for a client-facing project tracker.
It includes:
- Admin panel (create client accounts, add milestones, upload images/videos).
- Client login (only clients created by admin can access the client dashboard).
- Media stored as base64 in localStorage (prototype-level, not for production).
- Dark UI inspired by ImgFX + peacock layout.

## Quick start (local)
1. unzip and open folder
2. run:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

## Admin & Client
- Default admin password: `daredare`
- Admin route: `/admin/login`
- Client route: `/client/login`
- Admin can create client accounts and add milestones/media.

## Deploy to GitHub + Vercel
1. Initialize git in the project folder:
   ```
   git init
   git add .
   git commit -m "Initial commit - cosmic tracker"
   ```
2. Create a GitHub repo (via GitHub website) named e.g. `cosmic-crash-tracker`.
3. Push:
   ```
   git remote add origin https://github.com/USERNAME/cosmic-crash-tracker.git
   git branch -M main
   git push -u origin main
   ```
4. Deploy:
   - Go to Vercel or Netlify -> New Project -> Import from GitHub -> select the repo.
   - For Vercel: Framework: `Vite`, Build Command: `npm run build`, Output Directory: `dist`
   - For Netlify: Build command `npm run build`, Publish `dist`

## Notes / Next steps
- For production store media in cloud storage (Firebase Storage / S3) and use proper backend with hashed passwords.
- I can adapt this to Firebase (Auth + Storage + Firestore) if you want live updates and secure auth.
