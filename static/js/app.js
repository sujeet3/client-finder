/**
 * Aurangabad Website Client Hunter - Client-Side App
 * Author: Senior Marketer & Python Architect
 */

// API Base Resolution (Supports Localhost, Cloudflare Pages & Custom Remote Backend)
const DEFAULT_RENDER_BACKEND = 'https://aurangabad-client-finder-api.onrender.com';

function getApiUrl(endpoint) {
  const customApi = localStorage.getItem('aurangabad_custom_api_base');
  if (customApi && customApi.trim() !== '') {
    return customApi.replace(/\/+$/, '') + endpoint;
  }
  if (window.API_BASE_URL && window.API_BASE_URL.trim() !== '') {
    return window.API_BASE_URL.replace(/\/+$/, '') + endpoint;
  }
  // If running on Cloudflare, Workers, Pages or any remote domain, default to Render Backend
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return DEFAULT_RENDER_BACKEND + endpoint;
  }
  return endpoint;
}

// State Management
const state = {
  currentTab: 'radar',
  leads: [],
  zones: [],
  niches: [],
  stats: {},
  selectedLeadForPitch: null,
  activePitchData: null,
  auditReport: null
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  setupNavigation();
  setupFilterListeners();
  setupModalListeners();
  setupProposalBuilder();
  setupApiSettings();
  await loadMetadata();
  await refreshLeadsAndStats();
}

// Navigation & Tab Switching
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-item button');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  state.currentTab = tabId;
  
  // Update nav buttons
  document.querySelectorAll('.nav-item button').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  // Update tab views
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.remove('active');
  });
  
  const activeView = document.getElementById(`tab-${tabId}`);
  if (activeView) {
    activeView.classList.add('active');
  }

  if (tabId === 'kanban') {
    renderKanban();
  }
}

// API Server Settings (For Cloudflare Pages Deployment)
function setupApiSettings() {
  const currentBase = localStorage.getItem('aurangabad_custom_api_base') || 
    (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? DEFAULT_RENDER_BACKEND : '');
  const apiStatusEl = document.getElementById('api-backend-status');
  if (apiStatusEl) {
    apiStatusEl.textContent = currentBase ? 'Render API: Connected' : 'Local / Relative API';
  }
}

function openApiConfigModal() {
  const currentBase = localStorage.getItem('aurangabad_custom_api_base') || '';
  const val = prompt('Enter your Free Python Cloud Backend URL (e.g. https://your-app.onrender.com or leave blank for default):', currentBase);
  if (val !== null) {
    localStorage.setItem('aurangabad_custom_api_base', val.trim());
    setupApiSettings();
    showToast('⚙️ API Backend URL updated! Reloading data...');
    loadMetadata();
    refreshLeadsAndStats();
  }
}

// Fetch Metadata (Zones & Niches)
async function loadMetadata() {
  try {
    const [zonesRes, nichesRes] = await Promise.all([
      fetch(getApiUrl('/api/zones')),
      fetch(getApiUrl('/api/niches'))
    ]);
    
    const zonesData = await zonesRes.json();
    const nichesData = await nichesRes.json();
    
    state.zones = zonesData.zones || [];
    state.niches = nichesData.niches || [];
    
    populateFilterDropdowns();
  } catch (error) {
    console.error('Error loading metadata:', error);
    showToast('⚠️ Failed to connect to Backend API. Check API settings.');
  }
}

function populateFilterDropdowns() {
  const zoneSelect = document.getElementById('filter-zone');
  const nicheSelect = document.getElementById('filter-niche');
  const addLeadZoneSelect = document.getElementById('new-lead-zone');
  const addLeadNicheSelect = document.getElementById('new-lead-niche');

  if (zoneSelect) {
    zoneSelect.innerHTML = '<option value="all">All Aurangabad Zones</option>';
    state.zones.forEach(z => {
      zoneSelect.innerHTML += `<option value="${z.name}">${z.name}</option>`;
    });
  }

  if (addLeadZoneSelect) {
    addLeadZoneSelect.innerHTML = '';
    state.zones.forEach(z => {
      addLeadZoneSelect.innerHTML += `<option value="${z.name}">${z.name}</option>`;
    });
  }

  if (nicheSelect) {
    nicheSelect.innerHTML = '<option value="all">All Industry Niches</option>';
    state.niches.forEach(n => {
      nicheSelect.innerHTML += `<option value="${n.name}">${n.name}</option>`;
    });
  }

  if (addLeadNicheSelect) {
    addLeadNicheSelect.innerHTML = '';
    state.niches.forEach(n => {
      addLeadNicheSelect.innerHTML += `<option value="${n.name}">${n.name}</option>`;
    });
  }
}

// Fetch Leads & Dashboard Stats
async function refreshLeadsAndStats() {
  try {
    const [leadsRes, statsRes] = await Promise.all([
      fetch(getApiUrl('/api/leads')),
      fetch(getApiUrl('/api/stats'))
    ]);

    const leadsData = await leadsRes.json();
    const statsData = await statsRes.json();

    state.leads = leadsData.leads || [];
    state.stats = statsData || {};

    updateStatsBar();
    applyLeadFilters();
    if (state.currentTab === 'kanban') {
      renderKanban();
    }
  } catch (error) {
    console.error('Error fetching leads:', error);
    showToast('⚠️ Error connecting to backend lead pipeline');
  }
}

function updateStatsBar() {
  const s = state.stats;
  document.getElementById('stat-total-leads').textContent = s.total_leads || state.leads.length;
  document.getElementById('stat-missing-sites').textContent = s.no_website_count || 0;
  document.getElementById('stat-outdated-sites').textContent = s.needs_redesign_count || 0;
  
  const val = s.estimated_pipeline_inr || 0;
  document.getElementById('stat-pipeline-val').textContent = `₹${(val / 100000).toFixed(2)} Lakh`;
}

// Filtering & Search
function setupFilterListeners() {
  const zone = document.getElementById('filter-zone');
  const niche = document.getElementById('filter-niche');
  const status = document.getElementById('filter-status');
  const search = document.getElementById('filter-search');

  [zone, niche, status].forEach(el => {
    if (el) el.addEventListener('change', applyLeadFilters);
  });

  if (search) {
    search.addEventListener('input', debounce(applyLeadFilters, 250));
  }
}

function applyLeadFilters() {
  const zoneVal = document.getElementById('filter-zone')?.value || 'all';
  const nicheVal = document.getElementById('filter-niche')?.value || 'all';
  const statusVal = document.getElementById('filter-status')?.value || 'all';
  const query = document.getElementById('filter-search')?.value.toLowerCase().trim() || '';

  const filtered = state.leads.filter(lead => {
    if (zoneVal !== 'all' && !lead.zone.includes(zoneVal)) return false;
    if (nicheVal !== 'all' && !lead.category.includes(nicheVal)) return false;
    if (statusVal !== 'all' && lead.website_status !== statusVal) return false;
    if (query) {
      const match = (
        lead.name.toLowerCase().includes(query) ||
        lead.zone.toLowerCase().includes(query) ||
        lead.category.toLowerCase().includes(query) ||
        (lead.address && lead.address.toLowerCase().includes(query)) ||
        (lead.phone && lead.phone.includes(query))
      );
      if (!match) return false;
    }
    return true;
  });

  renderLeadsGrid(filtered);
}

// Render Leads Grid
function renderLeadsGrid(leads) {
  const container = document.getElementById('leads-grid-container');
  if (!container) return;

  if (leads.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: var(--bg-card); border-radius: var(--radius-md);">
        <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 12px;">No businesses matching your search criteria in Aurangabad.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = leads.map(lead => {
    const isMissing = lead.website_status === 'missing' || !lead.website;
    const isOutdated = lead.website_status === 'outdated' || lead.website_status === 'unsecured';
    
    let statusBadge = `<span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">🟢 Active Site</span>`;
    if (isMissing) {
      statusBadge = `<span class="badge-tag" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.3);">🔴 No Website (Hot Lead)</span>`;
    } else if (isOutdated) {
      statusBadge = `<span class="badge-tag" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);">🟠 Needs Redesign / Broken</span>`;
    }

    const scoreClass = lead.opportunity_score >= 90 ? 'high' : (lead.opportunity_score >= 70 ? 'medium' : 'low');

    return `
      <div class="lead-card" id="card-${lead.id}">
        <div>
          <div class="lead-card-header">
            <h3 class="lead-name">${escapeHtml(lead.name)}</h3>
            <span class="opportunity-badge ${scoreClass}">${lead.opportunity_score}% Opp</span>
          </div>

          <div class="lead-meta">
            <div class="meta-row">
              <span class="meta-icon">📍</span>
              <span><strong>${escapeHtml(lead.zone)}</strong></span>
            </div>
            <div class="meta-row">
              <span class="meta-icon">🏭</span>
              <span>${escapeHtml(lead.category)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-icon">🌐</span>
              <span>${statusBadge}</span>
            </div>
            <div class="meta-row">
              <span class="meta-icon">💰</span>
              <span style="color: #93c5fd; font-weight: 600;">${escapeHtml(lead.estimated_budget_tier || 'Growth')}</span>
            </div>
          </div>

          <div class="lead-audit-box">
            <p>${escapeHtml(lead.audit_summary || 'Business identified in Aurangabad economic cluster.')}</p>
            <div class="lead-pitch-angle">🎯 Pitch Angle: ${escapeHtml(lead.pitch_angle || 'Local SEO & WhatsApp Funnel')}</div>
          </div>
        </div>

        <div class="lead-card-footer">
          <div class="stage-select-wrapper">
            <span class="stage-label">Stage:</span>
            <select class="form-select" style="padding: 4px 8px; font-size: 12px; width: auto;" onchange="updateLeadStage('${lead.id}', this.value)">
              <option value="Discovered" ${lead.pipeline_stage === 'Discovered' ? 'selected' : ''}>Discovered</option>
              <option value="Audited" ${lead.pipeline_stage === 'Audited' ? 'selected' : ''}>Audited</option>
              <option value="Contacted" ${lead.pipeline_stage === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Meeting Set" ${lead.pipeline_stage === 'Meeting Set' ? 'selected' : ''}>Meeting Set</option>
              <option value="Proposal Sent" ${lead.pipeline_stage === 'Proposal Sent' ? 'selected' : ''}>Proposal Sent</option>
              <option value="Closed Won" ${lead.pipeline_stage === 'Closed Won' ? 'selected' : ''}>🎉 Closed Won</option>
              <option value="Lost" ${lead.pipeline_stage === 'Lost' ? 'selected' : ''}>Lost</option>
            </select>
          </div>

          <div class="lead-actions">
            <button class="btn btn-whatsapp btn-sm" onclick="openPitchStudio('${lead.id}')">
              💬 1-Click WhatsApp Pitch
            </button>
            ${lead.website ? `
              <button class="btn btn-secondary btn-sm" onclick="auditUrlFromLead('${lead.website}')">
                🔍 Audit Site
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm" onclick="prepareProposal('${lead.id}')">
                📑 Quote Proposal
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters() {
  document.getElementById('filter-zone').value = 'all';
  document.getElementById('filter-niche').value = 'all';
  document.getElementById('filter-status').value = 'all';
  document.getElementById('filter-search').value = '';
  applyLeadFilters();
}

// Stage Update
async function updateLeadStage(leadId, newStage) {
  try {
    const res = await fetch(getApiUrl(`/api/leads/${leadId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipeline_stage: newStage })
    });
    
    if (res.ok) {
      showToast(`✅ Updated lead stage to "${newStage}"`);
      await refreshLeadsAndStats();
    }
  } catch (error) {
    showToast('⚠️ Failed to update stage');
  }
}

// Kanban CRM Render
function renderKanban() {
  const stages = ['Discovered', 'Audited', 'Contacted', 'Meeting Set', 'Proposal Sent', 'Closed Won'];
  const board = document.getElementById('kanban-board-container');
  if (!board) return;

  board.innerHTML = stages.map(stage => {
    const stageLeads = state.leads.filter(l => (l.pipeline_stage || 'Discovered') === stage);
    
    return `
      <div class="kanban-column">
        <div class="kanban-column-header">
          <span class="kanban-column-title">${stage}</span>
          <span class="kanban-count">${stageLeads.length}</span>
        </div>
        <div class="kanban-cards">
          ${stageLeads.length === 0 ? `<div style="text-align: center; color: var(--text-dim); font-size: 12px; padding: 20px 0;">No leads</div>` : ''}
          ${stageLeads.map(l => `
            <div class="kanban-card" onclick="openPitchStudio('${l.id}')">
              <div class="kanban-card-title">${escapeHtml(l.name)}</div>
              <div class="kanban-card-meta">
                <span>📍 ${escapeHtml(l.zone.split('(')[0].trim())}</span>
                <span class="kanban-card-budget">${escapeHtml(l.estimated_budget_tier ? l.estimated_budget_tier.split(' ')[0] : 'Growth')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <span style="color: #34d399; font-weight: 600;">⭐ ${l.opportunity_score}%</span>
                <span style="color: var(--text-dim);">${l.phone || 'No phone'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Pitch Studio & Modal
async function openPitchStudio(leadId) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;

  state.selectedLeadForPitch = lead;
  document.getElementById('pitch-modal-lead-name').textContent = lead.name;
  document.getElementById('pitch-modal-lead-zone').textContent = `${lead.zone} • ${lead.category}`;
  
  // Show loading state in modal
  document.getElementById('pitch-script-content').textContent = 'Generating hyper-personalized localized pitch scripts...';
  document.getElementById('pitch-modal').classList.add('active');

  try {
    const res = await fetch(getApiUrl('/api/generate-pitch'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead: lead })
    });
    
    const pitchData = await res.json();
    state.activePitchData = pitchData;
    
    // Default to Marathi tab
    setScriptTab('whatsapp_mr');
  } catch (e) {
    showToast('⚠️ Error generating pitch');
  }
}

function setScriptTab(type) {
  if (!state.activePitchData) return;

  document.querySelectorAll('#pitch-modal .sub-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-script-type') === type);
  });

  const contentEl = document.getElementById('pitch-script-content');
  const actionBtn = document.getElementById('pitch-direct-whatsapp-btn');
  const copyBtn = document.getElementById('pitch-copy-script-btn');

  let text = '';
  let waUrl = '';

  if (type === 'whatsapp_mr') {
    text = state.activePitchData.whatsapp_mr;
    waUrl = state.activePitchData.whatsapp_mr_url;
    actionBtn.style.display = 'inline-flex';
    actionBtn.textContent = '🚀 Open WhatsApp (Marathi)';
    actionBtn.onclick = () => window.open(waUrl, '_blank');
  } else if (type === 'whatsapp_en') {
    text = state.activePitchData.whatsapp_en;
    waUrl = state.activePitchData.whatsapp_en_url;
    actionBtn.style.display = 'inline-flex';
    actionBtn.textContent = '🚀 Open WhatsApp (English)';
    actionBtn.onclick = () => window.open(waUrl, '_blank');
  } else if (type === 'whatsapp_hi') {
    text = state.activePitchData.whatsapp_hi;
    waUrl = state.activePitchData.whatsapp_hi_url;
    actionBtn.style.display = 'inline-flex';
    actionBtn.textContent = '🚀 Open WhatsApp (Hinglish)';
    actionBtn.onclick = () => window.open(waUrl, '_blank');
  } else if (type === 'email') {
    text = `Subject: ${state.activePitchData.email_subject}\n\n${state.activePitchData.email_body}`;
    actionBtn.style.display = 'inline-flex';
    actionBtn.textContent = '✉️ Open Email Client';
    actionBtn.onclick = () => {
      window.location.href = `mailto:${state.selectedLeadForPitch.email || ''}?subject=${encodeURIComponent(state.activePitchData.email_subject)}&body=${encodeURIComponent(state.activePitchData.email_body)}`;
    };
  } else if (type === 'objections') {
    text = state.activePitchData.objection_handlers.map(o => `❓ OBJECTION: "${o.objection}"\n💡 SENIOR MARKETER COUNTER:\n${o.counter}\n`).join('\n---\n\n');
    actionBtn.style.display = 'none';
  }

  contentEl.textContent = text;
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(text);
    showToast('📋 Pitch script copied to clipboard!');
  };
}

// Instant Website Auditor
async function runAuditor() {
  const urlInput = document.getElementById('auditor-url-input');
  const url = urlInput.value.trim();
  if (!url) {
    showToast('⚠️ Please enter a domain or URL to audit');
    return;
  }

  const btn = document.getElementById('btn-run-audit');
  btn.disabled = true;
  btn.textContent = '⚡ Scanning & Diagnosing...';

  try {
    const res = await fetch(getApiUrl('/api/audit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });

    const data = await res.json();
    state.auditReport = data;
    renderAuditResults(data);
  } catch (error) {
    showToast('⚠️ Error running website audit');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Run Live Audit';
  }
}

function renderAuditResults(data) {
  const container = document.getElementById('audit-results-container');
  container.style.display = 'block';

  document.getElementById('audit-display-score').textContent = data.opportunity_score;
  document.getElementById('audit-display-hook').textContent = data.pitch_hook;
  document.getElementById('audit-display-domain').textContent = data.domain || data.url;

  // Grid details
  const sslEl = document.getElementById('audit-ssl-status');
  sslEl.textContent = data.is_ssl_secure ? 'Secure (HTTPS)' : 'NOT SECURE (HTTP Warning)';
  sslEl.style.color = data.is_ssl_secure ? '#34d399' : '#f87171';

  const mobileEl = document.getElementById('audit-mobile-status');
  mobileEl.textContent = data.is_mobile_responsive ? 'Mobile Viewport Ready' : 'BROKEN / Not Mobile Responsive';
  mobileEl.style.color = data.is_mobile_responsive ? '#34d399' : '#f87171';

  const speedEl = document.getElementById('audit-speed-status');
  speedEl.textContent = `${data.load_time_seconds}s (${data.load_time_seconds < 2.5 ? 'Fast' : 'Slow - Needs Optimization'})`;

  const waEl = document.getElementById('audit-wa-status');
  waEl.textContent = data.has_whatsapp_widget ? 'Active WhatsApp Widget' : 'MISSING (Leaking Inquiries)';
  waEl.style.color = data.has_whatsapp_widget ? '#34d399' : '#f87171';

  const techEl = document.getElementById('audit-tech-status');
  techEl.textContent = (data.tech_stack || []).join(', ') || 'Custom Web';

  // Leaks list
  const leaksList = document.getElementById('audit-leaks-list');
  leaksList.innerHTML = (data.leaks || []).map(l => `<li>${escapeHtml(l)}</li>`).join('');

  // Scroll to results
  container.scrollIntoView({ behavior: 'smooth' });
}

function auditUrlFromLead(url) {
  switchTab('auditor');
  document.getElementById('auditor-url-input').value = url;
  runAuditor();
}

// Live OSM Hunt
async function runOsmDiscovery() {
  const btn = document.getElementById('btn-osm-hunt');
  btn.disabled = true;
  btn.textContent = '🛰️ Querying Sambhajinagar Map Grid...';

  try {
    const res = await fetch(getApiUrl('/api/hunt-osm'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: 'industrial' })
    });
    const data = await res.json();
    showToast(`🎯 Discovered ${data.discovered_count} locations (${data.newly_added_count} new leads added!)`);
    await refreshLeadsAndStats();
  } catch (error) {
    showToast('⚠️ Map query failed or rate limited');
  } finally {
    btn.disabled = false;
    btn.textContent = '🛰️ Live OSM Discovery (Sambhajinagar)';
  }
}

// Proposal Builder Setup
function setupProposalBuilder() {
  const packageSelect = document.getElementById('prop-package-select');
  if (packageSelect) {
    packageSelect.addEventListener('change', updateProposalPreview);
  }

  const clientNameInput = document.getElementById('prop-client-name');
  if (clientNameInput) {
    clientNameInput.addEventListener('input', updateProposalPreview);
  }
}

function prepareProposal(leadId) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;

  switchTab('proposal');
  document.getElementById('prop-client-name').value = lead.name;
  document.getElementById('prop-client-zone').value = lead.zone;
  
  if (lead.category.includes('Manufacturing') || lead.category.includes('Pharma')) {
    document.getElementById('prop-package-select').value = 'enterprise';
  } else if (lead.website_status === 'missing') {
    document.getElementById('prop-package-select').value = 'growth';
  } else {
    document.getElementById('prop-package-select').value = 'starter';
  }

  updateProposalPreview();
}

function updateProposalPreview() {
  const name = document.getElementById('prop-client-name').value || 'Marathwada Business Enterprises';
  const zone = document.getElementById('prop-client-zone').value || 'Chhatrapati Sambhajinagar';
  const pkg = document.getElementById('prop-package-select').value;
  
  let title = 'Professional Business & Lead Engine Package';
  let price = '₹45,000';
  let timeline = '10 - 14 Business Days';
  let deliverables = [
    'Ultra-fast Next.js / Cloudflare hosted website architecture (< 1.5s load time)',
    '1-Click Instant WhatsApp chat & inquiry capture funnels',
    'Full Mobile Viewport responsiveness & Touch UX optimization',
    'Google Business Profile (Maps) rank optimization for Sambhajinagar keywords',
    'Interactive Lead Magnet (Quote calculator or Service Inquiry forms)',
    '1 Year High-Speed Cloud SSD Hosting & SSL Certificate included'
  ];

  if (pkg === 'starter') {
    title = 'Starter Digital Launchpad';
    price = '₹22,000';
    timeline = '5 - 7 Business Days';
    deliverables = [
      '5-Page High-Performance Mobile-Ready Website',
      'Direct WhatsApp and 1-Click Phone Call button',
      'Google Maps listing integration and basic Local SEO',
      'Contact form connected to Owner email & WhatsApp alerts',
      '1 Year High-Speed Cloud Hosting & SSL'
    ];
  } else if (pkg === 'enterprise') {
    title = 'Enterprise B2B & Industrial Export Catalog Engine';
    price = '₹95,000';
    timeline = '20 - 25 Business Days';
    deliverables = [
      'Custom B2B Digital Portal with full Product Specification sheets (PDFs)',
      'Direct RFQ (Request for Quote) engine with custom parameter fields',
      'ISO/IATF 16949 Credential & Infrastructure showcase gallery',
      'Multi-currency / International Buyer inquiries integration',
      'Advanced On-Page SEO targeting OEM buyers in Pune, Mumbai, Gujarat & Global',
      'High-Availability Cloud Server setup with daily automated backups'
    ];
  }

  document.getElementById('preview-client-name').textContent = name;
  document.getElementById('preview-client-zone').textContent = zone;
  document.getElementById('preview-pkg-title').textContent = title;
  document.getElementById('preview-pkg-price').textContent = price;
  document.getElementById('preview-pkg-timeline').textContent = timeline;

  const delList = document.getElementById('preview-pkg-deliverables');
  delList.innerHTML = deliverables.map(d => `<li style="margin-bottom: 6px;">✓ ${d}</li>`).join('');
}

// Modal Handlers
function setupModalListeners() {
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      }
    });
  });

  const addLeadForm = document.getElementById('add-lead-form');
  if (addLeadForm) {
    addLeadForm.addEventListener('submit', handleAddLeadSubmit);
  }
}

function openAddLeadModal() {
  document.getElementById('add-lead-modal').classList.add('active');
}

async function handleAddLeadSubmit(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('new-lead-name').value,
    category: document.getElementById('new-lead-niche').value,
    zone: document.getElementById('new-lead-zone').value,
    phone: document.getElementById('new-lead-phone').value,
    email: document.getElementById('new-lead-email').value,
    website: document.getElementById('new-lead-website').value,
    website_status: document.getElementById('new-lead-status').value,
    estimated_budget_tier: document.getElementById('new-lead-budget').value,
    notes: document.getElementById('new-lead-notes').value
  };

  try {
    const res = await fetch(getApiUrl('/api/leads'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('🎉 New Aurangabad Lead added successfully!');
      document.getElementById('add-lead-modal').classList.remove('active');
      addLeadForm.reset();
      await refreshLeadsAndStats();
    }
  } catch (error) {
    showToast('⚠️ Failed to add lead');
  }
}

// Export CSV
function exportLeadsCsv() {
  window.location.href = getApiUrl('/api/export-csv');
}

// Utility: Toast
function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Utility: Debounce & Escape
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
