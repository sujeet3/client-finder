/**
 * Universal Area Website Client Hunter - Client-Side Application
 * Author: Senior Marketer & Python Architect
 */

// API Base Resolution (Supports Localhost, Remote Backends & Static Hosting)
const DEFAULT_RENDER_BACKEND = 'https://aurangabad-client-finder-api.onrender.com';

function getApiUrl(endpoint) {
  const customApi = localStorage.getItem('aurangabad_custom_api_base');
  if (customApi && customApi.trim() !== '') {
    return customApi.replace(/\/+$/, '') + endpoint;
  }
  if (window.API_BASE_URL && window.API_BASE_URL.trim() !== '') {
    return window.API_BASE_URL.replace(/\/+$/, '') + endpoint;
  }
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
  setupAddLeadForm();
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

// API Server Settings
function setupApiSettings() {
  const currentBase = localStorage.getItem('aurangabad_custom_api_base') || 
    (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? DEFAULT_RENDER_BACKEND : '');
  const apiStatusEl = document.getElementById('api-backend-status');
  if (apiStatusEl) {
    apiStatusEl.textContent = currentBase ? 'Cloud API Connected' : 'Local Live API';
  }
}

function openApiConfigModal() {
  const currentBase = localStorage.getItem('aurangabad_custom_api_base') || '';
  const val = prompt('Enter your Cloud API Backend URL (or leave blank for default):', currentBase);
  if (val !== null) {
    localStorage.setItem('aurangabad_custom_api_base', val.trim());
    setupApiSettings();
    showToast('⚙️ API URL updated! Refreshing data...');
    loadMetadata();
    refreshLeadsAndStats();
  }
}

// Fetch Metadata
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
  }
}

function populateFilterDropdowns() {
  const zoneSelect = document.getElementById('filter-zone');
  const nicheSelect = document.getElementById('filter-niche');
  const addLeadZoneSelect = document.getElementById('new-lead-zone');
  const addLeadNicheSelect = document.getElementById('new-lead-niche');

  if (zoneSelect) {
    const currentVal = zoneSelect.value;
    zoneSelect.innerHTML = '<option value="all">All Discovered Areas</option>';
    
    // Extract unique zones from state.leads
    const leadZones = new Set();
    state.leads.forEach(l => {
      if (l.zone) leadZones.add(l.zone.trim());
    });
    
    leadZones.forEach(z => {
      zoneSelect.innerHTML += `<option value="${escapeHtml(z)}">${escapeHtml(z)}</option>`;
    });
    if (currentVal && leadZones.has(currentVal)) {
      zoneSelect.value = currentVal;
    }
  }

  if (nicheSelect) {
    nicheSelect.innerHTML = '<option value="all">All Industry Sectors</option>';
    state.niches.forEach(n => {
      nicheSelect.innerHTML += `<option value="${escapeHtml(n.name)}">${escapeHtml(n.name)}</option>`;
    });
  }

  if (addLeadNicheSelect) {
    addLeadNicheSelect.innerHTML = '';
    state.niches.forEach(n => {
      addLeadNicheSelect.innerHTML += `<option value="${escapeHtml(n.name)}">${escapeHtml(n.name)}</option>`;
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
    populateFilterDropdowns();
    applyLeadFilters();
    if (state.currentTab === 'kanban') {
      renderKanban();
    }
  } catch (error) {
    console.error('Error fetching leads:', error);
    showToast('⚠️ Error connecting to live lead pipeline');
  }
}

function updateStatsBar() {
  const s = state.stats;
  document.getElementById('stat-total-leads').textContent = s.total_leads || state.leads.length;
  document.getElementById('stat-missing-sites').textContent = s.no_website_count || 0;
  
  const activeCountEl = document.getElementById('stat-active-sites');
  if (activeCountEl) {
    activeCountEl.textContent = s.active_website_count || (state.leads.length - (s.no_website_count || 0));
  }
  
  const val = s.estimated_pipeline_inr || 0;
  document.getElementById('stat-pipeline-val').textContent = `₹${(val / 100000).toFixed(2)} Lakh`;
}

// ==========================================================================
// DYNAMIC AREA CLIENT HUNTER
// ==========================================================================

async function triggerAreaHunt() {
  const areaInput = document.getElementById('hunt-area-input');
  const categorySelect = document.getElementById('hunt-category-select');
  const radiusSelect = document.getElementById('hunt-radius-select');
  const btn = document.getElementById('btn-hunt-area');
  const banner = document.getElementById('hunt-status-banner');
  const bannerTitle = document.getElementById('hunt-status-title');
  const bannerDesc = document.getElementById('hunt-status-desc');

  const area = areaInput ? areaInput.value.trim() : '';
  if (!area) {
    showToast('⚠️ Please enter an area, city, or locality name.');
    return;
  }

  const category = categorySelect ? categorySelect.value : 'all';
  const radius = radiusSelect ? parseFloat(radiusSelect.value) : 3.5;

  // UI state: Scanning
  btn.disabled = true;
  btn.innerHTML = '<span class="hunt-status-spinner" style="width:16px;height:16px;border-width:2px;"></span> Scanning Live Grid...';
  
  if (banner) {
    banner.style.display = 'flex';
    bannerTitle.textContent = `🛰️ Geocoding and Scanning: ${area}...`;
    bannerDesc.textContent = `Querying live OpenStreetMap POIs within ${radius} km radius (checking official website tags & phone contacts)...`;
  }

  try {
    const res = await fetch(getApiUrl('/api/hunt-area'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area: area,
        category: category,
        radius_km: radius
      })
    });

    const data = await res.json();

    if (data.status === 'error') {
      showToast(`❌ ${data.message}`);
      if (banner) banner.style.display = 'none';
      return;
    }

    const discovered = data.total_discovered || 0;
    const noWeb = data.no_website_count || 0;
    const hasWeb = data.has_website_count || 0;

    showToast(`🎯 Found ${discovered} real businesses in ${area} (${noWeb} No Website - Hot Leads, ${hasWeb} Active Sites)!`);

    if (banner) {
      bannerTitle.textContent = `✅ Live Scan Complete for: ${data.area_display}`;
      bannerDesc.textContent = `Discovered ${discovered} real businesses (${noWeb} No Website hot prospects, ${hasWeb} active websites). Leads saved to CRM pipeline.`;
    }

    const indicator = document.getElementById('active-area-indicator');
    if (indicator) {
      indicator.textContent = `Target: ${area.split(',')[0]}`;
    }

    await refreshLeadsAndStats();

    // Auto-filter by this area
    const zoneSelect = document.getElementById('filter-zone');
    if (zoneSelect) {
      zoneSelect.value = area;
      applyLeadFilters();
    }
  } catch (error) {
    console.error('Hunt error:', error);
    showToast('⚠️ Area search failed or rate-limited. Please try again.');
    if (banner) banner.style.display = 'none';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="hunt-btn-icon">🚀</span><span class="hunt-btn-text">Hunt Clients in Area</span>';
  }
}

function quickHunt(areaName) {
  const input = document.getElementById('hunt-area-input');
  if (input) {
    input.value = areaName;
  }
  triggerAreaHunt();
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
    search.addEventListener('input', debounce(applyLeadFilters, 200));
  }
}

function applyLeadFilters() {
  const zoneVal = document.getElementById('filter-zone')?.value || 'all';
  const nicheVal = document.getElementById('filter-niche')?.value || 'all';
  const statusVal = document.getElementById('filter-status')?.value || 'all';
  const query = document.getElementById('filter-search')?.value.toLowerCase().trim() || '';

  const filtered = state.leads.filter(lead => {
    if (zoneVal !== 'all' && lead.zone && !lead.zone.toLowerCase().includes(zoneVal.toLowerCase())) return false;
    if (nicheVal !== 'all' && lead.category && !lead.category.toLowerCase().includes(nicheVal.toLowerCase())) return false;
    if (statusVal !== 'all') {
      const isMissing = lead.website_status === 'missing' || !lead.website;
      if (statusVal === 'missing' && !isMissing) return false;
      if (statusVal === 'good' && isMissing) return false;
    }
    if (query) {
      const match = (
        (lead.name && lead.name.toLowerCase().includes(query)) ||
        (lead.zone && lead.zone.toLowerCase().includes(query)) ||
        (lead.category && lead.category.toLowerCase().includes(query)) ||
        (lead.address && lead.address.toLowerCase().includes(query)) ||
        (lead.phone && lead.phone.includes(query)) ||
        (lead.website && lead.website.toLowerCase().includes(query))
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
  const countBadge = document.getElementById('leads-count-display');
  
  if (countBadge) {
    countBadge.textContent = `${leads.length} leads`;
  }

  if (!container) return;

  if (leads.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 12px;">No businesses found for this filter.</p>
        <p style="font-size: 13px; color: var(--text-dim); margin-bottom: 16px;">Type an area name in the Area Client Hunter bar above and hit <strong>"Hunt Clients in Area"</strong> to discover live leads.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = leads.map(lead => {
    const hasSite = Boolean(lead.website && lead.website.trim() && lead.website_status !== 'missing');
    
    let websiteDisplayHtml = '';
    if (hasSite) {
      let cleanUrl = lead.website;
      try {
        const u = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
        cleanUrl = u.hostname.replace('www.', '');
      } catch (e) {
        cleanUrl = lead.website;
      }
      websiteDisplayHtml = `
        <span class="presence-pill active">
          🟢 <a href="${escapeHtml(lead.website.startsWith('http') ? lead.website : 'https://' + lead.website)}" target="_blank" rel="noopener noreferrer" title="Visit live website">
            ${escapeHtml(cleanUrl)} ↗
          </a>
        </span>
      `;
    } else {
      websiteDisplayHtml = `<span class="presence-pill missing">🔴 No Website (Hot Lead)</span>`;
    }

    const oppScore = lead.opportunity_score || (hasSite ? 68 : 96);
    const scoreClass = oppScore >= 90 ? 'high' : (oppScore >= 70 ? 'medium' : 'low');
    
    const gmapsUrl = lead.gmaps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((lead.name || '') + ' ' + (lead.zone || ''))}`;

    return `
      <div class="lead-card" id="card-${lead.id}">
        <div>
          <div class="lead-card-header">
            <div>
              <h3 class="lead-name">${escapeHtml(lead.name)}</h3>
              <div style="margin-top: 4px;">${websiteDisplayHtml}</div>
            </div>
            <span class="opportunity-badge ${scoreClass}">🔥 ${oppScore}% Opp</span>
          </div>

          <div class="lead-meta">
            <div class="meta-row">
              <span class="meta-icon">📍</span>
              <span style="font-size: 11.5px;">${escapeHtml(lead.address || lead.zone || 'Local Area')}</span>
            </div>
            <div class="meta-row">
              <span class="meta-icon">🏭</span>
              <span><strong>${escapeHtml(lead.category || 'Business')}</strong></span>
            </div>
            <div class="meta-row">
              <span class="meta-icon">📞</span>
              <span>${lead.phone ? `<strong>${escapeHtml(lead.phone)}</strong>` : '<em style="color:var(--text-dim);">Recon via Maps</em>'}</span>
            </div>
            <div class="meta-row">
              <span class="meta-icon">💰</span>
              <span style="color: #93c5fd; font-weight: 600;">${escapeHtml(lead.estimated_budget_tier || 'Growth (₹35,000 - ₹60,000)')}</span>
            </div>
          </div>

          <div class="lead-audit-box">
            <p>${escapeHtml(lead.audit_summary || (hasSite ? `Active website: ${lead.website}. Inspect for conversion bottlenecks.` : 'CRITICAL: No official website linked! High-value prospect.'))}</p>
            <div class="lead-pitch-angle">🎯 Pitch Angle: ${escapeHtml(lead.pitch_angle || 'Mobile-first Digital Presence & WhatsApp Funnel')}</div>
          </div>
        </div>

        <div class="lead-card-footer">
          <div class="stage-select-wrapper">
            <span class="stage-label">CRM Stage:</span>
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
              💬 Pitch & WhatsApp
            </button>

            ${hasSite ? `
              <button class="btn btn-secondary btn-sm" onclick="auditUrlFromLead('${escapeHtml(lead.website)}')">
                🔍 Audit Site
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm" onclick="prepareProposal('${lead.id}')">
                📑 Proposal
              </button>
            `}

            <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="Recon on Google Maps">
              🗺️ Maps
            </a>

            <button class="btn btn-secondary btn-sm" style="color: #f87171;" onclick="deleteLead('${lead.id}')" title="Delete lead">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters() {
  const z = document.getElementById('filter-zone');
  const n = document.getElementById('filter-niche');
  const s = document.getElementById('filter-status');
  const q = document.getElementById('filter-search');
  if (z) z.value = 'all';
  if (n) n.value = 'all';
  if (s) s.value = 'all';
  if (q) q.value = '';
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

// Delete Lead
async function deleteLead(leadId) {
  if (!confirm('Are you sure you want to remove this lead?')) return;
  try {
    const res = await fetch(getApiUrl(`/api/leads/${leadId}`), {
      method: 'DELETE'
    });
    if (res.ok) {
      showToast('🗑️ Lead removed from CRM pipeline');
      await refreshLeadsAndStats();
    }
  } catch (e) {
    showToast('⚠️ Error deleting lead');
  }
}

// Kanban CRM Render
function renderKanban() {
  const stages = ['Discovered', 'Audited', 'Contacted', 'Meeting Set', 'Proposal Sent', 'Closed Won'];
  
  stages.forEach(stage => {
    const stageId = stage.toLowerCase().replace(' ', '-');
    const container = document.getElementById(`kanban-cards-${stageId}`);
    const badge = document.getElementById(`count-${stageId}`);
    
    const stageLeads = state.leads.filter(l => (l.pipeline_stage || 'Discovered') === stage);
    
    if (badge) {
      badge.textContent = stageLeads.length;
    }

    if (container) {
      if (stageLeads.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-dim); font-size: 12px; padding: 20px 0;">No leads</div>`;
      } else {
        container.innerHTML = stageLeads.map(l => `
          <div class="kanban-card" onclick="openPitchStudio('${l.id}')">
            <div class="kanban-card-title">${escapeHtml(l.name)}</div>
            <div class="kanban-card-meta">
              <span>📍 ${escapeHtml((l.zone || '').split(',')[0].trim())}</span>
              <span class="kanban-card-budget">${escapeHtml((l.estimated_budget_tier || 'Growth').split(' ')[0])}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
              <span style="color: ${l.website ? '#34d399' : '#f87171'}; font-weight: 600;">
                ${l.website ? '🟢 Has Site' : '🔴 No Site'}
              </span>
              <span style="color: var(--text-dim);">${escapeHtml(l.phone || 'Recon Needed')}</span>
            </div>
          </div>
        `).join('');
      }
    }
  });
}

// Pitch Studio & Modal
async function openPitchStudio(leadId) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;

  state.selectedLeadForPitch = lead;
  document.getElementById('pitch-modal-lead-name').textContent = lead.name;
  document.getElementById('pitch-modal-lead-zone').textContent = `${lead.zone || 'Target Area'} • ${lead.category || 'Business'}`;
  
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
    showToast('⚠️ Error generating pitch scripts');
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
    actionBtn.textContent = '🚀 Open WhatsApp (Hindi/Hinglish)';
    actionBtn.onclick = () => window.open(waUrl, '_blank');
  } else if (type === 'email') {
    text = `Subject: ${state.activePitchData.email_subject}\n\n${state.activePitchData.email_body}`;
    actionBtn.style.display = 'inline-flex';
    actionBtn.textContent = '✉️ Open Email Client';
    actionBtn.onclick = () => {
      window.location.href = `mailto:${state.selectedLeadForPitch.email || ''}?subject=${encodeURIComponent(state.activePitchData.email_subject)}&body=${encodeURIComponent(state.activePitchData.email_body)}`;
    };
  } else if (type === 'objections') {
    text = (state.activePitchData.objection_handlers || []).map(o => `❓ OBJECTION: "${o.objection}"\n💡 SENIOR MARKETER COUNTER:\n${o.counter}\n`).join('\n---\n\n');
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
  const url = urlInput ? urlInput.value.trim() : '';
  if (!url) {
    showToast('⚠️ Please enter a website URL or domain to audit');
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
  if (!container) return;
  container.style.display = 'block';

  document.getElementById('audit-display-score').textContent = data.opportunity_score;
  document.getElementById('audit-display-hook').textContent = data.pitch_hook;
  document.getElementById('audit-display-domain').textContent = data.domain || data.url;

  // Grid details
  const sslEl = document.getElementById('audit-ssl-status');
  if (sslEl) {
    sslEl.textContent = data.is_ssl_secure ? 'Secure (HTTPS)' : 'NOT SECURE (HTTP Warning)';
    sslEl.style.color = data.is_ssl_secure ? '#34d399' : '#f87171';
  }

  const mobileEl = document.getElementById('audit-mobile-status');
  if (mobileEl) {
    mobileEl.textContent = data.is_mobile_responsive ? 'Mobile Viewport Ready' : 'BROKEN / Unresponsive';
    mobileEl.style.color = data.is_mobile_responsive ? '#34d399' : '#f87171';
  }

  const speedEl = document.getElementById('audit-speed-status');
  if (speedEl) {
    speedEl.textContent = `${data.load_time_seconds}s (${data.load_time_seconds < 2.5 ? 'Fast' : 'Slow'})`;
  }

  const waEl = document.getElementById('audit-whatsapp-status');
  if (waEl) {
    waEl.textContent = data.has_whatsapp_widget ? 'Active WhatsApp Funnel' : 'MISSING (Leaking Leads)';
    waEl.style.color = data.has_whatsapp_widget ? '#34d399' : '#f87171';
  }

  const callEl = document.getElementById('audit-call-status');
  if (callEl) {
    callEl.textContent = data.has_click_to_call ? '1-Click Call Ready' : 'MISSING (No Direct Call)';
    callEl.style.color = data.has_click_to_call ? '#34d399' : '#f87171';
  }

  const ogEl = document.getElementById('audit-og-status');
  if (ogEl) {
    ogEl.textContent = data.has_opengraph_tags ? 'Rich WhatsApp Preview' : 'No Social Preview Tags';
  }

  // Leaks list
  const leaksList = document.getElementById('audit-leaks-list');
  if (leaksList) {
    leaksList.innerHTML = (data.leaks || []).map(l => `<li>${escapeHtml(l)}</li>`).join('');
  }

  // Scroll to results
  container.scrollIntoView({ behavior: 'smooth' });
}

function auditUrlFromLead(url) {
  switchTab('auditor');
  const input = document.getElementById('auditor-url-input');
  if (input) input.value = url;
  runAuditor();
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

  const clientZoneInput = document.getElementById('prop-client-zone');
  if (clientZoneInput) {
    clientZoneInput.addEventListener('input', updateProposalPreview);
  }

  updateProposalPreview();
}

function updateProposalPreview() {
  const pkgVal = document.getElementById('prop-package-select')?.value || 'growth';
  const nameVal = document.getElementById('prop-client-name')?.value || 'Client Business';
  const zoneVal = document.getElementById('prop-client-zone')?.value || 'Local Market';

  const nameEl = document.getElementById('preview-client-name');
  const zoneEl = document.getElementById('preview-client-zone');
  const titleEl = document.getElementById('preview-pkg-title');
  const priceEl = document.getElementById('preview-pkg-price');
  const timelineEl = document.getElementById('preview-pkg-timeline');
  const deliverablesEl = document.getElementById('preview-pkg-deliverables');

  if (nameEl) nameEl.textContent = nameVal;
  if (zoneEl) zoneEl.textContent = zoneVal;

  const packages = {
    starter: {
      title: 'Starter Launchpad Website',
      price: '₹22,000',
      timeline: '5 - 7 Business Days',
      deliverables: [
        'Single-page ultra-fast responsive landing page',
        '1-Click WhatsApp Lead Funnel & Direct Call button',
        'Google Business Profile & Google Maps Rank Boost',
        'SSL Security Certificate & High-Speed Cloud Setup',
        'Contact form with email instant alerts'
      ]
    },
    growth: {
      title: 'Growth Business & Lead Funnel',
      price: '₹45,000',
      timeline: '10 - 14 Business Days',
      deliverables: [
        '5 to 7 Pages custom branded multi-page portal',
        'Automated WhatsApp inquiry router with lead capture',
        'On-page Local SEO optimization for top Google search rank',
        'Photo gallery / Product showcase catalog',
        'Interactive Google Maps directions & appointment scheduler',
        '1 Year Cloud Hosting & Managed Backups included'
      ]
    },
    enterprise: {
      title: 'Enterprise B2B & Export Catalog Portal',
      price: '₹95,000',
      timeline: '18 - 24 Business Days',
      deliverables: [
        'Full corporate B2B product catalog with downloadable PDF spec sheets',
        'RFQ (Request for Quotation) engine with automated quoting CRM',
        'Multi-currency & International buyer localization',
        'High-security enterprise cloud hosting with 99.9% SLA',
        'Dedicated admin dashboard for lead tracking & analytics'
      ]
    }
  };

  const currentPkg = packages[pkgVal] || packages.growth;
  if (titleEl) titleEl.textContent = currentPkg.title;
  if (priceEl) priceEl.textContent = currentPkg.price;
  if (timelineEl) timelineEl.textContent = currentPkg.timeline;
  if (deliverablesEl) {
    deliverablesEl.innerHTML = currentPkg.deliverables.map(d => `<li>${d}</li>`).join('');
  }
}

function prepareProposal(leadId) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;

  switchTab('proposal');
  const nameInput = document.getElementById('prop-client-name');
  const zoneInput = document.getElementById('prop-client-zone');
  const pkgSelect = document.getElementById('prop-package-select');

  if (nameInput) nameInput.value = lead.name;
  if (zoneInput) zoneInput.value = lead.address || lead.zone;
  
  if (pkgSelect) {
    if (lead.category && (lead.category.includes('Manufacturing') || lead.category.includes('Industrial'))) {
      pkgSelect.value = 'enterprise';
    } else if (lead.website_status === 'missing' || !lead.website) {
      pkgSelect.value = 'growth';
    } else {
      pkgSelect.value = 'starter';
    }
  }
  updateProposalPreview();
}

// Add Lead Modal & Form
function openAddLeadModal() {
  document.getElementById('add-lead-modal').classList.add('active');
}

function setupModalListeners() {
  // Close on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

function setupAddLeadForm() {
  const form = document.getElementById('add-lead-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-lead-name').value.trim();
    const zone = document.getElementById('new-lead-zone').value.trim();
    const niche = document.getElementById('new-lead-niche').value;
    const phone = document.getElementById('new-lead-phone').value.trim();
    const email = document.getElementById('new-lead-email').value.trim();
    const website = document.getElementById('new-lead-website').value.trim();
    const status = document.getElementById('new-lead-status').value;
    const budget = document.getElementById('new-lead-budget').value;
    const notes = document.getElementById('new-lead-notes').value.trim();

    try {
      const res = await fetch(getApiUrl('/api/leads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          zone: zone,
          category: niche,
          phone: phone,
          email: email,
          website: website,
          website_status: status,
          estimated_budget_tier: budget,
          notes: notes,
          opportunity_score: status === 'missing' || !website ? 96 : 70
        })
      });

      if (res.ok) {
        showToast(`✅ Added lead: "${name}"`);
        document.getElementById('add-lead-modal').classList.remove('active');
        form.reset();
        await refreshLeadsAndStats();
      }
    } catch (err) {
      showToast('⚠️ Error saving new lead');
    }
  });
}

// Export CSV
function exportLeadsCsv() {
  window.open(getApiUrl('/api/export-csv'), '_blank');
}

// Utilities
function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

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
