import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            await page.goto('http://localhost:3000', timeout=60000)
            await asyncio.sleep(5)  # Wait for things to load
            await page.screenshot(path='verification_final.png')

            # Check for JS errors
            errors = []
            page.on("pageerror", lambda exc: errors.append(exc))

            # Interact to start audio/game if needed (though we just want to see if it loads)
            await page.click('body')
            await asyncio.sleep(2)

            if errors:
                print(f"JS Errors found: {errors}")
            else:
                print("No JS errors found.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

asyncio.run(run())
