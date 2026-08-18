"""
Outreach Copy & Pitch Generation Engine
Author: Senior Marketer & Python Architect

Generates hyper-personalized outreach assets tailored specifically for Aurangabad (Chhatrapati Sambhajinagar) businesses:
- WhatsApp Pitch Templates in English, Marathi (मराठी), and Hinglish
- Direct Click-to-WhatsApp URL generator
- Cold Email Sequence (Subject line + Body + Follow-up)
- Cold Calling & Receptionist/Gatekeeper Script
- Objection Handling Battlecards (JustDial vs Custom Site, Cheap ₹3k Freelancers, Budget)
"""

import urllib.parse
from typing import Dict, Any, List

def generate_personalized_pitches(lead: Dict[str, Any], audit: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generates all multi-channel outreach assets based on lead data and audit findings.
    """
    name = lead.get("name", "Business Owner")
    zone = lead.get("zone", "Aurangabad")
    category = lead.get("category", "Business")
    website = lead.get("website", "")
    has_site = bool(website and lead.get("website_status") != "missing")
    phone = lead.get("phone", "").replace(" ", "").replace("-", "")

    # Format phone for WhatsApp wa.me link
    clean_phone = phone.replace("+", "")
    if clean_phone.startswith("91") and len(clean_phone) == 12:
        wa_phone = clean_phone
    elif len(clean_phone) == 10:
        wa_phone = "91" + clean_phone
    else:
        wa_phone = clean_phone

    # Identify top 2 leaks to mention
    leaks_text_en = ""
    leaks_text_mr = ""
    if audit and audit.get("leaks"):
        top_leaks = audit["leaks"][:2]
        leaks_text_en = "\n".join([f"• {l.split(':', 1)[-1].strip() if ':' in l else l}" for l in top_leaks])
        leaks_text_mr = "\n".join([f"• {l}" for l in top_leaks])
    elif not has_site:
        leaks_text_en = "• No direct website linked on Google Business Profile (losing 40%+ organic searches)\n• Prospective clients find competing firms in Pune/Aurangabad with active catalogs"
        leaks_text_mr = "• Google वर शोधणाऱ्या ग्राहकांना थेट वेबसाईट न दिसल्यामुळे स्पर्धकांकडे जाण्याची शक्यता\n• डिजिटल कॅटलॉग नसल्यामुळे नवीन B2B/लोकल ग्राहकांचा विश्वास मिळवणे कठीण"
    else:
        leaks_text_en = "• Mobile responsiveness & speed optimizations needed\n• Missing 1-click WhatsApp inquiry funnel"
        leaks_text_mr = "• मोबाईलवर वेबसाईट उघडण्यास वेळ लागतो\n• थेट व्हॉट्सॲप इन्क्वायरी बटन नसल्याने ग्राहक संपर्क सोडतात"

    # 1. WhatsApp Script - English (B2B / Industrial / Modern)
    if not has_site:
        wa_en = (
            f"Namaskar Sir,\n\n"
            f"I was reviewing top businesses in *{zone}* and noticed *{name}* has great reputation and reviews, but currently lacks an official modern website.\n\n"
            f"In Aurangabad, over 65% of high-value buyers search Google before calling. Without a dedicated portal, many inquiries redirect to competing vendors.\n\n"
            f"We build high-performance, conversion-focused websites with direct WhatsApp lead capture and Google Maps rank boosting.\n\n"
            f"Would you be open to a quick 5-minute preview of a mock design we drafted for {name}?\n\n"
            f"Best regards,\nWeb Solutions Team | Chhatrapati Sambhajinagar"
        )
    else:
        wa_en = (
            f"Namaskar Sir,\n\n"
            f"I was recently browsing *{name}* website ({website}) and noticed 2 critical conversion bottlenecks:\n\n"
            f"{leaks_text_en}\n\n"
            f"Fixing these can increase your direct phone & WhatsApp inquiries by 2x to 3x from customers searching in Aurangabad & Marathwada.\n\n"
            f"I have created a free 2-minute video breakdown of how to fix this and boost speed. Should I share the link here?\n\n"
            f"Best regards,\nWeb Solutions Team | Chhatrapati Sambhajinagar"
        )

    # 2. WhatsApp Script - Marathi (मराठी - High Trust & Local Respect)
    if not has_site:
        wa_mr = (
            f"सस्नेह नमस्कार सर,\n\n"
            f"मी औरंगाबाद/संभाजीनगरमधील व्यवसाय प्रोफाइल पाहत होतो. *{name}* ({zone}) चे काम आणि कस्टमर रिव्ह्यू खूप उत्तम आहेत, परंतु आपल्या व्यवसायाची कोणतीही अधिकृत वेबसाईट गुगलवर उपलब्ध नाही.\n\n"
            f"आजकाल स्थानिक ग्राहक आणि बाहेरचे B2B खरेदीदार थेट गुगलवर शोधतात. वेबसाईट नसल्यामुळे अनेक महत्त्वाच्या ऑर्डर्स इतर प्रतिस्पर्ध्यांकडे वळतात.\n\n"
            f"आम्ही *{name}* साठी एक फास्ट, मोबाईल-फ्रेंडली आणि थेट व्हॉट्सॲपवर इन्क्वायरी मिळवून देणारी वेबसाईट तयार करू शकतो.\n\n"
            f"आपल्यासाठी आम्ही तयार केलेला एक नमुना (Demo Mockup) पाहण्यासाठी आज किंवा उद्या 5 मिनिटे वेळ मिळू शकेल का?\n\n"
            f"धन्यवाद,\nवेब व डिजिटल सोल्युशन्स टीम, संभाजीनगर"
        )
    else:
        wa_mr = (
            f"सस्नेह नमस्कार सर,\n\n"
            f"मी *{name}* ची वेबसाईट ({website}) तपासत होतो. संभाजीनगरमधील ग्राहकांसाठी ही साईट अधिक प्रभावी करण्यासाठी काही सुधारणा करता येतील:\n\n"
            f"{leaks_text_mr}\n\n"
            f"मोबाईलवर साईट जलद उघडणे आणि थेट 1-क्लिक व्हॉट्सॲप बटन जोडल्यास रोज येणाऱ्या चौकशी (Inquiries) मध्ये दुप्पट वाढ होऊ शकते.\n\n"
            f"याबद्दल एक लहान 2 मिनिटांचा मोफत ऑडिट रिपोर्ट मी आपल्याला पाठवू का?\n\n"
            f"धन्यवाद,\nवेब व डिजिटल सोल्युशन्स टीम, संभाजीनगर"
        )

    # 3. WhatsApp Script - Hinglish (Direct & Engaging)
    wa_hi = (
        f"Namaskar Sir!\n\n"
        f"Sambhajinagar me *{name}* ({zone}) ka market presence kaafi strong hai. Lekin check kiya toh notice hua ki:\n\n"
        f"{leaks_text_en}\n\n"
        f"Aaj kal 70%+ customers pehle Google aur mobile par verify karte hain. Agar site slow ya missing ho toh leads drop ho jaati hain.\n\n"
        f"Humne {name} ke liye ek custom mobile layout & WhatsApp lead funnel ka concept design kiya hai. Kya mai aapko WhatsApp par ek short demo link send karu?\n\n"
        f"Regards,\nAurangabad Web Growth Team"
    )

    # 4. Cold Email Sequence
    email_subject = f"Quick question regarding {name}'s online inquiries in Sambhajinagar"
    email_body = (
        f"Hi {name} Team,\n\n"
        f"While researching leading companies in {zone}, I came across {name}.\n\n"
        f"Your market reputation is solid, but your digital footprint has an immediate revenue growth opportunity:\n\n"
        f"{leaks_text_en}\n\n"
        f"We specialize in building ultra-fast websites and Google search funnels for businesses in Aurangabad and the Marathwada industrial belt.\n\n"
        f"Our clients typically see a 40% - 150% increase in inbound WhatsApp inquiries within the first 60 days.\n\n"
        f"Are you free for a brief 10-minute call this Thursday at 3:00 PM to review our recommendations?\n\n"
        f"Best regards,\n"
        f"Senior Solutions Architect\n"
        f"Aurangabad, Maharashtra"
    )

    # 5. Cold Call / Phone Battlecard
    phone_script = {
        "gatekeeper": (
            "\"Namaskar! Mala Sir / Owner sobat bolaycha ahe regarding {name}'s online customer inquiries and Google profile. "
            "Aamhi local Aurangabad madhe businesses sathi digital systems setup karto. Sir available ahet ka?\""
        ),
        "owner_hook": (
            "\"Namaskar Sir, mi 2 min vel gheu shakto ka? Mi notice kela ki {zone} madhe {name} la Google var khoop lok shodhtat, "
            "pan competitor firms inquiries grab karat ahet. Aamhi tumchya sathi ek high-speed automated lead website banavli tar regular WhatsApp inquiries start hotil. "
            "Aaplyala ek 5-min demo dakhavnyasathi kadhi jamel?\""
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
            "objection": "Ek local mulga / freelancer ₹3,000 - ₹5,000 madhe website detoy.",
            "counter": (
                "₹3,000 madhe fakt eka copy-paste page cha template milto jo Google var rank hot nahi aani mobile var slow asto. "
                "Aamhi fakt website banvat nahi tar Google ranking, WhatsApp automated lead funnel aani secure hosting deto jyani business madhe real ROI generate hoto."
            )
        },
        {
            "objection": "Aata requirement nahi ahe / Market thand ahe.",
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
