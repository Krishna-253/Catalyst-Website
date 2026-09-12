import os
import re
import sys
import urllib.request
import urllib.parse
from urllib.parse import urljoin, urlparse, unquote

BASE_URL = "https://vibes.b150.ai/"
OUTPUT_DIR = os.path.abspath(r"C:\Users\soodr\.gemini\antigravity\scratch\vibes-scraper\site")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

downloaded_assets = {}

def get_clean_path_for_url(asset_url):
    parsed = urlparse(asset_url)
    path = unquote(parsed.path)
    if not path or path == '/':
        path = '/index.html'
    
    # Remove leading slash
    clean = path.lstrip('/')
    
    # If it came from storage.ghost.io or cdn
    if parsed.netloc and parsed.netloc != 'vibes.b150.ai':
        clean = os.path.join("external", parsed.netloc, clean)
    
    return clean

def download_file(url, local_path):
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read()
            with open(local_path, 'wb') as f:
                f.write(content)
            print(f"[OK] Downloaded: {url} -> {os.path.relpath(local_path, OUTPUT_DIR)}")
            return content
    except Exception as e:
        print(f"[ERR] Failed {url}: {e}")
        return None

def process_css(css_content, css_url, local_css_path):
    css_text = css_content.decode('utf-8', errors='ignore')
    
    def repl_url(match):
        raw_url = match.group(1).strip('\'"')
        if raw_url.startswith(('data:', '#', 'javascript:')):
            return match.group(0)
        
        full_asset_url = urljoin(css_url, raw_url)
        clean_rel = get_clean_path_for_url(full_asset_url)
        dest_path = os.path.join(OUTPUT_DIR, clean_rel)
        
        if full_asset_url not in downloaded_assets:
            c = download_file(full_asset_url, dest_path)
            downloaded_assets[full_asset_url] = dest_path
        
        # Calculate relative path from local_css_path to dest_path
        rel_to_css = os.path.relpath(dest_path, os.path.dirname(local_css_path)).replace('\\', '/')
        return f"url('{rel_to_css}')"

    # Regex for url(...)
    modified_css = re.sub(r'url\(\s*([^()]+)\s*\)', repl_url, css_text)
    
    with open(local_css_path, 'w', encoding='utf-8') as f:
        f.write(modified_css)
    return modified_css

def scrape_site():
    print(f"Scraping {BASE_URL}...")
    req = urllib.request.Request(BASE_URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw_html = resp.read().decode('utf-8', errors='ignore')

    # Save original untouched HTML
    with open(os.path.join(OUTPUT_DIR, "index_original.html"), "w", encoding="utf-8") as f:
        f.write(raw_html)

    # Collect all resource URLs
    # 1. <link ... href="...">
    # 2. <script ... src="...">
    # 3. <img ... src="..." (and srcset)>
    # 4. <source ... src="...">
    # 5. <video ... poster="...">
    # 6. inline style url(...)
    
    resource_urls = set()

    for m in re.finditer(r'<(?:link|script|img|source|video)\s+[^>]*?(?:src|href|poster)=["\']([^"\']+)["\']', raw_html, re.I):
        url = m.group(1).strip()
        if not url.startswith(('data:', '#', 'javascript:', 'mailto:', 'tel:')):
            resource_urls.add(url)

    # srcset
    for m in re.finditer(r'srcset=["\']([^"\']+)["\']', raw_html, re.I):
        for part in m.group(1).split(','):
            u = part.strip().split(' ')[0].strip()
            if u:
                resource_urls.add(u)

    # inline style url()
    for m in re.finditer(r'style=["\'][^"\']*?url\((?:["\']?)([^)"\']+)(?:["\']?)\)', raw_html, re.I):
        u = m.group(1).strip()
        if not u.startswith(('data:', '#')):
            resource_urls.add(u)

    print(f"Discovered {len(resource_urls)} resources.")

    url_mapping = {}

    for res in sorted(resource_urls):
        full_url = urljoin(BASE_URL, res)
        # Skip pure web page links (navigation links) like /about, /page/2/, etc., unless it's a font/css/js/image/video
        parsed = urlparse(full_url)
        path_lower = parsed.path.lower()
        
        is_asset = any(path_lower.endswith(ext) for ext in [
            '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
            '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp4', '.webm', '.ico'
        ]) or 'assets/' in path_lower or 'content/images' in path_lower or 'public/' in path_lower

        if not is_asset:
            continue

        clean_rel = get_clean_path_for_url(full_url)
        dest_path = os.path.join(OUTPUT_DIR, clean_rel)

        if full_url not in downloaded_assets:
            content = download_file(full_url, dest_path)
            downloaded_assets[full_url] = dest_path
            if content and clean_rel.endswith('.css'):
                process_css(content, full_url, dest_path)

        # Map original string to relative path for index.html
        rel_to_root = os.path.relpath(dest_path, OUTPUT_DIR).replace('\\', '/')
        url_mapping[res] = rel_to_root

    # Rewrite index.html
    html_mod = raw_html

    # Replace mapped urls
    # Sort by length descending to prevent partial prefix collision
    for orig, local in sorted(url_mapping.items(), key=lambda x: len(x[0]), reverse=True):
        html_mod = html_mod.replace(orig, local)

    with open(os.path.join(OUTPUT_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(html_mod)

    print(f"\n[DONE] Finished scraping. Files saved to:\n{OUTPUT_DIR}")
    print(f"Local entry point: {os.path.join(OUTPUT_DIR, 'index.html')}")

if __name__ == '__main__':
    scrape_site()
