# Cloudflare Pages + Free Python Cloud Deployment Guide
### Complete Step-by-Step Setup Guide

---

## 🎯 Architecture Overview

```
┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐
│      Cloudflare Pages (Frontend)       │       │    Free Python Cloud: Render/Railway   │
│   https://your-hunter.pages.dev        │       │   https://your-api.onrender.com        │
│   (HTML, CSS, JS, Assets, Global CDN)  │ ───►  │   (FastAPI, Scraper, Auditor Engine)   │
└────────────────────────────────────────┘       └────────────────────────────────────────┘
```

---

## Step 1: Push Code to GitHub

1. GitHub पर एक नया repository बनाएं (उदा. `aurangabad-client-hunter`).
2. अपने लोकल फोल्डर से Git push करें:
```bash
cd /home/sujeet/Documents/client-finder
git init
git add .
git commit -m "Initial commit for Aurangabad Client Hunter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aurangabad-client-hunter.git
git push -u origin main
```

---

## Step 2: Deploy Python Backend (100% Free on Render.com)

1. [Render.com](https://render.com) पर फ्री अकाउंट बनाएं / लॉगिन करें।
2. **New +** ➔ **Web Service** पर क्लिक करें।
3. अपना GitHub repository (`aurangabad-client-hunter`) कनेक्ट करें।
4. निम्नलिखित सेटिंग्स भरें:
   - **Name:** `aurangabad-client-finder-api`
   - **Language:** `Python 3`
   - **Branch:** `main`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
5. **Create Web Service** पर क्लिक करें।
6. 2-3 मिनट में आपका Backend लाइव हो जाएगा और आपको एक URL मिलेगा (उदा. `https://aurangabad-client-finder-api.onrender.com`).

*(वैकल्पिक: आप Railway.app या Koyeb.com पर भी Deploy कर सकते हैं, `Dockerfile` और `Procfile` दोनों पहले से मौजूद हैं)*

---

## Step 3: Deploy Frontend on Cloudflare Pages (100% Free)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) ➔ **Workers & Pages** पर जाएं।
2. **Create application** ➔ **Pages** ➔ **Connect to Git** पर क्लिक करें।
3. अपना GitHub repo सेलेक्ट करें।
4. Build Settings में:
   - **Project Name:** `aurangabad-client-hunter`
   - **Framework Preset:** `None`
   - **Build Output Directory:** `static`
5. **Save and Deploy** पर क्लिक करें।
6. 30 सेकंड में आपकी वेबसाइट Cloudflare के 300+ Edge Data Centers पर लाइव हो जाएगी (उदा. `https://aurangabad-client-hunter.pages.dev`).

---

## Step 4: Connect Frontend to Backend

जब आप अपनी Cloudflare Pages साइट (`https://aurangabad-client-hunter.pages.dev`) खोलेंगे:
1. नीचे बाएं कोने में **⚙️ Cloud API Config** बटन पर क्लिक करें।
2. अपने Render Backend का URL पेस्ट करें:  
   `https://aurangabad-client-finder-api.onrender.com`
3. बस! आपका पूरा Lead Finder, Live Website Auditor, और 1-Click WhatsApp Pitch Generator अब 24/7 Cloudflare पर लाइव काम करेगा।

---

## ⚡ Direct Cloudflare Proxy (Custom Domain)

अगर आपके पास अपना डोमेन है (उदा. `example.com`):
1. Cloudflare Pages ➔ **Custom domains** ➔ `hunter.yourdomain.com` जोड़ें।
2. Render Backend ➔ **Custom domain** ➔ `api-hunter.yourdomain.com` जोड़ें और Cloudflare DNS में CNAME रिकॉर्ड बना दें।
