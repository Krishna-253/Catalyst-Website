import os
import re
import urllib.request
import urllib.parse
from urllib.parse import urljoin, urlparse

BASE_URL = "https://vibes.b150.ai/"
OUTPUT_DIR = r"C:\Users\soodr\.gemini\antigravity\scratch\vibes-scraper\site"

os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def fetch_url(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read(), response.getheader('Content-Type', '')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None, None

html_data, content_type = fetch_url(BASE_URL)
if not html_data:
    print("Failed to download main page.")
    exit(1)

html_text = html_data.decode('utf-8', errors='ignore')

# Save raw HTML
with open(os.path.join(OUTPUT_DIR, "index_raw.html"), "w", encoding="utf-8") as f:
    f.write(html_text)

print(f"Main page fetched ({len(html_text)} bytes).")

asset_urls = set()
for match in re.finditer(r'(?:href|src)=["\']([^"\']+)["\']', html_text):
    val = match.group(1).strip()
    if not val.startswith(('javascript:', 'mailto:', '#', 'tel:')):
        asset_urls.add(val)

for match in re.finditer(r'url\((?:["\']?)([^)"\']+)(?:["\']?)\)', html_text):
    val = match.group(1).strip()
    if not val.startswith(('data:', '#')):
        asset_urls.add(val)

print(f"Found {len(asset_urls)} referenced asset URLs in HTML.")
for u in sorted(asset_urls):
    print("  ", u)
