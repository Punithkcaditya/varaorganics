# DEPLOYMENT.md

Vara Organics requires a **Node.js runtime** — SSR, Route Handlers, ISR, Razorpay verification and
Shiprocket calls cannot run as a static export. **Basic static shared hosting is insufficient**
unless you split the frontend and a separate Node backend (not recommended; keep it one Next app).

Node **20 LTS** or newer. Build once, run `next start`.

```bash
npm ci
npm run build
npm run start   # serves on $PORT (default 3000)
```

---

## Option A — Hostinger Node.js hosting

For Hostinger plans with Node.js app support (hPanel → **Website → Node.js**).

1. **Upload / connect** the repo (Git deploy or file manager). Ensure `package.json` is at the app
   root.
2. **Node version:** select 20.x.
3. **Install command:** `npm ci`
4. **Build command:** `npm run build`
5. **Start command:** `npm run start` (Hostinger sets `PORT` — Next respects it).
6. **Environment variables:** add every var from [.env.example](.env.example) in the Node.js app's
   Environment section. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` and `NEXT_PUBLIC_SITE_URL` to the real
   domain. Do **not** upload `.env.local`.
7. **Domain:** point `www.varaorganics.com` to the app; set the app's application URL.
8. **SSL:** enable the free Let's Encrypt certificate in hPanel (SSL → install). Force HTTPS.
9. **Build output:** keep `.next/` from the build; do not delete it between deploys. Persist
   `node_modules` or reinstall on each deploy.
10. **Restart:** use hPanel's **Restart** for the Node app after env changes or redeploys.

---

## Option B — Hostinger VPS (Ubuntu + PM2 + Nginx + Certbot)

Full control; recommended for production traffic.

```bash
# 1. Base
sudo apt update && sudo apt -y upgrade
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nginx git
sudo npm i -g pm2

# 2. Deploy from Git
sudo mkdir -p /var/www/vara && sudo chown $USER /var/www/vara
cd /var/www/vara
git clone <your-repo-url> .
npm ci

# 3. Environment (600 perms, never in Git)
cp .env.example .env.local && nano .env.local   # set real values, mock=false
chmod 600 .env.local

# 4. Build + start under PM2
npm run build
pm2 start "npm run start" --name vara --update-env
pm2 save && pm2 startup   # run the printed command to enable boot start
```

**Nginx reverse proxy** — `/etc/nginx/sites-available/vara`:

```nginx
server {
  server_name www.varaorganics.com varaorganics.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vara /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. HTTPS
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d www.varaorganics.com -d varaorganics.com

# 6. Zero-downtime redeploy
cd /var/www/vara && git pull && npm ci && npm run build && pm2 reload vara --update-env

# 7. Logs
pm2 logs vara            # app logs (sensitive fields redacted)
sudo tail -f /var/log/nginx/error.log

# 8. Rollback
git checkout <previous-good-commit> && npm ci && npm run build && pm2 reload vara
# (tag releases, e.g. git tag rel-YYYYMMDD, to roll back quickly)
```

**Health check:** `GET /api/health` returns `{ ok, status: "healthy", mock }` for uptime monitors
and post-deploy verification.

---

---

## Scheduled jobs (cron)

Two endpoints are designed to be triggered on a schedule. Both require the
`x-admin-secret` header (value = `REVALIDATE_SECRET`).

### Weekly Monday report — every Monday 09:00 IST

**VPS (crontab):**
```bash
crontab -e
# 09:00 IST = 03:30 UTC. Set the server TZ to Asia/Kolkata, or use UTC as below.
30 3 * * 1 curl -fsS -X POST https://www.varaorganics.com/api/reports/weekly \
  -H "x-admin-secret: YOUR_REVALIDATE_SECRET" >> /var/log/vara-weekly.log 2>&1
```

**Hostinger Node hosting** (hPanel → Advanced → Cron Jobs): same command, weekly on Monday.

**Alternative — Supabase Edge Function** (`pg_cron`), if you'd rather keep it off the server:
```sql
select cron.schedule(
  'vara-weekly-report', '30 3 * * 1',
  $$select net.http_post(
      url := 'https://www.varaorganics.com/api/reports/weekly',
      headers := '{"x-admin-secret":"YOUR_REVALIDATE_SECRET"}'::jsonb
    )$$
);
```

The email goes to `ORDER_NOTIFICATION_EMAIL` with last week's orders, revenue, AOV, top product and
stock alerts.

### Monthly P&L feed (pull, not push)

`GET /api/monthly-report?month=YYYY-MM` with the same header. Wire it to the Google Sheet with Apps
Script:

```js
function refreshVaraPnL() {
  const month = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM');
  const res = UrlFetchApp.fetch(
    'https://www.varaorganics.com/api/monthly-report?month=' + month,
    { headers: { 'x-admin-secret': 'YOUR_REVALIDATE_SECRET' } }
  );
  const data = JSON.parse(res.getContentText());
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange('B1').setValue(data.orders);
  sheet.getRange('B2').setValue(data.revenue);
  sheet.getRange('B3').setValue(data.averageOrderValue);
}
```
Set an Apps Script time-driven trigger (monthly) to run it.

### Inbound webhooks to register

| Provider | URL | Auth |
|---|---|---|
| Razorpay | `/api/razorpay/webhook` | `RAZORPAY_WEBHOOK_SECRET` |
| Shiprocket (status) | `/api/shiprocket/webhook` | `x-api-key` = `SHIPROCKET_WEBHOOK_SECRET` |
| Supabase (content) | `/api/revalidate` | `x-revalidate-secret` header |

---

## Post-deploy checklist

- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=false` and Supabase/Razorpay/Shiprocket/Resend vars set.
- [ ] Supabase migrations + seed applied ([DATABASE.md](DATABASE.md)).
- [ ] Razorpay webhook → `https://www.varaorganics.com/api/razorpay/webhook` with the webhook secret.
- [ ] Supabase DB webhook → `/api/revalidate` with the `x-revalidate-secret` header.
- [ ] `view-source` on `/` and a product page shows full HTML (not an empty div).
- [ ] `robots.txt` and `sitemap.xml` load; HTTPS enforced.
- [ ] `/api/health` returns healthy with `mock:false`.
