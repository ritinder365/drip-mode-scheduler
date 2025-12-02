# 📧 Drip Mode Scheduler

A beautiful, vanilla JavaScript application for configuring drip campaign schedules with n8n integration. Perfect for email campaigns, batch processing, and automated workflows.

## ✨ Features

- **Two Operation Modes:**
  - **Manual Mode**: Control batch size and frequency between executions
  - **Automated Mode**: Set total count and let the system distribute evenly across time slots

- **Flexible Scheduling:**
  - Date range selection
  - Day of week filtering (Monday-Sunday)
  - Time range restrictions (e.g., only run 9 AM - 5 PM)

- **Smart Calculations:**
  - Automatic schedule generation
  - Even distribution for automated mode
  - Preview timeline before deployment

- **User-Friendly:**
  - Modern, responsive design
  - Real-time validation
  - Auto-save to localStorage
  - Visual schedule preview

## 🚀 Quick Start

### Local Development

1. Clone this repository
2. Open `index.html` in your browser
3. That's it! No build process required.

### GitHub Pages Deployment

1. **Create a new repository on GitHub**

2. **Add your files:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/drip-scheduler.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose `main` branch and `/ (root)` folder
   - Click "Save"

4. **Access your app:**
   - Your app will be live at: `https://YOUR_USERNAME.github.io/drip-scheduler/`
   - GitHub Pages usually takes 1-2 minutes to deploy

## 📖 How to Use

### 1. Choose Your Mode

**Manual Mode:**
- Best for: Regular, predictable batches
- Configure: Batch size (items per run) and frequency (time between runs)
- Example: Send 50 emails every 2 hours

**Automated Mode:**
- Best for: Spreading a total count across a time period
- Configure: Total items to process
- Example: Send 1000 emails evenly distributed over 2 weeks

### 2. Set Campaign Period

- **Start Date**: When your campaign begins
- **End Date**: When your campaign ends

### 3. Configure Restrictions

**Days to Run:**
- Select which days of the week to run (Monday-Sunday)
- Example: Only run on weekdays (Mon-Fri)

**Time Restrictions:**
- Set the time window for executions
- Example: Only run between 9:00 AM and 5:00 PM

### 4. Configure n8n Webhook

- Enter your n8n webhook URL
- Example: `https://your-n8n-instance.com/webhook/drip-campaign`

### 5. Preview & Deploy

- Click **"Preview Schedule"** to see the execution timeline
- Review total executions, items, and timing
- Click **"Deploy Campaign"** to send to n8n

## 🔧 Integration with n8n

### Webhook Payload Structure

The application sends the following JSON to your n8n webhook:

```json
{
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
    // ... more executions
  ],
  "summary": {
    "totalExecutions": 13,
    "totalItems": 1000,
    "firstExecution": "2025-01-01T09:00:00.000Z",
    "lastExecution": "2025-01-27T09:00:00.000Z"
  }
}
```

### n8n Workflow Setup

1. Create a **Webhook** node (set to POST method)
2. Add processing nodes to handle the `calculatedExecutions` array
3. Use **Schedule Trigger** or **Wait** nodes to execute at specified timestamps
4. Store configuration in a database for persistent scheduling

### Example n8n Workflow Structure

```
Webhook (Receive Config)
    ↓
Store in Database
    ↓
Schedule Trigger (Check every hour)
    ↓
Read from Database
    ↓
Check if execution time matches
    ↓
Execute Batch
    ↓
Update Database (Mark as completed)
```

## 🎨 Customization

### Styling

All styles are in `styles.css`. Key CSS variables:

```css
:root {
    --primary-color: #4f46e5;      /* Main brand color */
    --success-color: #10b981;      /* Success messages */
    --error-color: #ef4444;        /* Error messages */
    --bg-color: #f8fafc;           /* Background */
    --card-bg: #ffffff;            /* Card background */
}
```

### Calculations

The scheduling logic is in `app.js`:

- `calculateManualSchedule()` - Manual mode calculations
- `calculateAutomatedSchedule()` - Automated mode distribution
- `calculateTimeSlots()` - Available time slots based on restrictions

### Default Values

Edit in `app.js` constructor or HTML:

```javascript
// Default time range
document.getElementById('timeFrom').value = '09:00';
document.getElementById('timeTo').value = '17:00';

// Default batch size
document.getElementById('batchSize').value = 10;
```

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Notes

### For Production Use:

1. **Protect your webhook URL:**
   - Don't commit webhook URLs to public repositories
   - Use environment-specific configurations
   - Add API key validation in n8n

2. **n8n Security:**
   - Enable authentication on your webhook
   - Use HTTPS only
   - Validate all incoming data
   - Rate limit webhook requests

3. **CORS Configuration:**
   - Configure n8n to accept requests from your domain
   - In n8n webhook settings, set allowed origins

## 📄 Files Structure

```
drip-scheduler/
├── index.html          # Main HTML structure
├── styles.css          # All styling
├── app.js             # Application logic
└── README.md          # Documentation
```

## 🐛 Troubleshooting

**Issue: Webhook not receiving data**
- Check webhook URL is correct
- Verify n8n webhook is set to POST method
- Check browser console for CORS errors

**Issue: No executions generated**
- Verify date range is valid (end > start)
- Check at least one day is selected
- Ensure time range is valid

**Issue: Preview not showing**
- Check browser console for errors
- Verify dates are selected
- Ensure at least one day is checked

## 🤝 Contributing

Feel free to fork and submit pull requests!

## 📝 License

MIT License - feel free to use in your projects

## 🙋 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify n8n webhook configuration

## 🎯 Roadmap

Potential future features:
- [ ] Timezone support
- [ ] Holiday exclusions
- [ ] Export schedule to CSV
- [ ] Multiple webhook destinations
- [ ] Schedule templates
- [ ] Visual calendar view
- [ ] Execution history tracking

---

Built with ❤️ using Vanilla JavaScript
