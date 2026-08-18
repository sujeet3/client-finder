"""
Website Audit & Opportunity Diagnostic Engine
Author: Senior Marketer & Python Architect

Performs deep technical & marketing diagnosis of target business websites:
- SSL & Trust verification
- Mobile responsiveness & viewport checks
- Page speed & response time measurement
- Conversion optimization leaks (WhatsApp widget, Click-to-Call, Form presence)
- Technical SEO & WhatsApp Social Sharing Preview (OpenGraph)
- CMS & Tech stack fingerprinting
- Generates quantified "Opportunity Score" and ready-to-pitch "Revenue Leaks".
"""

import time
import re
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from typing import Dict, Any, List

def run_website_audit(url_or_domain: str) -> Dict[str, Any]:
    """
    Runs a full marketing and technical diagnostic audit on the provided URL or domain.
    """
    if not url_or_domain or url_or_domain.strip() == "":
        return {
            "status": "error",
            "message": "No website URL provided (Business has NO digital website)",
            "has_website": False,
            "opportunity_score": 98,
            "summary": "CRITICAL: Prospect has NO active website! Losing 100% of high-intent Google searchers to local competitors.",
            "leaks": [
                "100% reliance on word-of-mouth or expensive directory listings (JustDial/IndiaMART).",
                "Google Business Profile has no website link, lowering Google Maps rank by ~40%.",
                "No digital showcase for overseas, B2B, or high-budget clients.",
                "Competitors with modern websites are capturing local search traffic."
            ],
            "pitch_hook": "Launch a modern, high-converting digital portal to capture untapped Aurangabad & Marathwada market share."
        }

    raw_input = url_or_domain.strip()
    if not raw_input.startswith("http://") and not raw_input.startswith("https://"):
        target_url = "https://" + raw_input
    else:
        target_url = raw_input

    parsed = urlparse(target_url)
    domain = parsed.netloc or parsed.path

    result = {
        "status": "success",
        "has_website": True,
        "url": target_url,
        "domain": domain,
        "is_ssl_secure": target_url.startswith("https://"),
        "load_time_seconds": 0.0,
        "http_status_code": 0,
        "is_mobile_responsive": False,
        "has_whatsapp_widget": False,
        "has_click_to_call": False,
        "has_lead_form": False,
        "has_meta_description": False,
        "has_h1_heading": False,
        "has_opengraph_tags": False,
        "has_analytics": False,
        "tech_stack": [],
        "seo_title": "",
        "seo_description": "",
        "opportunity_score": 50,
        "leaks": [],
        "strengths": [],
        "pitch_hook": ""
    }

    # Execute HTTP fetch
    start_time = time.time()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ClientAuditor/2.0"
    }

    try:
        response = requests.get(target_url, headers=headers, timeout=8, verify=False)
        result["load_time_seconds"] = round(time.time() - start_time, 2)
        result["http_status_code"] = response.status_code
        html_content = response.text
        final_url = response.url
        result["is_ssl_secure"] = final_url.startswith("https://")
    except requests.exceptions.SSLError:
        result["is_ssl_secure"] = False
        try:
            http_url = target_url.replace("https://", "http://")
            response = requests.get(http_url, headers=headers, timeout=8)
            result["load_time_seconds"] = round(time.time() - start_time, 2)
            result["http_status_code"] = response.status_code
            html_content = response.text
            result["url"] = http_url
        except Exception as e:
            return _generate_unreachable_report(target_url, str(e))
    except Exception as e:
        return _generate_unreachable_report(target_url, str(e))

    # Parse HTML with BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")
    text_lower = html_content.lower()

    # 1. SEO Title & Description
    title_tag = soup.find("title")
    if title_tag and title_tag.string:
        result["seo_title"] = title_tag.string.strip()
    
    meta_desc = soup.find("meta", attrs={"name": re.compile(r"description", re.I)})
    if meta_desc and meta_desc.get("content"):
        result["seo_description"] = meta_desc.get("content").strip()
        result["has_meta_description"] = True

    # 2. Headings & OpenGraph
    h1_tag = soup.find("h1")
    if h1_tag:
        result["has_h1_heading"] = True

    og_image = soup.find("meta", property="og:image") or soup.find("meta", property="og:title")
    if og_image:
        result["has_opengraph_tags"] = True

    # 3. Mobile Viewport
    viewport = soup.find("meta", attrs={"name": "viewport"})
    if viewport and "width=device-width" in str(viewport.get("content", "")):
        result["is_mobile_responsive"] = True

    # 4. Conversion Elements (WhatsApp, Call, Forms)
    # Check for WhatsApp links
    wa_links = soup.find_all("a", href=re.compile(r"wa\.me|api\.whatsapp\.com|whatsapp:", re.I))
    if wa_links or "whatsapp" in text_lower:
        result["has_whatsapp_widget"] = True

    # Check for tel: links
    tel_links = soup.find_all("a", href=re.compile(r"^tel:", re.I))
    if tel_links:
        result["has_click_to_call"] = True

    # Check for lead forms
    forms = soup.find_all("form")
    if len(forms) > 0:
        result["has_lead_form"] = True

    # 5. Analytics & Pixel
    if "gtag(" in text_lower or "google-analytics" in text_lower or "fbq(" in text_lower or "googletagmanager" in text_lower:
        result["has_analytics"] = True

    # 6. Tech Stack Fingerprinting
    tech = []
    if "wp-content" in text_lower or "wordpress" in text_lower:
        tech.append("WordPress")
    if "shopify" in text_lower:
        tech.append("Shopify")
    if "wix.com" in text_lower:
        tech.append("Wix")
    if "squarespace" in text_lower:
        tech.append("Squarespace")
    if "react" in text_lower or "_next" in text_lower:
        tech.append("React / Next.js")
    if "bootstrap" in text_lower:
        tech.append("Bootstrap")
    if "tailwind" in text_lower:
        tech.append("Tailwind CSS")
    if not tech:
        tech.append("Custom HTML/PHP")
    result["tech_stack"] = tech

    # 7. Calculate Opportunity Score & Identify Critical Revenue Leaks
    score = 40
    leaks = []
    strengths = []

    # SSL
    if not result["is_ssl_secure"]:
        score += 20
        leaks.append("🚨 Website is NOT Secure (HTTP): Chrome shows 'Not Secure' alert, driving 60%+ of visitors away immediately.")
    else:
        strengths.append("✅ Secure HTTPS SSL Certificate active.")

    # Mobile Responsiveness
    if not result["is_mobile_responsive"]:
        score += 25
        leaks.append("📱 Missing Mobile Viewport: Site does not fit modern mobile screens; pinch-to-zoom required.")
    else:
        strengths.append("✅ Mobile Viewport configured.")

    # Speed
    if result["load_time_seconds"] > 3.5:
        score += 15
        leaks.append(f"⏱️ Slow Page Load ({result['load_time_seconds']}s): Google recommends under 2.5s. High mobile bounce rate.")
    else:
        strengths.append(f"⚡ Fast load time ({result['load_time_seconds']}s).")

    # WhatsApp & Call
    if not result["has_whatsapp_widget"]:
        score += 15
        leaks.append("💬 No Instant WhatsApp Button: In Aurangabad, 80%+ B2B/B2C inquiries prefer instant WhatsApp chat over emails.")
    else:
        strengths.append("✅ WhatsApp contact pathway exists.")

    if not result["has_click_to_call"]:
        score += 10
        leaks.append("📞 No 1-Click Call Button: Mobile users cannot tap to dial instantly.")

    if not result["has_lead_form"]:
        score += 10
        leaks.append("📋 No Lead Capture Form: Misses after-hours inquiries when offices are closed.")

    # SEO & OpenGraph
    if not result["has_meta_description"] or len(result["seo_title"]) < 10:
        score += 10
        leaks.append("🔍 Weak SEO Metadata: Incomplete Google search snippet, reducing click-throughs against local rivals.")

    if not result["has_opengraph_tags"]:
        score += 8
        leaks.append("📲 Broken WhatsApp Share Preview: Links sent via WhatsApp show empty grey boxes instead of rich banner & title.")

    if not result["has_analytics"]:
        score += 7
        leaks.append("📊 Missing Google Analytics / Meta Pixel: Owner has zero visibility on how many visitors they get.")

    result["opportunity_score"] = min(100, max(20, score))
    result["leaks"] = leaks
    result["strengths"] = strengths

    # Generate Pitch Hook
    if score >= 80:
        result["pitch_hook"] = "Urgent Modernization & Lead Capture Redesign needed: Fixing mobile UX, WhatsApp funnel, and speed will 2x-3x inquiries."
    elif score >= 60:
        result["pitch_hook"] = "High-ROI Conversion Rate Optimization (CRO) & Local SEO upgrade to convert existing traffic into paying clients."
    else:
        result["pitch_hook"] = "Maintenance, Performance Tuning & Automated Lead Funnel Retainer."

    return result

def _generate_unreachable_report(target_url: str, error_msg: str) -> Dict[str, Any]:
    return {
        "status": "warning",
        "has_website": True,
        "url": target_url,
        "domain": urlparse(target_url).netloc,
        "is_ssl_secure": False,
        "load_time_seconds": 0.0,
        "http_status_code": 0,
        "is_mobile_responsive": False,
        "has_whatsapp_widget": False,
        "has_click_to_call": False,
        "has_lead_form": False,
        "has_meta_description": False,
        "has_h1_heading": False,
        "has_opengraph_tags": False,
        "has_analytics": False,
        "tech_stack": ["Unknown / Inactive"],
        "seo_title": "Site Unreachable / Broken",
        "seo_description": "",
        "opportunity_score": 95,
        "leaks": [
            "🚨 Domain server error or expired hosting: Website is currently offline or unreachable.",
            "Losing 100% of organic traffic and direct brand searchers.",
            "Urgent requirement for dependable hosting migration and complete site revamp."
        ],
        "strengths": [],
        "pitch_hook": "Emergency Website Revival & Modern Fast Cloud Rebuild."
    }
