#!/usr/bin/env python3
import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def get_auth_code(auth_url):
    email = os.environ.get("GOOGLE_USER_LOGIN")
    password = os.environ.get("GOOGLE_USER_PASSWORD")
    if not email or not password:
        print("Error: GOOGLE_USER_LOGIN or GOOGLE_USER_PASSWORD not found in environment.")
        sys.exit(1)

    user_data_dir = "/home/ubuntu/.config/chromium-selenium"
    os.makedirs(user_data_dir, exist_ok=True)

    chrome_options = Options()
    chrome_options.binary_location = "/snap/chromium/3459/usr/lib/chromium-browser/chrome"
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,800")
    chrome_options.add_argument(f"--user-data-dir={user_data_dir}")
    chrome_options.add_argument("--remote-debugging-port=9222")
    
    # Use the direct snap-provided chromedriver binary
    service = Service(executable_path='/snap/chromium/3459/usr/lib/chromium-browser/chromedriver')
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        print(f"Navigating to OAuth URL: {auth_url}")
        driver.get(auth_url)
        
        # 1. Enter Email
        print("Waiting for email field...")
        email_field = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "identifierId"))
        )
        print("Entering email...")
        email_field.send_keys(email)
        
        # Click Next
        next_button = driver.find_element(By.ID, "identifierNext")
        next_button.click()
        
        # 2. Enter Password
        print("Waiting for password field...")
        password_field = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='password']"))
        )
        print("Entering password...")
        password_field.send_keys(password)
        
        # Click Next
        password_next = driver.find_element(By.ID, "passwordNext")
        password_next.click()
        
        # 3. Check for Consent or Redirect
        print("Waiting for redirect or consent screen...")
        start_time = time.time()
        code = None
        while time.time() - start_time < 30:
            current_url = driver.current_url
            print(f"Current URL: {current_url}")
            
            # Check if we landed on the redirect page
            if "applicationdefaultauthcode.html" in current_url:
                time.sleep(2)
                print("Page title:", driver.title)
                if "code=" in current_url:
                    from urllib.parse import urlparse, parse_qs
                    parsed = urlparse(current_url)
                    code = parse_qs(parsed.query).get("code", [None])[0]
                    if code:
                        print(f"Successfully extracted code from URL: {code}")
                        return code
                
                try:
                    code_el = driver.find_element(By.TAG_NAME, "code")
                    code = code_el.text.strip()
                    if code:
                        print(f"Successfully extracted code from <code> element: {code}")
                        return code
                except:
                    pass
                
                print("Page source:", driver.page_source[:1000])
                break
                
            # Check for consent screen "Allow" button
            try:
                approve_btn = driver.find_element(By.ID, "submit_approve_button")
                if approve_btn.is_displayed():
                    print("Found 'Allow' button, clicking it...")
                    approve_btn.click()
            except:
                pass
            
            time.sleep(1)
            
        if not code:
            print("Failed to get auth code within timeout.")
            driver.save_screenshot("login_screenshot.png")
            print("Saved screenshot to login_screenshot.png")
            print("Page source:", driver.page_source[:2000])
            
    except Exception as e:
        print(f"An error occurred: {e}")
        try:
            driver.save_screenshot("login_screenshot.png")
            print("Saved screenshot to login_screenshot.png")
            print("Page title:", driver.title)
            print("Page source:", driver.page_source[:2000])
        except Exception as screenshot_err:
            print(f"Could not take screenshot: {screenshot_err}")
        raise e
    finally:
        driver.quit()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: selenium_login.py <auth_url>")
        sys.exit(1)
    
    get_auth_code(sys.argv[1])
