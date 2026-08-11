// ==UserScript==
// @name         TickTick Bookmarklet Manager
// @namespace    https://example.local/
// @version      1.1.1
// @description  TickTick profiles, page-to-task manager and bookmarklet generator
// @author       Drigva
// @match        *://*/*
// @icon         https://img.icons8.com/color/600/tick-tick.png
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_xmlhttpRequest
// @connect      api.ticktick.com
// @connect      defuddle.md
// @run-at       document-idle
// @license      MIT
//
// @homepageURL  https://github.com/Drigva/UserScripts/TickTick
// @downloadURL  https://raw.githubusercontent.com/Drigva/UserScripts/main/TickTick/TickTick-Bookmarklet-Manager.user.js
// @updateURL    https://raw.githubusercontent.com/Drigva/UserScripts/main/TickTick/TickTick-Bookmarklet-Manager.user.js
// ==/UserScript==

'use strict';

const STORAGE_KEY = '__ticktickBookmarkletProfiles';
const PROJECT_CACHE_KEY = '__ticktickBookmarkletProjectCache';
const PROJECT_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const THEME_KEY = '__ticktickBookmarkletTheme';
const LOCK_KEY = '__ticktickBookmarkletRunning';
const ROOT_ID = '__ticktickBookmarkletRoot';
const TOOLTIP_ID = '__ticktickBookmarkletTooltip';
const THEME_STYLE_ID = '__ticktickThemeStyles';
const DEFAULT_PROJECT_ID = 'inbox';

let menuCommandIds = [];

/* ============================================================
 * Generic helpers
 * ============================================================ */

function removeRoot() {
    const root = document.getElementById(ROOT_ID);
    if (root) root.remove();
}

function createId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function truncate(text, maxLength) {
    if (!text) return '';
    text = String(text);
    return text.length > maxLength ? text.substring(0, maxLength - 1) + '…' : text;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ============================================================
 * Profiles
 * ============================================================ */

function loadProfiles() {
    const data = GM_getValue(STORAGE_KEY, {});
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}

function saveProfiles(profiles) {
    GM_setValue(STORAGE_KEY, profiles);
    registerContextMenu();
}

function defaultProfile() {
    return {
        id: createId(),
        name: 'New profile',
        accessToken: '',
        projectId: DEFAULT_PROJECT_ID,
        projectName: 'Inbox',
        tags: ['website', 'bookmark'],
        priority: 3,
        daysUntilDue: 1,
        dueHour: 9,
        dueMinute: 0
    };
}

/* ============================================================
 * Theme
 * ============================================================ */

function getTheme() {
    const theme = GM_getValue(THEME_KEY, 'auto');
    return (theme === 'light' || theme === 'dark' || theme === 'auto') ? theme : 'auto';
}

function getSystemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getEffectiveTheme() {
    const theme = getTheme();
    return theme === 'auto' ? (getSystemDark() ? 'dark' : 'light') : theme;
}

function applyTheme() {
    const theme = getEffectiveTheme();
    const root = document.getElementById(ROOT_ID);

    if (root) {
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
    }
}

function setTheme(theme) {
    GM_setValue(THEME_KEY, theme);
    applyTheme();
    showManager();
}

if (window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = function() {
        if (getTheme() === 'auto') applyTheme();
    };

    if (media.addEventListener) media.addEventListener('change', handler);
    else if (media.addListener) media.addListener(handler);
}

/* ============================================================
 * Userscript menu
 * ============================================================ */

function registerContextMenu() {
    menuCommandIds.forEach(function(id) {
        try {
            GM_unregisterMenuCommand(id);
        } catch (_) {
            // ignored
        }
    });

    menuCommandIds = [];

    const managerId = GM_registerMenuCommand('Open Manager', function() {
        showManager();
    });
    menuCommandIds.push(managerId);

    const profiles = loadProfiles();

    Object.values(profiles).forEach(function(profile) {
        const id = GM_registerMenuCommand('Profile: ' + (profile.name || 'Unnamed profile'), function() {
            executeProfile(profile);
        });
        menuCommandIds.push(id);
    });
}

/* ============================================================
 * Keyboard shortcut
 * ============================================================ */

document.addEventListener('keydown', function(event) {
    if (event.altKey && event.shiftKey && event.key && event.key.toLowerCase() === 't') {
        event.preventDefault();
        showManager();
    }
}, false);

/* ============================================================
 * Close popup when clicking outside
 * ============================================================ */

document.addEventListener('pointerdown', function(event) {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    if (!root.contains(event.target)) removeRoot();
}, false);

/* ============================================================
 * Root
 * ============================================================ */

function createRoot(width = 520) {
    removeRoot();

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.dataset.theme = getEffectiveTheme();

    root.style.cssText =
        'all:initial;' +
        'position:fixed;' +
        'top:20px;' +
        'right:20px;' +
        'width:min(' + width + 'px,calc(100vw - 40px));' +
        'max-height:calc(100vh - 40px);' +
        'background:var(--tt-bg);' +
        'border:1px solid var(--tt-border);' +
        'border-radius:12px;' +
        'box-shadow:var(--tt-shadow);' +
        'font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;' +
        'font-size:14px;' +
        'line-height:1.4;' +
        'z-index:2147483647;' +
        'overflow:hidden;' +
        'color:var(--tt-text);' +
        'color-scheme:' + getEffectiveTheme() + ';' +
        'isolation:isolate;';

    document.body.appendChild(root);
    ensureThemeStyles();

    return root;
}

function ensureThemeStyles() {
    if (document.getElementById(THEME_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = THEME_STYLE_ID;

    style.textContent = `
#${ROOT_ID}{
    --tt-bg:#fff;
    --tt-bg-secondary:#f7f7f7;
    --tt-bg-tertiary:#f1f1f1;
    --tt-text:#222;
    --tt-text-secondary:#666;
    --tt-text-muted:#888;
    --tt-border:#ddd;
    --tt-border-light:#eee;
    --tt-input:#fff;
    --tt-danger:#b42318;
    --tt-danger-bg:#fff5f5;
    --tt-success:#067647;
    --tt-warning-bg:#fff8e6;
    --tt-warning-border:#f0dfaa;
    --tt-warning-text:#765b00;
    --tt-shadow:0 10px 35px rgba(0,0,0,.22);
    --tt-accent:#4f46e5;
    --tt-accent-hover:#4338ca;
    --tt-accent-text:#fff;
}
#${ROOT_ID}[data-theme="dark"]{
    --tt-bg:#202124;
    --tt-bg-secondary:#292a2d;
    --tt-bg-tertiary:#303134;
    --tt-text:#f1f3f4;
    --tt-text-secondary:#b8b9bc;
    --tt-text-muted:#8d8f93;
    --tt-border:#414246;
    --tt-border-light:#35363a;
    --tt-input:#292a2d;
    --tt-danger:#ff7b72;
    --tt-danger-bg:#3a2020;
    --tt-success:#6fd6a0;
    --tt-warning-bg:#3a321d;
    --tt-warning-border:#665626;
    --tt-warning-text:#e5c96b;
    --tt-shadow:0 12px 40px rgba(0,0,0,.55);
    --tt-accent:#818cf8;
    --tt-accent-hover:#6366f1;
    --tt-accent-text:#fff;
}
#${ROOT_ID} *,
#${ROOT_ID} *::before,
#${ROOT_ID} *::after{ box-sizing:border-box; }
#${ROOT_ID} input,
#${ROOT_ID} select,
#${ROOT_ID} textarea{
    background:var(--tt-input)!important;
    color:var(--tt-text)!important;
    border-color:var(--tt-border)!important;
}
#${ROOT_ID} input::placeholder,
#${ROOT_ID} textarea::placeholder{ color:var(--tt-text-muted); }
#${ROOT_ID} button{ color:var(--tt-text); }
#${ROOT_ID} .tt-secondary{
    background:var(--tt-bg-secondary)!important;
    color:var(--tt-text)!important;
    border-color:var(--tt-border)!important;
}
#${ROOT_ID} .tt-primary{
    background:var(--tt-accent)!important;
    color:var(--tt-accent-text)!important;
    border-color:var(--tt-accent)!important;
}
#${ROOT_ID} .tt-primary:hover{
    background:var(--tt-accent-hover)!important;
    border-color:var(--tt-accent-hover)!important;
}
#${ROOT_ID} .tt-danger{
    background:var(--tt-danger-bg)!important;
    color:var(--tt-danger)!important;
    border-color:var(--tt-border)!important;
}
#${ROOT_ID} .tt-muted{ color:var(--tt-text-secondary)!important; }
#${ROOT_ID} .tt-border{ border-color:var(--tt-border-light)!important; }
#${ROOT_ID} .tt-warning{
    background:var(--tt-warning-bg)!important;
    border-color:var(--tt-warning-border)!important;
    color:var(--tt-warning-text)!important;
}
#${ROOT_ID} .tt-card{ border-color:var(--tt-border-light)!important; }
#${ROOT_ID} option{
    background:var(--tt-input);
    color:var(--tt-text);
}
#${ROOT_ID} a{ color:inherit; }
#${ROOT_ID} .tt-theme-selector{
    display:flex;
    gap:2px;
    padding:3px;
    background:var(--tt-bg-secondary);
    border:1px solid var(--tt-border);
    border-radius:8px;
}
#${ROOT_ID} .tt-theme-button{
    border:0;
    border-radius:6px;
    padding:5px 7px;
    font-size:12px;
    cursor:pointer;
    background:transparent;
    color:var(--tt-text-secondary);
    white-space:nowrap;
}
#${ROOT_ID} .tt-theme-button.active{
    background:var(--tt-bg);
    color:var(--tt-text);
    box-shadow:0 1px 3px rgba(0,0,0,.16);
}
`;

    document.head.appendChild(style);
}

/* ============================================================
 * UI helpers
 * ============================================================ */

function themeSelector() {
    const current = getTheme();

    return `
        <div class="tt-theme-selector">
            <button class="tt-theme-button ${current === 'auto' ? 'active' : ''}" data-theme="auto" title="Use system theme">Auto</button>
            <button class="tt-theme-button ${current === 'light' ? 'active' : ''}" data-theme="light" title="Light theme">☀️</button>
            <button class="tt-theme-button ${current === 'dark' ? 'active' : ''}" data-theme="dark" title="Dark theme">🌙</button>
        </div>
    `;
}

function bindThemeSelector(root) {
    root.querySelectorAll('[data-theme]').forEach(function(button) {
        if (button.classList.contains('tt-theme-button')) {
            button.onclick = function() {
                setTheme(this.dataset.theme);
            };
        }
    });
}

function header(title, closeAction, actions = '') {
    return `
        <div style="padding:15px 17px;border-bottom:1px solid var(--tt-border-light);display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <strong style="font-size:17px;color:var(--tt-text);">${escapeHtml(title)}</strong>
            <div style="display:flex;align-items:center;gap:6px;">
                ${actions}
                ${themeSelector()}
                <button id="__ttClose" style="border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:var(--tt-text-secondary);">×</button>
            </div>
        </div>
    `;
}

function button(text, id, primary = false) {
    return `
        <button id="${id}" class="${primary ? 'tt-primary' : 'tt-secondary'}" style="padding:8px 11px;border:1px solid var(--tt-border);border-radius:7px;cursor:pointer;font-size:13px;">${escapeHtml(text)}</button>
    `;
}

/* ============================================================
 * Tooltip
 * ============================================================ */

function showTooltip(message, type) {
    const existing = document.getElementById(TOOLTIP_ID);
    if (existing) existing.remove();

    const tooltip = document.createElement('div');
    tooltip.id = TOOLTIP_ID;
    tooltip.innerText = message;

    tooltip.style.cssText =
        'position:fixed;top:16px;right:16px;max-width:360px;background:' + (type === 'error' ? '#b42318' : '#222') + ';color:#fff;padding:11px 15px;border-radius:7px;box-shadow:0 4px 14px rgba(0,0,0,.25);font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;line-height:1.4;z-index:2147483647;white-space:pre-line;opacity:0;transform:translateY(-5px);transition:opacity .2s ease,transform .2s ease;';

    document.body.appendChild(tooltip);

    requestAnimationFrame(function() {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    });

    return tooltip;
}

function updateTooltip(tooltip, message, type) {
    if (!tooltip) return;
    tooltip.innerText = message;
    tooltip.style.background = type === 'error' ? '#b42318' : '#222';
}

function finishTooltip(tooltip, delay) {
    setTimeout(function() {
        if (!tooltip || !tooltip.parentNode) return;

        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(-5px)';

        setTimeout(function() {
            if (tooltip.parentNode) tooltip.remove();
        }, 200);
    }, delay);
}

/* ============================================================
 * Page extraction
 * ============================================================ */

function getLocalFallback() {
    let text = document.body ? document.body.innerText.trim() : '';
    if (!text) return '';

    const maxLength = 30000;
    if (text.length > maxLength) text = text.substring(0, maxLength) + '\n\n[Content truncated]';
    return text;
}

async function getDefuddleContent(url) {
    const response = await fetch('https://defuddle.md/' + url);

    if (!response.ok) {
        throw new Error('Defuddle returned HTTP ' + response.status);
    }

    const content = await response.text();

    if (!content.trim()) {
        throw new Error('Defuddle returned empty content.');
    }

    return content;
}

/* ============================================================
 * TickTick API
 * ============================================================ */

function projectCacheKey(token) {
    // The token is not stored in the cache index; the profile remains the token source.
    let hash = 5381;

    for (let i = 0; i < token.length; i++) {
        hash = ((hash << 5) + hash) ^ token.charCodeAt(i);
    }

    return String(hash >>> 0);
}

function loadCachedProjects(token, allowExpired = false) {
    const cache = GM_getValue(PROJECT_CACHE_KEY, {});
    const entry = cache && cache[projectCacheKey(token)];

    if (!entry || !Array.isArray(entry.projects)) {
        return null;
    }

    if (
        !allowExpired &&
        Date.now() - Number(entry.cachedAt || 0) > PROJECT_CACHE_TTL_MS
    ) {
        return null;
    }

    return entry;
}

function cacheProjects(token, projects) {
    const cache = GM_getValue(PROJECT_CACHE_KEY, {});
    const safeCache =
        cache && typeof cache === 'object' && !Array.isArray(cache)
            ? cache
            : {};

    safeCache[projectCacheKey(token)] = {
        cachedAt: Date.now(),
        projects: projects
    };

    GM_setValue(PROJECT_CACHE_KEY, safeCache);
}

async function fetchProjects(token) {
    if (!token) {
        throw new Error('Access Token not provided.');
    }

    const response = await fetch('https://api.ticktick.com/open/v1/project', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        }
    });

    if (response.status === 401) {
        throw new Error('Invalid or expired Access Token.');
    }

    if (response.status === 403) {
        throw new Error(
            'Access Token does not have permission to access projects.'
        );
    }

    if (!response.ok) {
        throw new Error('TickTick returned HTTP ' + response.status + '.');
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Invalid response from the TickTick API.');
    }

    cacheProjects(token, data);

    return data;
}

async function validateToken(token) {
    try {
        const projects = await fetchProjects(token);

        return {
            valid: true,
            projects: projects,
            source: 'api'
        };
    } catch (error) {
        // Do not allow the cache to hide an invalid or unauthorized token.
        if (
            /Invalid or expired|does not have permission/.test(
                error.message || ''
            )
        ) {
            throw error;
        }

        // On temporary network/API errors, also recover old cache.
        const cached = loadCachedProjects(token, true);

        if (!cached) {
            throw error;
        }

        return {
            valid: true,
            projects: cached.projects,
            source: 'cache',
            cachedAt: cached.cachedAt
        };
    }
}

/* ============================================================
 * Manager
 * ============================================================ */

function showManager() {
    const root = createRoot(520);
    const profiles = loadProfiles();

    let html = header('TickTick Profiles', removeRoot, button('＋ New Profile', '__ttNew', true));

    html += `
        <div style="padding:12px;border-bottom:1px solid var(--tt-border-light);display:flex;gap:8px;">
            ${button('Import', '__ttImport')}
            ${button('Export', '__ttExport')}
        </div>
        <div style="max-height:60vh;overflow-y:auto;padding:8px 14px 14px;">
    `;

    const list = Object.values(profiles);

    if (!list.length) {
        html += `
            <div style="padding:35px 10px;text-align:center;color:var(--tt-text-secondary);">
                <div style="font-size:30px;margin-bottom:10px;">📚</div>
                <div style="font-weight:600;margin-bottom:5px;color:var(--tt-text);">No profiles configured</div>
                <div style="font-size:13px">Create your first profile to get started.</div>
            </div>
        `;
    } else {
        list.forEach(function(profile) {
            const projectId = profile.projectId || DEFAULT_PROJECT_ID;
            const projectName = profile.projectName || (projectId === DEFAULT_PROJECT_ID ? 'Inbox' : projectId);

            html += `
                <div class="tt-card" style="padding:13px 0;border-bottom:1px solid var(--tt-border-light);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                        <div style="min-width:0">
                            <div style="font-weight:600;word-break:break-word;">${escapeHtml(profile.name)}</div>
                            <div class="tt-muted" style="margin-top:4px;font-size:12px;">Project: ${escapeHtml(projectName)}</div>
                            <div class="tt-muted" style="margin-top:2px;font-size:12px;">Tags: ${escapeHtml(Array.isArray(profile.tags) ? profile.tags.join(', ') : '')}</div>
                        </div>
                        <div style="display:flex;gap:5px;flex-shrink:0;">
                            <button data-action="run" data-id="${escapeHtml(profile.id)}" title="Run profile" class="tt-secondary" style="border:1px solid var(--tt-border);border-radius:6px;padding:6px 8px;cursor:pointer;">▶</button>
                            <button data-action="edit" data-id="${escapeHtml(profile.id)}" title="Edit" class="tt-secondary" style="border:1px solid var(--tt-border);border-radius:6px;padding:6px 8px;cursor:pointer;">✎</button>
                            <button data-action="bookmarklet" data-id="${escapeHtml(profile.id)}" title="Create bookmarklet" class="tt-secondary" style="border:1px solid var(--tt-border);border-radius:6px;padding:6px 8px;cursor:pointer;">🔖</button>
                            <button data-action="duplicate" data-id="${escapeHtml(profile.id)}" title="Duplicate" class="tt-secondary" style="border:1px solid var(--tt-border);border-radius:6px;padding:6px 8px;cursor:pointer;">⧉</button>
                            <button data-action="delete" data-id="${escapeHtml(profile.id)}" title="Delete" class="tt-danger" style="border:1px solid var(--tt-border);border-radius:6px;padding:6px 8px;cursor:pointer;">×</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    root.innerHTML = html;

    bindThemeSelector(root);

    document.getElementById('__ttClose').onclick = removeRoot;
    document.getElementById('__ttNew').onclick = function() { showProfileForm(null); };
    document.getElementById('__ttImport').onclick = showImport;
    document.getElementById('__ttExport').onclick = showExport;

    root.querySelectorAll('[data-action]').forEach(function(btn) {
        btn.onclick = function() {
            const id = this.dataset.id;
            const action = this.dataset.action;
            const currentProfiles = loadProfiles();
            const profile = currentProfiles[id];
            if (!profile) return;

            if (action === 'run') return executeProfile(profile);
            if (action === 'edit') return showProfileForm(profile);
            if (action === 'bookmarklet') return showBookmarklet(profile);

            if (action === 'duplicate') {
                const copy = {
                    ...profile,
                    id: createId(),
                    name: profile.name + ' Copy',
                    projectId: profile.projectId || DEFAULT_PROJECT_ID,
                    projectName: profile.projectName || 'Inbox',
                    tags: Array.isArray(profile.tags) ? [...profile.tags] : []
                };

                currentProfiles[copy.id] = copy;
                saveProfiles(currentProfiles);
                showManager();
                return;
            }

            if (action === 'delete') {
                delete currentProfiles[id];
                saveProfiles(currentProfiles);
                showManager();
            }
        };
    });
}

/* ============================================================
 * Profile form
 * ============================================================ */

function showProfileForm(existingProfile) {
    const profile = existingProfile ? {
        ...existingProfile,
        projectId: existingProfile.projectId || DEFAULT_PROJECT_ID,
        projectName: existingProfile.projectName || 'Inbox',
        tags: Array.isArray(existingProfile.tags) ? [...existingProfile.tags] : []
    } : defaultProfile();

    const root = createRoot(500);

    root.innerHTML =
        header(existingProfile ? 'Edit Profile' : 'New Profile', showManager) +
        `
        <div style="padding:18px;overflow-y:auto;max-height:75vh;">
            <label style="display:block;font-weight:600;font-size:13px;margin-bottom:6px;">Name</label>
            <input id="__ttName" value="${escapeHtml(profile.name)}" placeholder="Eg.: Reading" style="width:100%;padding:9px 11px;border:1px solid var(--tt-border);border-radius:7px;font:inherit;">

            <label style="display:block;font-weight:600;font-size:13px;margin:14px 0 6px;">Access Token</label>
            <div style="display:flex;gap:7px;">
                <input id="__ttToken" type="password" autocomplete="off" value="${escapeHtml(profile.accessToken || '')}" placeholder="TickTick Access Token" style="flex:1;min-width:0;padding:9px 11px;border:1px solid var(--tt-border);border-radius:7px;font:inherit;">
                <button id="__ttValidateToken" class="tt-secondary" style="flex-shrink:0;padding:8px 11px;border:1px solid var(--tt-border);border-radius:7px;cursor:pointer;font-size:13px;">Validate</button>
            </div>
            <div id="__ttTokenStatus" style="display:none;margin-top:7px;font-size:12px;"></div>

            <label style="display:block;font-weight:600;font-size:13px;margin:14px 0 6px;">Project</label>
            <select id="__ttProject" style="width:100%;padding:9px 11px;border:1px solid var(--tt-border);border-radius:7px;font:inherit;">
                <option value="${escapeHtml(profile.projectId || DEFAULT_PROJECT_ID)}">${escapeHtml(profile.projectName || (profile.projectId === DEFAULT_PROJECT_ID ? 'Inbox' : 'Current project'))}</option>
            </select>

            <div class="tt-muted" style="margin-top:5px;font-size:11px;">
                The implicit TickTick Inbox project is represented by <strong>inbox</strong>.
            </div>

            <label style="display:block;font-weight:600;font-size:13px;margin:14px 0 6px;">Tags</label>
            <input id="__ttTags" value="${escapeHtml(Array.isArray(profile.tags) ? profile.tags.join(', ') : '')}" placeholder="website, bookmark" style="width:100%;padding:9px 11px;border:1px solid var(--tt-border);border-radius:7px;font:inherit;">

            <label style="display:block;font-weight:600;font-size:13px;margin:14px 0 6px;">Priority</label>
            <select id="__ttPriority" style="width:100%;padding:9px 11px;border:1px solid var(--tt-border);border-radius:7px;font:inherit;">
                <option value="0">None</option>
                <option value="1">Low</option>
                <option value="3">Medium</option>
                <option value="5">High</option>
            </select>

            <label style="display:block;font-weight:600;font-size:13px;margin:14px 0 6px;">Days until due</label>
            <input id="__ttDays" type="number" min="0" step="1" value="${Number(profile.daysUntilDue)}" style="width:100%;padding:9px 11px;border:1px solid var(--tt-border);border-radius:7px;font:inherit;">

            <div style="display:flex;gap:10px;">
                <div style="flex:1">
                    <label style="display:block;font-weight:600;font-size:13px;margin:14px 0 6px;">Due hour</label>
                    <input id="__ttHour" type="number" min="0" max="23" value="${Number(profile.dueHour)}" style="width:100%;padding:9px 11px;border:1px solid var(--tt-border);border-radius:7px;font:inherit;">
                </div>
                <div style="flex:1">
                    <label style="display:block;font-weight:600;font-size:13px;margin:14px 0 6px;">Due minute</label>
                    <input id="__ttMinute" type="number" min="0" max="59" value="${Number(profile.dueMinute)}" style="width:100%;padding:9px 11px;border:1px solid var(--tt-border);border-radius:7px;font:inherit;">
                </div>
            </div>

            <div id="__ttFormError" style="display:none;margin-top:12px;color:var(--tt-danger);font-size:13px;"></div>

            <div style="display:flex;gap:8px;margin-top:18px;">
                ${button('Save', '__ttSave', true)}
                ${button('Cancel', '__ttCancel')}
            </div>
        </div>
        `;

    bindThemeSelector(root);

    const priority = document.getElementById('__ttPriority');
    priority.value = String(profile.priority);

    const projectSelect = document.getElementById('__ttProject');
    const tokenInput = document.getElementById('__ttToken');
    const tokenStatus = document.getElementById('__ttTokenStatus');
    const validateButton = document.getElementById('__ttValidateToken');
    const formError = document.getElementById('__ttFormError');

    function setTokenStatus(message, type) {
        tokenStatus.innerText = message;
        tokenStatus.style.display = 'block';
        tokenStatus.style.color = type === 'success' ? 'var(--tt-success)' : type === 'loading' ? 'var(--tt-text-secondary)' : 'var(--tt-danger)';
    }

    function populateProjects(projects, selectedId) {
        projectSelect.innerHTML = '';

        const inboxOption = document.createElement('option');
        inboxOption.value = DEFAULT_PROJECT_ID;
        inboxOption.innerText = 'Inbox';
        inboxOption.selected = !selectedId || selectedId === DEFAULT_PROJECT_ID;
        projectSelect.appendChild(inboxOption);

        projects.forEach(function(project) {
            if (!project || !project.id) return;
            if (project.id === DEFAULT_PROJECT_ID) return;

            const option = document.createElement('option');
            option.value = project.id;
            option.innerText = project.name || project.id || 'Unnamed project';

            if (project.id === selectedId) option.selected = true;
            projectSelect.appendChild(option);
        });
    }

    async function validateAndLoadProjects() {
        const token = tokenInput.value.trim();

        if (!token) {
            setTokenStatus('Enter the Access Token.', 'error');
            return false;
        }

        validateButton.disabled = true;
        validateButton.innerText = 'Validating…';
        setTokenStatus('Loading projects…', 'loading');

        try {
            const result = await validateToken(token);

            populateProjects(result.projects, profile.projectId || DEFAULT_PROJECT_ID);

            const selectedProject = result.projects.find(function(project) {
                return project.id === profile.projectId;
            });

            if (selectedProject) {
                profile.projectName = selectedProject.name || selectedProject.id;
            } else if (profile.projectId === DEFAULT_PROJECT_ID) {
                profile.projectName = 'Inbox';
            } else {
                projectSelect.value = DEFAULT_PROJECT_ID;
                profile.projectId = DEFAULT_PROJECT_ID;
                profile.projectName = 'Inbox';
            }

            if (result.source === 'cache') {
                const cachedAt = new Date(result.cachedAt).toLocaleString();

                setTokenStatus(
                    '⚠ API unavailable · ' +
                        result.projects.length +
                        ' project(s) loaded from cache (' +
                        cachedAt +
                        ').',
                    'success'
                );
            } else {
                setTokenStatus(
                    '✓ Valid token · ' +
                        result.projects.length +
                        ' project(s) found.',
                    'success'
                );
            }
            return true;

        } catch (error) {
            projectSelect.innerHTML = `<option value="${DEFAULT_PROJECT_ID}">Inbox</option>`;
            setTokenStatus('✕ ' + error.message, 'error');
            return false;

        } finally {
            validateButton.disabled = false;
            validateButton.innerText = 'Validate';
        }
    }

    document.getElementById('__ttClose').onclick = showManager;
    document.getElementById('__ttCancel').onclick = showManager;
    validateButton.onclick = validateAndLoadProjects;

    tokenInput.addEventListener('change', function() {
        profile.accessToken = this.value.trim();
        tokenStatus.style.display = 'none';
    });

    projectSelect.addEventListener('change', function() {
        const selected = projectSelect.options[projectSelect.selectedIndex];
        if (selected && selected.value) {
            profile.projectId = selected.value;
            profile.projectName = selected.textContent;
        }
    });

    document.getElementById('__ttSave').onclick = async function() {
        formError.style.display = 'none';

        const name = document.getElementById('__ttName').value.trim();
        const token = tokenInput.value.trim();
        const projectId = projectSelect.value || DEFAULT_PROJECT_ID;
        const projectName = projectSelect.options[projectSelect.selectedIndex]?.textContent || (projectId === DEFAULT_PROJECT_ID ? 'Inbox' : projectId);

        const tags = document.getElementById('__ttTags').value.split(',').map(function(x) { return x.trim(); }).filter(Boolean);
        const priorityValue = Number(document.getElementById('__ttPriority').value);
        const days = Number(document.getElementById('__ttDays').value);
        const hour = Number(document.getElementById('__ttHour').value);
        const minute = Number(document.getElementById('__ttMinute').value);

        function error(message) {
            formError.innerText = message;
            formError.style.display = 'block';
        }

        if (!name) return error('Please provide a name for the profile.');
        if (!token) return error('Enter the Access Token.');
        if (!projectId) return error('Project ID invalid.');
        if (!Number.isInteger(days) || days < 0) return error('Days until due invalid.');
        if (!Number.isInteger(hour) || hour < 0 || hour > 23) return error('Due time must be between 0 and 23.');
        if (!Number.isInteger(minute) || minute < 0 || minute > 59) return error('Due minute must be between 0 and 59.');

        const profiles = loadProfiles();

        profile.name = name;
        profile.accessToken = token;
        profile.projectId = projectId;
        profile.projectName = projectName || (profile.projectId === DEFAULT_PROJECT_ID ? 'Inbox' : profile.projectId);
        profile.tags = tags;
        profile.priority = priorityValue;
        profile.daysUntilDue = days;
        profile.dueHour = hour;
        profile.dueMinute = minute;

        profiles[profile.id] = profile;
        saveProfiles(profiles);
        showManager();
    };

    if (profile.accessToken) {
        const cached = loadCachedProjects(profile.accessToken, true);

        if (cached) {
            populateProjects(
                cached.projects,
                profile.projectId || DEFAULT_PROJECT_ID
            );
        }

        validateAndLoadProjects();
    }
}

/* ============================================================
 * Export
 * ============================================================ */

function showExport() {
    const root = createRoot(470);

    root.innerHTML =
        header('Export profiles', showManager) +
        `
        <div style="padding:18px">
            <label style="display:flex;gap:8px;align-items:center;font-size:13px;cursor:pointer;">
                <input id="__ttIncludeTokens" type="checkbox">
                <span>Include Access Tokens</span>
            </label>

            <div class="tt-warning" style="margin-top:10px;padding:10px 11px;border:1px solid;border-radius:7px;font-size:12px;line-height:1.5;">
                Tokens are credentials. Only include them if you really need to migrate them.
            </div>

            <div style="margin-top:18px;display:flex;gap:8px;">
                ${button('Export JSON', '__ttDoExport', true)}
                ${button('Cancel', '__ttCancelExport')}
            </div>
        </div>
        `;

    bindThemeSelector(root);

    document.getElementById('__ttClose').onclick = showManager;
    document.getElementById('__ttCancelExport').onclick = showManager;

    document.getElementById('__ttDoExport').onclick = function() {
        const includeTokens = document.getElementById('__ttIncludeTokens').checked;
        const profiles = loadProfiles();

        const output = {
            version: 3,
            exportedAt: new Date().toISOString(),
            profiles: Object.values(profiles).map(function(profile) {
                const copy = {
                    ...profile,
                    projectId: profile.projectId || DEFAULT_PROJECT_ID,
                    projectName: profile.projectName || (profile.projectId === DEFAULT_PROJECT_ID ? 'Inbox' : ''),
                    tags: Array.isArray(profile.tags) ? [...profile.tags] : []
                };

                if (!includeTokens) delete copy.accessToken;
                return copy;
            })
        };

        const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'ticktick-profiles.json';
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
        showManager();
    };
}

/* ============================================================
 * Import
 * ============================================================ */

function showImport() {
    const root = createRoot(470);

    root.innerHTML =
        header('Import profiles', showManager) +
        `
        <div style="padding:18px">
            <input id="__ttImportFile" type="file" accept=".json,application/json" style="width:100%;padding:10px;border:1px dashed var(--tt-border);border-radius:7px;font:inherit;">

            <div id="__ttImportError" style="display:none;margin-top:12px;color:var(--tt-danger);font-size:13px;"></div>

            <div style="margin-top:18px;display:flex;gap:8px;">
                ${button('Import', '__ttDoImport', true)}
                ${button('Cancel', '__ttCancelImport')}
            </div>
        </div>
        `;

    bindThemeSelector(root);

    document.getElementById('__ttClose').onclick = showManager;
    document.getElementById('__ttCancelImport').onclick = showManager;

    document.getElementById('__ttDoImport').onclick = async function() {
        const file = document.getElementById('__ttImportFile').files[0];
        const error = document.getElementById('__ttImportError');

        if (!file) {
            error.innerText = 'Select a JSON file.';
            error.style.display = 'block';
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data || !Array.isArray(data.profiles)) {
                throw new Error('Invalid profile file.');
            }

            const profiles = loadProfiles();
            let imported = 0;

            data.profiles.forEach(function(profile) {
                if (!profile || typeof profile !== 'object') return;

                let id = typeof profile.id === 'string' && profile.id ? profile.id : createId();
                if (profiles[id]) id = createId();

                const projectId = String(profile.projectId || DEFAULT_PROJECT_ID);

                const normalized = {
                    id: id,
                    name: String(profile.name || 'Imported profile'),
                    accessToken: String(profile.accessToken || ''),
                    projectId: projectId,
                    projectName: String(profile.projectName || (projectId === DEFAULT_PROJECT_ID ? 'Inbox' : '')),
                    tags: Array.isArray(profile.tags) ? profile.tags.map(String).filter(Boolean) : [],
                    priority: Number.isFinite(Number(profile.priority)) ? Number(profile.priority) : 3,
                    daysUntilDue: Number.isFinite(Number(profile.daysUntilDue)) ? Number(profile.daysUntilDue) : 1,
                    dueHour: Number.isFinite(Number(profile.dueHour)) ? Number(profile.dueHour) : 9,
                    dueMinute: Number.isFinite(Number(profile.dueMinute)) ? Number(profile.dueMinute) : 0
                };

                profiles[id] = normalized;
                imported++;
            });

            saveProfiles(profiles);
            alert(imported + ' imported profile(s).');
            showManager();

        } catch (err) {
            error.innerText = err.message || 'The file could not be imported.';
            error.style.display = 'block';
        }
    };
}

/* ============================================================
 * Bookmarklet generation
 * ============================================================ */

function generateBookmarklet(profile) {
    const accessToken = String(profile.accessToken || '').trim();
    const projectId = String(profile.projectId || DEFAULT_PROJECT_ID).trim() || DEFAULT_PROJECT_ID;
    const tags = Array.isArray(profile.tags) ? profile.tags.map(String).filter(Boolean) : [];
    const priority = Number(profile.priority || 0);
    const daysUntilDue = Number(profile.daysUntilDue || 0);
    const dueHour = Number(profile.dueHour || 0);
    const dueMinute = Number(profile.dueMinute || 0);

    const A = JSON.stringify(accessToken);
    const P = JSON.stringify(projectId);
    const T = JSON.stringify(tags);
    const R = JSON.stringify(priority);
    const D = JSON.stringify(daysUntilDue);
    const H = JSON.stringify(dueHour);
    const M = JSON.stringify(dueMinute);

    const source = `(async()=>{const A=${A},P=${P},T=${T},R=${R},D=${D},H=${H},M=${M},LOCK='__ticktickBookmarkletRunning';if(window[LOCK])return;window[LOCK]=true;const trunc=(s,n)=>!s?'':s.length>n?s.slice(0,n-1)+'…':s;const tip=(msg,type)=>{const old=document.getElementById('__ticktickBookmarkletTooltip');if(old)old.remove();const e=document.createElement('div');e.id='__ticktickBookmarkletTooltip';e.innerText=msg;e.style.cssText='position:fixed;top:16px;right:16px;max-width:360px;background:'+(type==='error'?'#b42318':'#222')+';color:#fff;padding:11px 15px;border-radius:7px;box-shadow:0 4px 14px rgba(0,0,0,.25);font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;line-height:1.4;z-index:2147483647;white-space:pre-line;opacity:0;transform:translateY(-5px);transition:opacity .2s ease,transform .2s ease';(document.body||document.documentElement).appendChild(e);requestAnimationFrame(()=>{e.style.opacity='1';e.style.transform='translateY(0)';});return e;};const update=(e,msg,type)=>{if(!e)return;e.innerText=msg;e.style.background=type==='error'?'#b42318':'#222';};const fallback=()=>{let t=document.body?document.body.innerText.trim():'';if(t.length>30000)t=t.slice(0,30000)+'\\n\\n[Content truncated]';return t;};const defuddle=async url=>{const r=await fetch('https://defuddle.md/'+url);if(!r.ok)throw new Error('Defuddle returned HTTP '+r.status);const t=await r.text();if(!t.trim())throw new Error('Defuddle returned empty content.');return t;};const finish=(tooltip,delay)=>{setTimeout(()=>{if(!tooltip||!tooltip.parentNode)return;tooltip.style.opacity='0';tooltip.style.transform='translateY(-5px)';setTimeout(()=>{if(tooltip.parentNode)tooltip.remove();},200);},delay);};try{if(!A)throw new Error('This bookmarklet has no Access Token.');const pageUrl=window.location.href;const pageTitle=document.title||'Untitled page';const displayTitle=trunc(pageTitle,80);const title='['+pageTitle+']('+pageUrl+')';const selected=window.getSelection().toString().trim();const due=new Date();due.setDate(due.getDate()+Number(D||0));due.setHours(Number(H||0),Number(M||0),0,0);const dueISO=due.toISOString().split('.')[0]+'+0000';const tooltip=tip('Saving…','loading');let description='';let sourceName='';if(selected){description='> '+selected;sourceName='Selection';}else{update(tooltip,'Extracting page…','loading');try{description=await defuddle(pageUrl);sourceName='Defuddle';}catch(error){console.warn('Defuddle failed:',error);update(tooltip,'Using page content…','loading');description=fallback();sourceName='Fallback';}}const task={title:title,content:description,projectId:P||'inbox',tags:Array.isArray(T)?T:[],priority:Number(R||0),dueDate:dueISO,startDate:dueISO,isAllDay:false};update(tooltip,'Adding task…','loading');const response=await fetch('https://api.ticktick.com/open/v1/task',{method:'POST',headers:{'Authorization':'Bearer '+A,'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(task)});let data=null;const responseText=await response.text();try{data=responseText?JSON.parse(responseText):null;}catch{data=null;}if(!response.ok){const apiMessage=data&&(data.errorMessage||data.message||data.error);throw new Error(apiMessage||('TickTick returned HTTP '+response.status+(responseText?' · '+responseText.slice(0,300):'')));}if(!data)throw new Error('TickTick returned an empty response.');if(!data.id)throw new Error('TickTick did not return a task ID: '+JSON.stringify(data));update(tooltip,'✓ Task added · '+sourceName+'\\n'+displayTitle,'success');finish(tooltip,3000);}catch(error){console.error('TickTick bookmarklet error:',error);const tooltip=document.getElementById('__ticktickBookmarkletTooltip');const message=error&&error.message?error.message:String(error);if(tooltip){update(tooltip,'✕ Failed to add task\\n'+trunc(message,500),'error');finish(tooltip,5000);}else{alert('TickTick: '+message);}}finally{window[LOCK]=false;}})();`;

    return 'javascript:' + encodeURIComponent(source);
}

/* ============================================================
 * Bookmarklet UI
 * ============================================================ */

function showBookmarklet(profile) {
    const root = createRoot(520);
    const bookmarklet = generateBookmarklet(profile);

    root.innerHTML =
        header('Bookmarklet', showManager) +
        `
        <div style="padding:18px">
            <div style="font-weight:600;margin-bottom:6px;">${escapeHtml(profile.name)}</div>
            <div class="tt-muted" style="font-size:13px;line-height:1.5;margin-bottom:15px;">Drag the button below to your browser's bookmarks bar.</div>

            <a id="__ttBookmarkletLink" href="${escapeHtml(bookmarklet)}" style="display:inline-block;padding:10px 15px;background:var(--tt-accent);color:#fff;border-radius:7px;text-decoration:none;font-size:13px;cursor:grab;">🔖 ${escapeHtml(profile.name)} #TickTick</a>

            <div class="tt-warning" style="margin-top:18px;padding:10px 11px;border:1px solid;border-radius:7px;font-size:12px;line-height:1.5;">
                <strong>Embedded credentials:</strong> this generated bookmarklet contains the Access Token in its JavaScript.
            </div>

            <div style="margin-top:15px;display:flex;gap:8px;">
                ${button('Copy bookmarklet', '__ttCopyBookmarklet', true)}
                ${button('Back', '__ttBackBookmarklet')}
            </div>
        </div>
        `;

    bindThemeSelector(root);

    document.getElementById('__ttClose').onclick = showManager;
    document.getElementById('__ttBackBookmarklet').onclick = showManager;

    document.getElementById('__ttCopyBookmarklet').onclick = async function() {
        try {
            await navigator.clipboard.writeText(bookmarklet);
            this.innerText = 'Copied!';
            setTimeout(() => { this.innerText = 'Copy bookmarklet'; }, 1200);
        } catch (_) {
            const textarea = document.createElement('textarea');
            textarea.value = bookmarklet;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            let copied = false;
            try {
                copied = document.execCommand('copy');
            } catch (_) {
                copied = false;
            }

            textarea.remove();

            if (copied) {
                this.innerText = 'Copied!';
                setTimeout(() => { this.innerText = 'Copy bookmarklet'; }, 1200);
            } else {
                alert('Automatic copy was not possible. Use the bookmarklet link above.');
            }
        }
    };
}

/* ============================================================
 * Execute profile directly
 * ============================================================ */

async function executeProfile(profile) {
    removeRoot();

    if (window[LOCK_KEY]) return;

    if (!profile) {
        showTooltip('Profile not found.', 'error');
        return;
    }

    if (!profile.accessToken) {
        showProfileForm(profile);
        return;
    }

    const projectId = profile.projectId || DEFAULT_PROJECT_ID;
    window[LOCK_KEY] = true;

    try {
        const pageUrl = window.location.href;
        const pageTitle = document.title || 'Untitled page';
        const displayTitle = truncate(pageTitle, 80);
        const title = '[' + pageTitle + '](' + pageUrl + ')';
        const selectedText = window.getSelection().toString().trim();

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Number(profile.daysUntilDue || 0));
        dueDate.setHours(Number(profile.dueHour || 0), Number(profile.dueMinute || 0), 0, 0);

        const dueDateISO = dueDate.toISOString().split('.')[0] + '+0000';
        const tooltip = showTooltip('Saving…', 'loading');

        let description = '';
        let contentSource = '';

        if (selectedText) {
            description = '> ' + selectedText;
            contentSource = 'Selection';
        } else {
            updateTooltip(tooltip, 'Extracting page content…', 'loading');

            try {
                description = await getDefuddleContent(pageUrl);
                contentSource = 'Defuddle';
            } catch (error) {
                console.warn('Defuddle failed:', error);
                updateTooltip(tooltip, 'Using local content…', 'loading');
                description = getLocalFallback();
                contentSource = 'Fallback';
            }
        }

        const task = {
            title: title,
            content: description,
            desc: truncate(description, 1000),
            projectId: projectId || DEFAULT_PROJECT_ID,
            tags: Array.isArray(profile.tags) ? profile.tags : [],
            priority: Number(profile.priority || 0),
            dueDate: dueDateISO,
            startDate: dueDateISO,
            isAllDay: false,
        };

        updateTooltip(tooltip, 'Adding task…', 'loading');

        const response = await fetch('https://api.ticktick.com/open/v1/task', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + profile.accessToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(task)
        });

        const responseText = await response.text();
        let data = null;

        try {
            data = responseText ? JSON.parse(responseText) : null;
        } catch (_) {
            data = null;
        }

        if (!response.ok) {
            const apiMessage = data && (data.errorMessage || data.message || data.error);
            throw new Error(apiMessage || ('TickTick returned HTTP ' + response.status + (responseText ? ' · ' + responseText.substring(0, 300) : '')));
        }

        if (!data) throw new Error('TickTick returned an empty response.');
        if (!data.id) throw new Error('TickTick did not return a task ID: ' + JSON.stringify(data));

        updateTooltip(tooltip, '✓ Task added · ' + contentSource + '\n' + displayTitle, 'success');
        finishTooltip(tooltip, 3000);

    } catch (error) {
        console.error('TickTick bookmarklet error:', error);
        showTooltip('✕ Failed to add task\n' + truncate(error.message || String(error), 500), 'error');
    } finally {
        window[LOCK_KEY] = false;
    }
}

/* ============================================================
 * Initialization
 * ============================================================ */

applyTheme();
registerContextMenu();
