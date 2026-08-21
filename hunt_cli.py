#!/usr/bin/env python3
"""
Client Hunter Pro - Command Line Interface
Author: Senior Marketer & Python Architect

Usage:
  ./hunt_cli.py hunt --area "Waluj, Aurangabad" [--category healthcare] [--radius 4]
  ./hunt_cli.py list [--zone "Kothrud"] [--status missing]
  ./hunt_cli.py audit <url>
  ./hunt_cli.py pitch <lead_id>
  ./hunt_cli.py stats
"""

import sys
import json
import argparse
import hunter_engine
import auditor
import pitch_generator

def print_header(title):
    print("\n" + "=" * 75)
    print(f"  🎯 {title}")
    print("=" * 75)

def cmd_hunt(args):
    print_header(f"Live Accurate Client Hunting in: {args.area}")
    print(f"📡 Category: {args.category or 'ALL'} | Radius: {args.radius} km | Keyword: {args.keyword or 'None'}")
    print("⏳ Scanning OpenStreetMap & Geocoding Live POIs...")
    
    result = hunter_engine.hunt_clients_by_area(
        area=args.area,
        category=args.category or "all",
        radius_km=float(args.radius or 3.5),
        keyword=args.keyword or ""
    )
    
    if result.get("status") == "error":
        print(f"❌ Error: {result.get('message')}")
        return
        
    print(f"✅ Geocoded Area:  {result.get('area_display')}")
    print(f"📊 Discovered:      {result.get('total_discovered')} real businesses")
    print(f"🔴 No Website:     {result.get('no_website_count')} HOT LEADS")
    print(f"🟢 Has Website:    {result.get('has_website_count')} sites for audit")
    print("-" * 75)

    for l in result.get("leads", []):
        status_icon = "🔴 NO WEBSITE (HOT)" if l.get("website_status") == "missing" else "🟢 ACTIVE SITE"
        print(f"\n[{l['id']}] {l['name']}")
        print(f"   📍 Address:  {l.get('address')}")
        print(f"   🏭 Sector:   {l.get('category')}")
        print(f"   📞 Phone:    {l.get('phone') or 'Recon via Maps'}")
        print(f"   🌐 Website:  {l.get('website') or 'None (Missing)'} [{status_icon}]")
        print(f"   💰 Budget:   {l.get('estimated_budget_tier')} | Score: {l.get('opportunity_score')}/100")
        print(f"   🗺️ Recon:    {l.get('gmaps_url')}")

def cmd_list(args):
    print_header(f"Tracked Leads (Zone: {args.zone or 'ALL'}, Status: {args.status or 'ALL'})")
    leads = hunter_engine.filter_leads(
        zone=args.zone,
        website_status=args.status,
        search_query=args.search
    )
    if not leads:
        print("No leads matching the specified criteria.")
        return

    for l in leads:
        status_icon = "🔴 NO WEBSITE" if l.get("website_status") == "missing" else ("🟠 OUTDATED" if l.get("website_status") == "outdated" else "🟢 ACTIVE")
        print(f"\n[{l['id']}] {l['name']}")
        print(f"   📍 Zone:     {l.get('zone')}")
        print(f"   🏭 Sector:   {l.get('category')}")
        print(f"   📞 Phone:    {l.get('phone') or 'None'}")
        print(f"   🌐 Status:   {status_icon} ({l.get('website') or 'None'})")
        print(f"   💰 Budget:   {l.get('estimated_budget_tier')}")
        print(f"   ⭐ Score:    {l.get('opportunity_score')}/100 | Stage: [{l.get('pipeline_stage')}]")

def cmd_audit(args):
    print_header(f"Running Diagnostic Audit on: {args.url}")
    report = auditor.run_website_audit(args.url)
    
    print(f"🌐 Domain:            {report.get('domain')}")
    print(f"🔒 SSL Secure:        {'YES (HTTPS)' if report.get('is_ssl_secure') else 'NO (HTTP Not Secure!)'}")
    print(f"📱 Mobile Ready:      {'YES (Viewport active)' if report.get('is_mobile_responsive') else 'NO (Unresponsive/Broken)'}")
    print(f"⏱️ Load Time:         {report.get('load_time_seconds')} seconds")
    print(f"💬 WhatsApp Funnel:   {'YES' if report.get('has_whatsapp_widget') else 'NO (Missing WhatsApp Direct)'}")
    print(f"📞 1-Click Call:      {'YES' if report.get('has_click_to_call') else 'NO'}")
    print(f"🛠️ Tech Stack:        {', '.join(report.get('tech_stack', []))}")
    print(f"🏆 Opportunity Score: {report.get('opportunity_score')}/100")
    
    print("\n🚨 Identified Revenue Leaks:")
    for leak in report.get("leaks", []):
        print(f"   {leak}")
        
    print(f"\n💡 Strategic Pitch Hook: {report.get('pitch_hook')}")

def cmd_pitch(args):
    leads = hunter_engine.get_all_leads()
    target = next((l for l in leads if l["id"] == args.lead_id or args.lead_id.lower() in l["name"].lower()), None)
    if not target:
        print(f"Error: Lead '{args.lead_id}' not found.")
        return
        
    audit_res = None
    if target.get("website"):
        audit_res = auditor.run_website_audit(target["website"])
        
    pitches = pitch_generator.generate_personalized_pitches(target, audit_res)
    
    print_header(f"Outreach Assets for: {target['name']}")
    print("\n💬 [WHATSAPP - MARATHI (मराठी)]")
    print("-" * 50)
    print(pitches["whatsapp_mr"])
    
    print("\n💬 [WHATSAPP - ENGLISH]")
    print("-" * 50)
    print(pitches["whatsapp_en"])

    print("\n💬 [WHATSAPP - HINDI / HINGLISH]")
    print("-" * 50)
    print(pitches["whatsapp_hi"])
    
    if pitches.get("whatsapp_mr_url"):
        print(f"\n🚀 1-Click WhatsApp Link:\n{pitches['whatsapp_mr_url']}")

def cmd_stats(args):
    print_header("Client Hunting Pipeline Stats")
    stats = hunter_engine.get_stats()
    print(f"📊 Total Leads:          {stats['total_leads']}")
    print(f"🔴 No Website (Hot):    {stats['no_website_count']}")
    print(f"🟠 Needs Redesign:       {stats['needs_redesign_count']}")
    print(f"🟢 Active Websites:     {stats.get('active_website_count', 0)}")
    print(f"🔥 High Opportunity:    {stats['high_opportunity_count']}")
    print(f"💼 Est. Pipeline Value:  ₹{stats['estimated_pipeline_inr']:,}")
    print("\nPipeline Stages:")
    for stage, count in stats.get("stages", {}).items():
        print(f"   • {stage:15s}: {count}")

def main():
    parser = argparse.ArgumentParser(description="Client Hunter Pro CLI Engine")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Hunt command
    hunt_p = subparsers.add_parser("hunt", help="Live accurate client hunt in any area")
    hunt_p.add_argument("--area", required=True, help="Area or city name (e.g. 'Waluj, Aurangabad', 'Kothrud, Pune')")
    hunt_p.add_argument("--category", default="all", help="Industry category")
    hunt_p.add_argument("--radius", default=3.5, type=float, help="Search radius in km")
    hunt_p.add_argument("--keyword", default="", help="Optional specific keyword")

    # List command
    list_p = subparsers.add_parser("list", help="List tracked leads")
    list_p.add_argument("--zone", help="Filter by zone/area")
    list_p.add_argument("--status", help="Filter by website status (missing, outdated, good)")
    list_p.add_argument("--search", help="Keyword search")

    # Audit command
    audit_p = subparsers.add_parser("audit", help="Audit a website URL")
    audit_p.add_argument("url", help="Target URL or domain")

    # Pitch command
    pitch_p = subparsers.add_parser("pitch", help="Generate pitch scripts for a lead")
    pitch_p.add_argument("lead_id", help="Lead ID or business name")

    # Stats command
    subparsers.add_parser("stats", help="Show pipeline analytics")

    args = parser.parse_args()
    if args.command == "hunt":
        cmd_hunt(args)
    elif args.command == "list":
        cmd_list(args)
    elif args.command == "audit":
        cmd_audit(args)
    elif args.command == "pitch":
        cmd_pitch(args)
    elif args.command == "stats":
        cmd_stats(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
