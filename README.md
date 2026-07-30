# WatchLux – Premium Smart Watch Store

Full e-commerce website with admin panel, order tracking, live chat, and dark/light mode.

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:5000

## Admin Panel

| URL | `http://localhost:5000/admin/login.html` |
|---|---|
| **Default Password** | `admin123` |
| **Change Password** | Sidebar → Change Password |

### Admin Features
- Dashboard (stats, revenue, orders)
- Products (CRUD with image upload)
- Orders (status, tracking, payment)
- Reviews (manage customer reviews)
- **💬 Chat** (live customer chat)
- **📢 Offer Banner** (add deals to website header)

## Customer Features
- Browse/shop products
- Cart & checkout (COD)
- Order tracking by Order ID or phone
- In-app live chat support
- Dark/light mode toggle
- Mobile responsive

## Deploy on Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

1. Push this repo to GitHub
2. In Railway: **Deploy from GitHub repo**
3. Settings → **Add Volume** → Mount path: `/data`
4. Environment variables:
   - `PERSISTENT_DIR` = `/data`
   - `PORT` = `5000`
5. Done!

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `OWNER_NUMBER` | `923299847609` | WhatsApp number for support |
| `PERSISTENT_DIR` | (project root) | Railway volume mount for persistence |

Built with Node.js, Express, JSON file storage (no database required).
