# Aurangabad Website Client Hunter & Growth Platform
> **Chhatrapati Sambhajinagar (Aurangabad), Maharashtra Edition**  
> Developed with Senior Marketer & Python Architect expertise.

An end-to-end automated client acquisition platform, real-time website diagnostic auditor, localized multi-lingual pitch generator (Marathi / English / Hinglish), CRM pipeline, and proposal calculator tailored specifically for closing ₹20,000 to ₹1,50,000+ website and web development contracts in Aurangabad.

---

## Key Features & Capabilities

1. **🎯 Local Business Radar & Aurangabad Economic Grid**:
   - Covers all major industrial and commercial hubs: **MIDC Waluj (Auto components)**, **Shendra DMIC / AURIC City (Pharma & Global exports)**, **Chikalthana MIDC**, **Samarth Nagar & Nirala Bazar (Hospitals & JEE/NEET Coaching)**, **Cannaught Place & CIDCO Town Centre (Paithani silk & Corporate)**, **Beed Bypass & Garkheda (Real Estate)**, **Kranti Chowk & Station Road (Hotels & Banquets)**.
   - Filter instantly by **"No Website" (Hot Leads)**, **"Needs Redesign / Broken"**, or active sites.
   - Live spatial map discovery via OpenStreetMap Overpass API for Sambhajinagar.

2. **🔍 Instant Website Diagnostic Auditor**:
   - Performs live technical checks on SSL/HTTPS security, Mobile Viewport responsiveness, load speed, WhatsApp lead funnel widget presence, 1-Click Call, OpenGraph WhatsApp preview, and CMS tech stack.
   - Computes an **Opportunity Score (0-100)** and extracts ready-to-pitch **Revenue Leaks**.

3. **💬 Multi-Lingual Pitch Studio & 1-Click WhatsApp Launcher**:
   - Generates hyper-personalized scripts in **मराठी (Marathi)** (high local trust for MSME owners and traders), **English (B2B / Industrial)** for MIDC export units, and **Hinglish**.
   - Includes **1-Click direct WhatsApp launch (`wa.me/+91...`)** with pre-filled pitch copy.
   - Cold Email sequences & Cold Call gatekeeper battlecards.
   - Local Objection Handlers ("JustDial is enough", "Freelancer offers ₹3,000", "Market is slow").

4. **📊 Sales Pipeline CRM (Kanban & Table)**:
   - Tracks deals across stages: `Discovered ➔ Audited ➔ Contacted ➔ Meeting Set ➔ Proposal Sent ➔ Closed Won`.
   - Dynamic stage updates, budget tags, notes, and estimated pipeline value in INR.

5. **📑 Proposal & Pricing Calculator**:
   - Aurangabad market pricing tiers:
     - **Starter Digital Launchpad**: ₹18,000 – ₹25,000
     - **Growth Business & Lead Engine**: ₹38,000 – ₹65,000
     - **Enterprise B2B & Export Catalog**: ₹75,000 – ₹1,60,000
     - **Recurring Retainers**: ₹4,500 – ₹15,000/month
   - Printable / PDF export ready proposal document.

6. **🗺️ Comprehensive Strategic Playbook**:
   - Embedded in the UI and in [AURANGABAD_PLAYBOOK.md](file:///home/sujeet/Documents/client-finder/AURANGABAD_PLAYBOOK.md).

---

## Quickstart & Usage

### 1. Run the Web Application
```bash
# Activate virtual environment and launch FastAPI server
./venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser at: **`http://127.0.0.1:8000`**

### 2. Run the CLI Tool
```bash
# View pipeline stats
./venv/bin/python hunt_cli.py stats

# List leads in Waluj MIDC or with No Website
./venv/bin/python hunt_cli.py list --zone Waluj --status missing

# Run live audit on any URL from terminal
./venv/bin/python hunt_cli.py audit https://example.com

# Generate localized Marathi/English pitch for a lead
./venv/bin/python hunt_cli.py pitch aur-lead-101
```

---

## Project Structure
```
├── app.py                   # FastAPI REST API & Web Server
├── hunter_engine.py         # Lead data store, OSM spatial query, and zone filters
├── auditor.py               # Live website diagnostic & revenue leak scanner
├── pitch_generator.py       # Multi-lingual pitch engine (Marathi, English, Hinglish)
├── hunt_cli.py              # Standalone Command-Line Interface
├── AURANGABAD_PLAYBOOK.md   # Complete Senior Marketer Strategy Playbook
├── requirements.txt         # Python dependencies
├── data/
│   └── leads.json           # Aurangabad business leads database
└── static/
    ├── index.html           # Modern Web Application UI
    ├── css/styles.css       # Design system & styling tokens
    └── js/app.js            # Client-side state, API hooks & WhatsApp launcher
```
