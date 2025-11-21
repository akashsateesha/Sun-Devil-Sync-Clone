# ASU Sun Devil Central Web Scraper

This scraper extracts data from the ASU Sun Devil Central website, including groups, events, and announcements.

## Features

- ✅ Handles ASU SSO authentication (manual login)
- ✅ Scrapes all student groups (964+ groups)
- ✅ Extracts upcoming events with details
- ✅ Captures announcements and funding information
- ✅ Saves data in both JSON and Python formats
- ✅ Robust error handling and progress reporting

## Prerequisites

- Python 3.7+
- Google Chrome browser
- ChromeDriver (will be installed automatically)

## Installation

1. Install required packages:
```bash
pip install -r requirements.txt
```

## Usage

1. Run the scraper:
```bash
python scraper.py
```

2. When the browser window opens, log in manually with your ASU credentials

3. Complete the Duo authentication

4. The scraper will automatically:
   - Navigate through different sections
   - Extract all data
   - Save results to files

## Output Files

After scraping completes, you'll find:

- `scraped_data.json` - All data in JSON format
- `scraped_data_output.py` - Data as a Python variable
- `scraped_data.py` - Initial structured data template

## Data Structure

```python
{
  "url": "https://sundevilcentral.eoss.asu.edu/...",
  "scraped_date": "2025-11-20T...",
  "my_groups": [...],
  "suggested_groups": [...],
  "groups": [
    {
      "name": "Group Name",
      "link": "https://..."
    }
  ],
  "events": [
    {
      "title": "Event Title",
      "link": "https://...",
      "details": "Event details..."
    }
  ],
  "announcements": [
    {
      "title": "Announcement Title",
      "content": "Full content..."
    }
  ]
}
```

## Customization

You can modify the scraper to:
- Extract additional fields
- Scrape specific sections only
- Change output format
- Add filtering/sorting

Edit the `scraper.py` file and modify the relevant methods:
- `scrape_main_page()` - Main page content
- `scrape_all_groups()` - Groups listing
- `scrape_events()` - Events calendar

## Troubleshooting

**Browser doesn't open:**
- Ensure Chrome is installed
- Check ChromeDriver compatibility

**Login timeout:**
- Increase wait time in `wait_for_manual_login()`
- Check network connection

**Incomplete data:**
- Increase scroll iterations
- Add more wait time after page loads
- Check if page structure has changed

## Notes

- The scraper uses Selenium for browser automation
- Manual login is required due to ASU SSO + Duo authentication
- Scraping may take several minutes depending on data volume
- The browser window will remain open until you press Enter
