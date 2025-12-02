# Deployment Guide - Integrated Scheduler

## Option 1: GitHub Pages (Easiest)

### Step 1: Prepare Repository

```bash
# Initialize git if not already done
git init

# Add files
git add integrated.html integrated-app.js integrated-styles.css INTEGRATED_README.md

# Commit
git commit -m "Add integrated scheduler application"

# Create repository on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** section
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### Step 3: Access Your App

Your app will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO/integrated.html
```

### Step 4: Configure CORS in n8n

**IMPORTANT:** Your n8n webhooks must allow requests from your GitHub Pages domain.

In n8n webhook nodes, add response headers:
```
Access-Control-Allow-Origin: https://YOUR_USERNAME.github.io
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Or for testing (less secure):
```
Access-Control-Allow-Origin: *
```

### Optional: Custom Domain

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In GitHub Pages settings, add your custom domain
3. Create a `CNAME` file in your repo with your domain:
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```
4. Configure DNS records at your domain registrar

---

## Option 2: Netlify (Recommended for Advanced Features)

### Benefits Over GitHub Pages:
- Built-in CORS proxy (via serverless functions)
- Better build tools
- Form handling
- Redirect rules

### Deploy via Drag & Drop:

1. Go to https://app.netlify.com/drop
2. Drag your folder containing:
   - integrated.html
   - integrated-app.js
   - integrated-styles.css
3. Done! You get a URL like: `https://random-name.netlify.app`

### Deploy via Git:

1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "New site from Git"
4. Connect your repository
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: (leave empty or `/`)
6. Click "Deploy site"

### Configure Custom Domain on Netlify:

1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration steps

### CORS Proxy (Advanced):

If you want to avoid CORS issues completely, create a Netlify function:

Create `netlify/functions/proxy.js`:
```javascript
exports.handler = async (event) => {
  const { url, method, body } = JSON.parse(event.body);

  const response = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
```

Then update `integrated-app.js` to use the proxy instead of direct API calls.

---

## Option 3: Vercel

Very similar to Netlify:

### Deploy:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts

### Or Deploy via Web:

1. Go to https://vercel.com
2. Import your GitHub repository
3. Deploy with default settings

---

## Option 4: Cloudflare Pages

### Deploy:

1. Go to https://pages.cloudflare.com
2. Connect your GitHub repository
3. Configure:
   - Build command: (leave empty)
   - Build output directory: `/`
4. Deploy

### Benefits:
- Fastest global CDN
- Unlimited bandwidth
- Good for high-traffic sites

---

## Option 5: Firebase Hosting

### Deploy:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Initialize:
   ```bash
   firebase init hosting
   ```
   - Select or create project
   - Public directory: enter `.` or the folder with your files
   - Single-page app: No
   - GitHub deploys: Optional

4. Deploy:
   ```bash
   firebase deploy
   ```

---

## CORS Troubleshooting

### Testing CORS:

Open browser console and try:
```javascript
fetch('https://automation.core.genius365.ai/webhook/form-options')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Common CORS Errors:

**Error:** `No 'Access-Control-Allow-Origin' header is present`
**Fix:** Configure CORS in n8n webhook settings

**Error:** `CORS policy: Request header field content-type is not allowed`
**Fix:** Add `Access-Control-Allow-Headers: Content-Type` in n8n

### n8n CORS Configuration:

In your n8n webhook node:

1. Click on the webhook node
2. Go to "Settings" or "Headers" section
3. Add "Response Headers":
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```

For production, replace `*` with your actual domain:
```
Access-Control-Allow-Origin: https://yourusername.github.io
```

---

## Testing Locally Before Deploy

### Test with Local Server:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000/integrated.html`

### Test CORS Locally:

Since local testing uses `localhost`, CORS might not be an issue. But when deployed, you'll need proper CORS configuration.

---

## Recommendation

**For Simplicity:** Use GitHub Pages
- Easiest setup
- Free for public repos
- Just enable Pages in settings

**For Production:** Use Netlify or Vercel
- Better performance
- More features
- Can add serverless functions to proxy API calls
- Better handling of CORS issues

**For High Traffic:** Use Cloudflare Pages
- Fastest global CDN
- Unlimited bandwidth
- DDoS protection

---

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Choose hosting platform
- [ ] Enable deployment
- [ ] Configure CORS in n8n webhooks
- [ ] Test folder loading
- [ ] Test schedule deployment
- [ ] (Optional) Add custom domain
- [ ] (Optional) Set up HTTPS (automatic on all platforms)

---

## Support

If you encounter issues:

1. **Check browser console** for errors
2. **Test CORS** using browser dev tools
3. **Verify n8n webhook** is active and accessible
4. **Check API endpoints** are correct in `integrated-app.js`
5. **Test locally first** before deploying

## Security Notes

For production:

1. **CORS:** Use specific domain, not `*`
2. **HTTPS:** All platforms provide free SSL
3. **API Keys:** Don't commit to public repos
4. **Validation:** Ensure n8n validates incoming data
5. **Rate Limiting:** Configure in n8n to prevent abuse
