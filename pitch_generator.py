"""
Universal Multi-Lingual Outreach & Pitch Studio
Author: Senior Marketer & Python Architect

Generates hyper-personalized outreach assets adapted to ANY city, area, or sector:
- WhatsApp Pitch Templates in English, Marathi (मराठी), and Hindi/Hinglish
- 1-Click Direct WhatsApp wa.me Launchers
- Cold Email Sequence (Subject line + Body + Follow-up)
- Cold Calling Gatekeeper Battlecards
- Objection Handling Battlecards (JustDial/IndiaMART vs Custom Site, Cheap ₹3k Freelancers, Budget)
"""

import urllib.parse
from typing import Dict, Any, List

def _extract_city(zone: str, address: str) -> str:
    combined = f"{zone} {address}".lower()
    if "pune" in combined:
        return "Pune"
    elif "mumbai" in combined:
        return "Mumbai"
    elif "bangalore" in combined or "bengaluru" in combined:
        return "Bangalore"
    elif "delhi" in combined or "noida" in combined or "gurgaon" in combined:
        return "Delhi NCR"
    elif "aurangabad" in combined or "sambhajinagar" in combined:
        return "Chhatrapati Sambhajinagar"
    elif "nashik" in combined:
        return "Nashik"
    elif "nagpur" in combined:
        return "Nagpur"
    elif "hyderabad" in combined:
        return "Hyderabad"
    elif "ahmedabad" in combined:
        return "Ahmedabad"
    elif "kolkata" in combined:
        return "Kolkata"
    elif "chennai" in combined:
        return "Chennai"
    
    # Fallback to the first part of zone
    if zone and zone.strip():
        return zone.split(",")[0].strip()
    return "your area"

def generate_personalized_pitches(lead: Dict[str, Any], audit: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generates all multi-channel outreach assets based on lead data and audit findings.
    """
    name = lead.get("name", "Business Owner").strip()
    zone = lead.get("zone", "").strip() or "local market"
    category = lead.get("category", "Business")
    website = lead.get("website", "").strip()
    has_site = bool(website and lead.get("website_status") != "missing")
    phone = lead.get("phone", "").replace(" ", "").replace("-", "")
    address = lead.get("address", "")
    city = _extract_city(zone, address)

    # Format phone for WhatsApp wa.me link
    clean_phone = phone.replace("+", "")
    if clean_phone.startswith("91") and len(clean_phone) == 12:
        wa_phone = clean_phone
    elif len(clean_phone) == 10 and clean_phone.isdigit():
        wa_phone = "91" + clean_phone
    else:
        wa_phone = clean_phone

    # Identify top 2 leaks to mention
    leaks_text_en = ""
    leaks_text_mr = ""
    leaks_text_hi = ""
    
    if audit and audit.get("leaks"):
        top_leaks = audit["leaks"][:2]
        leaks_text_en = "\n".join([f"• {l.split(':', 1)[-1].strip() if ':' in l else l}" for l in top_leaks])
        leaks_text_mr = "\n".join([f"• {l}" for l in top_leaks])
        leaks_text_hi = leaks_text_en
    elif not has_site:
        leaks_text_en = f"• No official website linked on Google Business Profile (losing 45%+ organic searches in {city})\n• Prospective clients discover competing vendors with active online catalogs"
        leaks_text_mr = f"• Google वर शोधणाऱ्या ग्राहकांना {city} मध्ये थेट वेबसाईट न दिसल्यामुळे स्पर्धकांकडे जाण्याची शक्यता\n• डिजिटल कॅटलॉग नसल्यामुळे नवीन B2B/स्थानिक ग्राहकांचा विश्वास मिळवणे कठीण"
        leaks_text_hi = f"• Google search par {city} ke customers ko official website nahi milti (leads competitor ke paas jaa rahi hain)\n• Direct mobile inquiry aur WhatsApp catalogue funnel missing hai"
    else:
        leaks_text_en = f"• Mobile responsiveness & page load speed optimizations needed for {website}\n• Missing 1-click WhatsApp inquiry funnel & direct call lead capture"
        leaks_text_mr = "• मोबाईलवर वेबसाईट उघडण्यास वेळ लागतो\n• थेट व्हॉट्सॲप इन्क्वायरी व 1-क्लिक कॉल बटन नसल्याने ग्राहक संपर्क सोडतात"
        leaks_text_hi = f"• Mobile par site ({website}) slow load hoti hai\n• 1-Click WhatsApp booking aur Google Maps ranking optimization missing hai"

    # 1. WhatsApp Script - English (B2B / Industrial / Corporate)
    if not has_site:
        wa_en = (
            f"Namaskar Sir,\n\n"
            f"I was researching established businesses in *{zone}* and noticed *{name}* has a stellar reputation, but currently lacks an official modern website.\n\n"
            f"In {city}, over 70% of high-intent clients search Google before purchasing. Without a dedicated portal, valuable inquiries often redirect to competing vendors.\n\n"
            f"We build ultra-fast, high-converting websites equipped with direct WhatsApp lead funnels and Google Maps SEO rank boosting.\n\n"
            f"Would you be open to a quick 5-minute preview of a custom demo mockup we designed for {name}?\n\n"
            f"Best regards,\nDigital Growth & Web Solutions | {city}"
        )
    else:
        wa_en = (
            f"Namaskar Sir,\n\n"
            f"I was reviewing *{name}*'s online presence ({website}) and noticed 2 critical conversion bottlenecks:\n\n"
            f"{leaks_text_en}\n\n"
            f"Fixing these can double your direct phone & WhatsApp inquiries from customers searching across {city}.\n\n"
            f"I've prepared a brief 2-minute diagnostic breakdown with recommendations. Should I share the link here?\n\n"
            f"Best regards,\nDigital Growth & Web Solutions | {city}"
        )

    # 2. WhatsApp Script - Marathi (मराठी - High Local Trust)
    if not has_site:
        wa_mr = (
            f"सस्नेह नमस्कार सर,\n\n"
            f"मी {city} मधील अग्रगण्य व्यवसाय प्रोफाइल पाहत होतो. *{name}* ({zone}) चे नाव आणि कामाचा दर्जा खूप उत्तम आहे, परंतु आपल्या व्यवसायाची कोणतीही अधिकृत वेबसाईट गुगलवर उपलब्ध नाही.\n\n"
            f"आजकाल ग्राहक आणि B2B खरेदीदार थेट गुगलवर शोधतात. अधिकृत वेबसाईट नसल्यामुळे अनेक संभाव्य ऑर्डर्स इतर प्रतिस्पर्ध्यांकडे वळतात.\n\n"
            f"आम्ही *{name}* साठी एक जलद, मोबाईल-फ्रेंडली आणि थेट व्हॉट्सॲपवर ग्राहक आणणारी वेबसाईट तयार करू शकतो.\n\n"
            f"आपल्यासाठी तयार केलेला एक नमुना (Demo Mockup) पाहण्यासाठी आज किंवा उद्या ५ मिनिटे वेळ मिळू शकेल का?\n\n"
            f"धन्यवाद,\nवेब व डिजिटल सोल्युशन्स टीम | {city}"
        )
    else:
        wa_mr = (
            f"सस्नेह नमस्कार सर,\n\n"
            f"मी *{name}* ची वेबसाईट ({website}) तपासत होतो. {city} मधील ग्राहकांसाठी ही साईट अधिक प्रभावी करण्यासाठी काही महत्त्वाच्या सुधारणा आवश्यक आहेत:\n\n"
            f"{leaks_text_mr}\n\n"
            f"मोबाईलवर साईट जलद उघडणे आणि थेट १-क्लिक व्हॉट्सॲप बटन जोडल्यास दररोज येणाऱ्या चौकशी (Inquiries) मध्ये दुप्पट वाढ होऊ शकते.\n\n"
            f"याबद्दल एक लहान २ मिनिटांचा मोफत ऑडिट रिपोर्ट मी आपल्याला पाठवू का?\n\n"
            f"धन्यवाद,\nवेब व डिजिटल सोल्युशन्स टीम | {city}"
        )

    # 3. WhatsApp Script - Hindi / Hinglish (Direct & Engaging)
    if not has_site:
        wa_hi = (
            f"Namaskar Sir!\n\n"
            f"{city} me *{name}* ({zone}) ka market reputation kaafi strong hai. Lekin check karne par pata chala ki aapki koi official modern website Google par listed nahi hai.\n\n"
            f"Aaj kal 70%+ high-paying customers pehle Google par verify karte hain. Website na hone se kaafi direct leads miss ho jaati hain.\n\n"
            f"Humne *{name}* ke liye ek custom mobile layout aur direct WhatsApp lead funnel ka concept design kiya hai.\n\n"
            f"Kya mai aapko WhatsApp par ek short 2-minute demo link share kar sakta hu?\n\n"
            f"Best Regards,\nWeb Growth Team | {city}"
        )
    else:
        wa_hi = (
            f"Namaskar Sir!\n\n"
            f"{city} me *{name}* ({zone}) ki website ({website}) check ki aur 2 critical improvement points mile:\n\n"
            f"{leaks_text_hi}\n\n"
            f"Inhe fix karke aapke direct WhatsApp inquiries aur daily customer calls 2x tak badh sakte hain.\n\n"
            f"Kya mai aapko iska ek free audit report WhatsApp par share karu?\n\n"
            f"Regards,\nWeb Growth Team | {city}"
        )

    # 4. Cold Email Sequence
    email_subject = f"Quick inquiry regarding {name}'s digital presence in {city}"
    email_body = (
        f"Hi {name} Leadership Team,\n\n"
        f"While researching leading organizations in {zone}, I came across {name}.\n\n"
        f"Your reputation is commendable, but your digital acquisition funnel has an immediate high-ROI revenue opportunity:\n\n"
        f"{leaks_text_en}\n\n"
        f"We specialize in engineering ultra-fast websites, localized SEO, and high-converting WhatsApp lead funnels for businesses in {city}.\n\n"
        f"Our clients typically experience a 40% - 120% surge in inbound customer inquiries within 60 days of launch.\n\n"
        f"Would you be open to a brief 10-minute discovery call this Thursday at 3:30 PM to review our custom recommendations for {name}?\n\n"
        f"Best regards,\n"
        f"Senior Solutions Architect\n"
        f"Web & Digital Growth Studio | {city}"
    )

    # 5. Cold Call / Receptionist Gatekeeper Battlecard
    phone_script = {
        "gatekeeper": (
            f"\"Namaskar! Mala Sir / Managing Director sobat bolaycha ahe regarding {name}'s customer inquiries and Google Business profile in {city}. "
            f"Aamhi {city} madhe businesses sathi automated lead systems setup karto. Sir available ahet ka?\""
        ),
        "owner_hook": (
            f"\"Namaskar Sir, mi 2 min vel gheu shakto ka? Mi notice kela ki {city} madhe {name} la Google var khoop lok shodhtat, "
            f"pan competitor businesses inquiries capture karat ahet. Aamhi tumchya sathi ek modern high-speed lead website setup keli tar daily direct WhatsApp orders start hotil. "
            f"Aaplyala ek 5-min demo dakhavnyasathi kadhi anukool vel ahe?\""
        )
    }

    # 6. Objection Handling Guide
    objection_handlers = [
        {
            "objection": "Aamhi JustDial / IndiaMART var ahot, website chi kay garaj?",
            "counter": (
                "JustDial aani IndiaMART var ek inquiry aali ki ti ekach veli 8-10 competitors la send keli jaate. "
                "Tyat price war suru hoto. Tumchi swatahchi website aslyas 100% inquiry fakt tumhalach milte aani tumche profit margin surakshit rahte."
            )
        },
        {
            "objection": "Ek local freelancer ₹3,000 - ₹5,000 madhe website detoy.",
            "counter": (
                "₹3,000 madhe fakt eka copy-paste page cha template milto jo Google var rank hot nahi aani mobile var slow asto. "
                "Aamhi fakt website banvat nahi tar Google ranking, WhatsApp automated lead funnel aani secure hosting deto jyani business madhe real ROI generate hoto."
            )
        },
        {
            "objection": "Aata requirement nahi ahe / Market slow ahe.",
            "counter": (
                "Market slow astana jya businesses cha online presence strong asto, te sarva available inquiries capture kartat. "
                "Aata setup kelyas peak season madhe tumhi market leader asal."
            )
        }
    ]

    # Generate wa.me links
    wa_en_url = f"https://wa.me/{wa_phone}?text={urllib.parse.quote(wa_en)}" if wa_phone else ""
    wa_mr_url = f"https://wa.me/{wa_phone}?text={urllib.parse.quote(wa_mr)}" if wa_phone else ""
    wa_hi_url = f"https://wa.me/{wa_phone}?text={urllib.parse.quote(wa_hi)}" if wa_phone else ""

    return {
        "lead_id": lead.get("id"),
        "lead_name": name,
        "whatsapp_phone": wa_phone,
        "whatsapp_en": wa_en,
        "whatsapp_mr": wa_mr,
        "whatsapp_hi": wa_hi,
        "whatsapp_en_url": wa_en_url,
        "whatsapp_mr_url": wa_mr_url,
        "whatsapp_hi_url": wa_hi_url,
        "email_subject": email_subject,
        "email_body": email_body,
        "phone_script": phone_script,
        "objection_handlers": objection_handlers
    }
