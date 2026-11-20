// Boot for the Leonida Trophy Guide: loads the trophy data, wires the
// toolbar and the three views, and keeps the checklist in sync with storage.
// Hash routes: #/checklist, #/roadmap, #/missable, #/trophy/<id>.
import { applyFilters } from './filters.js';
import {
  loadEarned,
  loadSettings,
  saveEarned,
  saveSettings,
  downloadExport,
  parseImportFile,
} from './store.js';
import { renderChecklist, renderDetail, renderMissable, renderProgress, renderRoadmap } from './views.js';

const DATA_URL = 'data/trophies.json';
const VIEWS = ['checklist', 'roadmap', 'missable'];

let trophies = [];
let earned = loadEarned();
let settings = loadSettings();
let selectedId = 1;
let currentView = 'checklist';

function readRoute() {
  const hash = location.hash || '#/checklist';
  const parts = hash.replace(/^#\//, '').split('/');
  if (parts[0] === 'trophy' && Number(parts[1])) {
    currentView = 'checklist';
    selectedId = Number(parts[1]);
    return;
  }
  if (VIEWS.includes(parts[0])) currentView = parts[0];
}

function showView(name) {
  currentView = name;
  for (const view of VIEWS) {
    document.getElementById(`view-${view}`).classList.toggle('is-visible', view === name);
    document.getElementById(`tab${view[0].toUpperCase()}${view.slice(1)}`).classList.toggle('is-active', view === name);
  }
  if (name === 'roadmap') renderRoadmap(trophies, earned);
  if (name === 'missable') renderMissable(trophies, earned);
}

function selectedTrophy() {
  return trophies.find((t) => t.id === selectedId) || trophies[0] || null;
}

function rerender() {
  renderProgress(trophies, earned);
  const visible = applyFilters(trophies, earned, {
    grade: settings.grade,
    kind: settings.kind,
    search: settings.search,
    hideEarned: settings.hideEarned,
  });
  renderChecklist(trophies, visible, earned, settings.spoilersHidden, selectedId, toggleEarned, selectTrophy);
  renderDetail(selectedTrophy(), earned, settings.spoilersHidden, toggleEarned);
  if (currentView === 'roadmap') renderRoadmap(trophies, earned);
  if (currentView === 'missable') renderMissable(trophies, earned);
}

function toggleEarned(trophy) {
  if (earned.has(trophy.name)) earned.delete(trophy.name);
  else earned.add(trophy.name);
  saveEarned(earned);
  rerender();
}

function selectTrophy(trophy) {
  selectedId = trophy.id;
  history.replaceState(null, '', `#/trophy/${trophy.id}`);
  rerender();
  document.getElementById('detailPane').scrollIntoView({ block: 'nearest' });
}

function wireToolbar() {
  const search = document.getElementById('searchBox');
  const grade = document.getElementById('gradeFilter');
  const kind = document.getElementById('kindFilter');
  const spoiler = document.getElementById('spoilerToggle');
  const hideEarned = document.getElementById('hideEarnedToggle');
  search.value = settings.search;
  grade.value = settings.grade;
  kind.value = settings.kind;
  spoiler.checked = settings.spoilersHidden;
  hideEarned.checked = settings.hideEarned;

  search.addEventListener('input', () => {
    settings.search = search.value;
    saveSettings(settings);
    rerender();
  });
  grade.addEventListener('change', () => {
    settings.grade = grade.value;
    saveSettings(settings);
    rerender();
  });
  kind.addEventListener('change', () => {
    settings.kind = kind.value;
    saveSettings(settings);
    rerender();
  });
  spoiler.addEventListener('change', () => {
    settings.spoilersHidden = spoiler.checked;
    saveSettings(settings);
    rerender();
  });
  hideEarned.addEventListener('change', () => {
    settings.hideEarned = hideEarned.checked;
    saveSettings(settings);
    rerender();
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const count = downloadExport(earned);
    document.getElementById('filterNote').textContent =
      `Exported ${count} earned ${count === 1 ? 'trophy' : 'trophies'} to leonida-trophy-progress.json.`;
  });
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const known = new Set(trophies.map((t) => t.name));
      const { earned: imported, rejected } = parseImportFile(await file.text(), known);
      earned = imported;
      saveEarned(earned);
      rerender();
      document.getElementById('filterNote').textContent =
        `Imported ${imported.size} earned ${imported.size === 1 ? 'trophy' : 'trophies'} from ${file.name}` +
        (rejected ? ` (${rejected} unknown names skipped).` : '.');
    } catch {
      document.getElementById('filterNote').textContent =
        `Could not import ${file.name}: it is not a Leonida Trophy Guide progress file.`;
    }
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Clear all earned ticks? Export first if you want to keep them.')) return;
    earned = new Set();
    saveEarned(earned);
    rerender();
  });

  for (const view of VIEWS) {
    document.getElementById(`tab${view[0].toUpperCase()}${view.slice(1)}`).addEventListener('click', () => {
      history.replaceState(null, '', `#/${view}`);
      showView(view);
    });
  }
  document.addEventListener('leonida-next-trophy', (event) => {
    const nextId = event.detail.id >= trophies.length ? 1 : event.detail.id + 1;
    selectTrophy(trophies.find((t) => t.id === nextId));
  });
  window.addEventListener('hashchange', () => {
    readRoute();
    showView(currentView);
    rerender();
  });
}

async function bootLeonidaGuide() {
  const response = await fetch(DATA_URL);
  const doc = await response.json();
  trophies = doc.trophies;
  readRoute();
  wireToolbar();
  showView(currentView);
  rerender();
}

bootLeonidaGuide();
