# Folder & Drip Campaign Scheduler

A beautiful, integrated web application that combines folder selection with drip campaign scheduling for n8n workflow automation.

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### Folder Selection
- Dynamically loads folders from your API
- Required selection before campaign deployment
- Auto-saves selected folder

### Campaign Modes

**Manual Mode:**
- Set batch size (items per execution)
- Set frequency (hours between executions)
- Perfect for regular, predictable campaigns

**Automated Mode:**
- Set total item count
- Automatically distributes evenly across available time slots
- Perfect for spreading items over a time period

### Scheduling Options

- **Date Range**: Start and end dates for your campaign
- **Days to Run**: Select specific days of the week (Mon-Sun)
- **Time Restrictions**: Set time window (e.g., 9 AM - 5 PM)
- **Smart Calculations**: Automatic schedule generation with even distribution

### Preview & Deploy

- Preview complete schedule before deployment
- See total executions, items, and timing
- View detailed execution timeline
- Deploy to n8n with one click

## Quick Start

### 1. Local Testing

Open `index.html` in your web browser:

```bash
# Option 1: Direct open
open index.html

# Option 2: Local server (Python)
python3 -m http.server 8000
# Visit: http://localhost:8000

# Option 3: Local server (Node.js)
npx serve .
```

### 2. Configure API Endpoints

The application uses these API endpoints (configured in `app.js`):

- **Folder Options API**: Loads folder dropdown options
- **Submit Endpoint**: Receives the complete schedule payload

To change these, edit the constants at the top of `app.js`:

```javascript
this.FOLDER_API = 'your-folder-api-url';
this.SUBMIT_API = 'your-submit-webhook-url';
```

### 3. Use the Application

1. **Select a Folder** - Choose from the loaded options
2. **Choose Mode** - Manual or Automated
3. **Set Date Range** - Campaign start and end dates
4. **Select Days** - Which days to run (Mon-Sun)
5. **Set Time Window** - Time restrictions (e.g., 9 AM - 5 PM)
6. **Configure Batch** - Batch size or total count
7. **Preview** - Review the complete schedule
8. **Deploy** - Send to n8n webhook

## Deployment

### GitHub Pages (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: `main` branch, `/ (root)` folder
   - Click Save

3. **Access your app:**
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

### Other Hosting Options

- **Netlify**: Drag & drop at https://app.netlify.com/drop
- **Vercel**: `npx vercel`
- **Cloudflare Pages**: Connect your GitHub repo
- **Firebase Hosting**: `firebase deploy`

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## Webhook Payload Structure

The application sends a comprehensive JSON payload to your n8n webhook:

```json
{
  "folder": {
    "value": "folder-id",
    "label": "Folder Name"
  },
  "mode": "automated",
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "schedule": {
    "allowedDays": ["monday", "wednesday", "friday"],
    "timeRange": {
      "from": "09:00",
      "to": "17:00"
    }
  },
  "automated": {
    "totalCount": 1000
  },
  "calculatedExecutions": [
    {
      "timestamp": "2025-01-01T09:00:00.000Z",
      "batchSize": 77
    }
  ],
  "summary": {
    "totalExecutions": 13,
    "totalItems": 1000,
    "firstExecution": "2025-01-01T09:00:00.000Z",
    "lastExecution": "2025-01-27T09:00:00.000Z"
  }
}
```

## n8n Workflow Integration

### Example Workflow

```
Webhook (Receive Payload)
    ↓
Extract Folder & Schedule Data
    ↓
Store in Database
    ↓
Schedule Trigger (Run at specified times)
    ↓
Execute Batches for Selected Folder
```

### Webhook Node Setup

1. Create a **Webhook** node in n8n
2. Set method to **POST**
3. Use the webhook URL in your app configuration
4. Enable CORS headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```

### Processing the Data

Access the data in your n8n workflow:

- `{{ $json.folder.value }}` - Selected folder ID
- `{{ $json.folder.label }}` - Selected folder name
- `{{ $json.mode }}` - Campaign mode (manual/automated)
- `{{ $json.calculatedExecutions }}` - Array of scheduled executions
- `{{ $json.summary }}` - Summary statistics

## Project Structure

```
drip-scheduler/
├── index.html          # Main application interface
├── app.js              # Application logic & scheduling algorithms
├── styles.css          # Modern, responsive styling
├── package.json        # Project metadata & scripts
├── .gitignore         # Git exclusions
├── README.md          # This file
└── DEPLOYMENT_GUIDE.md # Detailed deployment instructions
```

## Features Checklist

✅ Dynamic folder loading from API
✅ Two campaign modes (Manual/Automated)
✅ Flexible date and time scheduling
✅ Day-of-week filtering
✅ Smart batch distribution
✅ Real-time preview
✅ Auto-save configuration
✅ Responsive design
✅ Error handling
✅ Form validation
✅ No dependencies
✅ Single static page

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Change Colors

Edit `styles.css` (:root section):

```css
:root {
    --primary-color: #64748b;    /* Main brand color */
    --success-color: #10b981;    /* Success messages */
    --error-color: #ef4444;      /* Error messages */
}
```

### Modify Default Values

Edit `app.js` in the `setDefaultDates()` method or change HTML input values.

### Add Custom Validation

Extend the validation methods in `app.js`:

```javascript
validateDates() {
    // Add your custom validation logic
}
```

## Troubleshooting

**Folders not loading:**
- Check browser console for errors
- Verify API endpoint is correct and accessible
- Check CORS settings on your API

**Deployment fails:**
- Verify webhook endpoint is correct
- Check n8n webhook is active and set to POST
- Review browser console for error messages

**Preview shows no executions:**
- Ensure date range is valid (end > start)
- Verify at least one day is selected
- Check time range is valid

## Security Notes

### For Production:

1. **API Security:**
   - Use HTTPS for all endpoints
   - Implement authentication on webhooks
   - Validate all incoming data in n8n

2. **CORS Configuration:**
   - Configure n8n to accept requests from your domain
   - Replace `*` with your specific domain in production

3. **Data Validation:**
   - All inputs are validated client-side
   - Implement server-side validation in n8n
   - Sanitize data before database storage

## Example Use Cases

### 1. Email Drip Campaign
- Select email list folder
- Set automated mode with 1000 contacts
- Spread over 2 weeks, weekdays only, 9 AM - 5 PM
- Deploy and let n8n handle execution

### 2. Social Media Posting
- Select content folder
- Manual mode: 1 post every 3 hours
- All week, 8 AM - 8 PM
- Consistent timing throughout campaign

### 3. Data Processing
- Select data folder
- Automated mode: 5000 records
- Weekdays only to avoid peak times
- Process in batches automatically

## Auto-Save Feature

The application automatically saves your configuration to localStorage:
- Saves on every input change
- Persists through page refreshes
- Clears after successful deployment
- Privacy-friendly (stored locally only)

## Technical Details

- **Pure vanilla JavaScript** - No frameworks or build tools
- **Zero dependencies** - Works out of the box
- **Modern ES6+** - Async/await, arrow functions, classes
- **Responsive CSS** - Mobile-first design
- **LocalStorage** - Auto-save configuration
- **Fetch API** - Modern HTTP requests

## Contributing

Feel free to fork and submit pull requests!

## License

MIT License - Free to use and modify

## Support

For issues:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Review n8n webhook configuration
4. Test with smaller date ranges first

---

**Built with vanilla JavaScript for maximum compatibility and zero dependencies.**
