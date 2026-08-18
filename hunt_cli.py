#!/usr/bin/env python3
"""
Aurangabad Website Client Hunter - Command Line Interface
Author: Senior Marketer & Python Architect

Usage:
  ./hunt_cli.py list [--zone WALUJ] [--status missing]
  ./hunt_cli.py audit <url>
  ./hunt_cli.py pitch <lead_id>
  ./hunt_cli.py hunt-live [--keyword auto]
  ./hunt_cli.py stats
"""

import sys
import json
import argparse
import hunter_engine
import auditor
import pitch_generator

def print_header(title):
    print("\n" + "=" * 70)
    print(f"  🎯 {title}")
    print("=" * 70)

def cmd_list(args):
    print_header(f"Aurangabad Leads (Zone: {args.zone or 'ALL'}, Status: {args.status or 'ALL'})")
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
        print(f"   📍 Zone:     {l['zone']}")
        print(f"   🏭 Sector:   {l['category']}")
        print(f"   📞 Phone:    {l['phone']}")
        print(f"   🌐 Status:   {status_icon} ({l.get('website') or 'None'})")
        print(f"   💰 Budget:   {l.get('estimated_budget_tier')}")
        print(f"   ⭐ Score:    {l.get('opportunity_score')}/100 | Stage: [{l.get('pipeline_stage')}]")
        print(f"   💡 Pitch:    {l.get('pitch_angle')}")

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
    
    print("\n💬 [WHATSAPP - ENGLISH (B2B/INDUSTRIAL)]")
    print("-" * 50)
    print(pitches["whatsapp_en"])
    
    if pitches.get("whatsapp_mr_url"):
        print(f"\n🚀 1-Click WhatsApp Link:\n{pitches['whatsapp_mr_url']}")

def cmd_stats(args):
    print_header("Aurangabad Client Hunting Pipeline Stats")
    stats = hunter_engine.get_stats()
    print(f"📊 Total Leads:          {stats['total_leads']}")
    print(f"🔴 No Website (Urgent): {stats['no_website_count']}")
    print(f"🟠 Needs Redesign:       {stats['needs_redesign_count']}")
    print(f"🔥 High Opportunity:    {stats['high_opportunity_count']}")
    print(f"💼 Est. Pipeline Value:  ₹{stats['estimated_pipeline_inr']:,}")
    print("\nPipeline Stages:")
    for stage, count in stats.get("stages", {}).items():
        print(f"   • {stage:15s}: {count}")

def main():
    parser = argparse.ArgumentParser(description="Aurangabad Client Hunting CLI Engine")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # List command
    list_p = subparsers.add_parser("list", help="List tracked leads")
    list_p.add_argument("--zone", help="Filter by Aurangabad zone")
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
    if args.command == "list":
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
