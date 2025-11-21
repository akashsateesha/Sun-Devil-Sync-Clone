"""
ASU Sun Devil Central Web Scraper
This script scrapes data from the ASU Sun Devil Central website.
Requires authentication via ASU SSO.
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import json
from datetime import datetime


class ASUSunDevilCentralScraper:
    def __init__(self):
        """Initialize the scraper with Chrome WebDriver"""
        self.driver = None
        self.wait = None
        self.scraped_data = {
            "url": "https://sundevilcentral.eoss.asu.edu/web_app?id=24040&menu_id=56483&if=0&",
            "scraped_date": datetime.now().isoformat(),
            "groups": [],
            "events": [],
            "announcements": [],
            "funding_info": {}
        }
    
    def setup_driver(self):
        """Set up Chrome WebDriver with options"""
        options = webdriver.ChromeOptions()
        # Remove headless mode to allow manual login
        # options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 120)  # Increased to 120 seconds for login
        print("WebDriver initialized successfully")
    
    def navigate_to_page(self, url):
        """Navigate to a specific URL"""
        print(f"Navigating to: {url}")
        self.driver.get(url)
        time.sleep(2)
    
    def wait_for_manual_login(self):
        """Wait for user to manually complete login"""
        print("\n" + "="*60)
        print("MANUAL LOGIN REQUIRED")
        print("="*60)
        print("Please log in using your ASU credentials in the browser window.")
        print("Complete the Duo authentication when prompted.")
        print("Waiting for login to complete...")
        print("="*60 + "\n")
        
        # Wait for redirect away from login page
        try:
            self.wait.until(
                lambda driver: "weblogin.asu.edu" not in driver.current_url and 
                               "login" not in driver.current_url.lower()
            )
            print("✓ Login successful!")
            time.sleep(3)  # Wait for page to fully load
            return True
        except TimeoutException:
            print("✗ Login timeout. Please try again.")
            return False
    
    def scrape_main_page(self):
        """Scrape the main Sun Devil Central page"""
        print("\nScraping main page...")
        
        try:
            # Wait for page to load
            time.sleep(3)
            
            # Scrape My Groups
            try:
                my_groups_section = self.driver.find_elements(By.XPATH, "//h2[contains(text(), 'My Groups')]/following-sibling::*//a")
                self.scraped_data["my_groups"] = [group.text for group in my_groups_section if group.text]
                print(f"✓ Found {len(self.scraped_data['my_groups'])} groups in 'My Groups'")
            except Exception as e:
                print(f"✗ Error scraping My Groups: {e}")
            
            # Scrape Suggested Groups
            try:
                suggested_groups = self.driver.find_elements(By.XPATH, "//h2[contains(text(), 'Suggested Groups')]/following-sibling::*//a")
                self.scraped_data["suggested_groups"] = [group.text for group in suggested_groups if group.text]
                print(f"✓ Found {len(self.scraped_data['suggested_groups'])} suggested groups")
            except Exception as e:
                print(f"✗ Error scraping Suggested Groups: {e}")
            
            # Scrape Announcements
            try:
                announcements = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'announcement')]")
                for announcement in announcements:
                    try:
                        title = announcement.find_element(By.TAG_NAME, "h3").text
                        content = announcement.text
                        self.scraped_data["announcements"].append({
                            "title": title,
                            "content": content
                        })
                    except:
                        pass
                print(f"✓ Found {len(self.scraped_data['announcements'])} announcements")
            except Exception as e:
                print(f"✗ Error scraping announcements: {e}")
            
        except Exception as e:
            print(f"✗ Error scraping main page: {e}")
    
    def scrape_all_groups(self):
        """Scrape all groups from the groups page"""
        print("\nScraping all groups...")
        
        try:
            # Navigate to all groups page
            groups_url = "https://sundevilcentral.eoss.asu.edu/club_signup?view=all&"
            self.navigate_to_page(groups_url)
            time.sleep(3)
            
            # Scroll to load more groups
            print("Scrolling to load groups...")
            last_height = self.driver.execute_script("return document.body.scrollHeight")
            
            for i in range(5):  # Scroll 5 times
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
                new_height = self.driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height
            
            # Try to click "Load all groups" button if it exists
            try:
                load_all_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Load all')]")
                load_all_button.click()
                print("Clicked 'Load all groups' button")
                time.sleep(5)  # Wait for all groups to load
            except NoSuchElementException:
                print("'Load all groups' button not found, using visible groups")
            
            # Extract group information
            group_elements = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/student_community?club_id=')]")
            
            for group in group_elements:
                try:
                    group_name = group.text
                    group_link = group.get_attribute("href")
                    if group_name and group_link:
                        self.scraped_data["groups"].append({
                            "name": group_name,
                            "link": group_link
                        })
                except:
                    pass
            
            print(f"✓ Scraped {len(self.scraped_data['groups'])} groups")
            
        except Exception as e:
            print(f"✗ Error scraping groups: {e}")
    
    def scrape_events(self):
        """Scrape events from the events page"""
        print("\nScraping events...")
        
        try:
            # Navigate to events page
            events_url = "https://sundevilcentral.eoss.asu.edu/events"
            self.navigate_to_page(events_url)
            time.sleep(3)
            
            # Scroll to load more events
            print("Scrolling to load events...")
            for i in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
            
            # Extract event information
            event_elements = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/rsvp_boot?id=')]")
            
            for event in event_elements:
                try:
                    event_title = event.text
                    event_link = event.get_attribute("href")
                    
                    # Try to find date/time information near the event
                    try:
                        parent = event.find_element(By.XPATH, "./..")
                        event_details = parent.text
                    except:
                        event_details = event_title
                    
                    if event_title and event_link:
                        self.scraped_data["events"].append({
                            "title": event_title,
                            "link": event_link,
                            "details": event_details
                        })
                except:
                    pass
            
            print(f"✓ Scraped {len(self.scraped_data['events'])} events")
            
        except Exception as e:
            print(f"✗ Error scraping events: {e}")
    
    def save_to_json(self, filename="scraped_data.json"):
        """Save scraped data to JSON file"""
        filepath = f"/Users/akash/.gemini/antigravity/scratch/asu_scraper/{filename}"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.scraped_data, f, indent=2, ensure_ascii=False)
        print(f"\n✓ Data saved to: {filepath}")
    
    def save_to_python(self, filename="scraped_data_output.py"):
        """Save scraped data as Python variable"""
        filepath = f"/Users/akash/.gemini/antigravity/scratch/asu_scraper/{filename}"
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('"""Scraped data from ASU Sun Devil Central"""\n\n')
            f.write(f'scraped_data = {json.dumps(self.scraped_data, indent=2, ensure_ascii=False)}\n')
        print(f"✓ Data saved to: {filepath}")
    
    def run(self):
        """Main execution method"""
        try:
            print("\n" + "="*60)
            print("ASU SUN DEVIL CENTRAL SCRAPER")
            print("="*60)
            
            # Setup
            self.setup_driver()
            
            # Navigate to main page
            self.navigate_to_page(self.scraped_data["url"])
            
            # Wait for manual login
            if not self.wait_for_manual_login():
                print("Login failed. Exiting...")
                return
            
            # Scrape different sections
            self.scrape_main_page()
            self.scrape_all_groups()
            self.scrape_events()
            
            # Save data
            self.save_to_json()
            self.save_to_python()
            
            print("\n" + "="*60)
            print("SCRAPING COMPLETED SUCCESSFULLY!")
            print("="*60)
            print(f"\nSummary:")
            print(f"  - Groups: {len(self.scraped_data.get('groups', []))}")
            print(f"  - Events: {len(self.scraped_data.get('events', []))}")
            print(f"  - Announcements: {len(self.scraped_data.get('announcements', []))}")
            print(f"  - My Groups: {len(self.scraped_data.get('my_groups', []))}")
            print(f"  - Suggested Groups: {len(self.scraped_data.get('suggested_groups', []))}")
            
        except Exception as e:
            print(f"\n✗ Fatal error: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Keep browser open for inspection
            input("\nPress Enter to close the browser...")
            if self.driver:
                self.driver.quit()
                print("Browser closed.")


if __name__ == "__main__":
    scraper = ASUSunDevilCentralScraper()
    scraper.run()
