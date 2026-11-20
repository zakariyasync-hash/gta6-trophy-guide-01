// Leonida Trophy Guide: checklist, filters, spoiler setting, roadmap and
// progress export/import. Everything runs offline; the only files it loads
// are its own data/trophies.json and data/roadmap.json. Source links in the
// detail panel are plain <a> links: they open only when the reader follows
// them, and this script never fetches them.

const STORAGE_KEY = 'gta6-trophy-checklist-v1';
const SPOILER_KEY = 'gta6-trophy-spoilers-v1';

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const earnedEl = document.getElementById('earnedFilter');
const chipsEl = document.getElementById('kindChips');
const spoilerEl = document.getElementById('spoilerToggle');
const onlineNoteEl = document.getElementById('onlineNote');
const resultCountEl = document.getElementById('resultCount');
const progressEarnedEl = document.getElementById('progressEarned');
const progressFillEl = document.getElementById('progressFill');
const progressCountsEl = document.getElementById('progressCounts');

let trophies = [];
let earned = new Set(loadEarned());
let selectedId = null;
let activeKind = 'all';

spoilerEl.checked = loadSpoiler();

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function loadSpoiler() {
  const raw = localStorage.getItem(SPOILER_KEY);
  return raw === null ? true : raw === '1';
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? '1' : '0');
}

function isStorySpoiler(trophy) {
  return spoilerEl.checked && trophy.kind === 'story' && !earned.has(trophy.name);
}

function displayName(trophy) {
  return isStorySpoiler(trophy) ? 'Hidden story trophy' : trophy.name;
}

function displayDescription(trophy) {
  return isStorySpoiler(trophy)
    ? 'Hidden on PlayStation until earned. Turn off “Hide story spoilers” to read it, or tick it off once you have earned it in the game.'
    : trophy.description;
}

function trophyMatches(trophy) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (earnedEl.value === 'earned' && !earned.has(trophy.name)) return false;
  if (earnedEl.value === 'unearned' && earned.has(trophy.name)) return false;
  if (activeKind === 'missable') return trophy.missable === true;
  if (activeKind === 'online') return false;
  if (activeKind !== 'all' && trophy.kind !== activeKind) return false;
  return true;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  const labels = {
    story: 'Story', collectibles: 'Collectibles', activities: 'Activities',
    crime: 'Crime', side: 'Side quest', misc: 'Miscellaneous', online: 'Online',
  };
  return labels[kind] ?? kind;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  progressEarnedEl.textContent = String(done);
  progressFillEl.style.width = total ? `${(done / total) * 100}%` : '0%';
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const n = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${gradeLabel(g)} ${n}/${all}`;
  });
  progressCountsEl.textContent = byGrade.join(' · ');
}

function renderList() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  for (const trophy of shown) {
    const item = document.createElement('li');
    item.className = 'trophy-row' + (earned.has(trophy.name) ? ' is-earned' : '');
    item.dataset.id = String(trophy.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Earned: ${trophy.name}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned();
      renderProgress();
      renderList();
      renderDetail();
    });

    const body = document.createElement('button');
    body.type = 'button';
    body.className = 'trophy-body';
    body.addEventListener('click', () => {
      selectedId = trophy.id;
      renderDetail();
      listEl.querySelectorAll('.is-selected').forEach((el) => el.classList.remove('is-selected'));
      item.classList.add('is-selected');
    });

    const dot = document.createElement('span');
    dot.className = `grade-dot grade-${trophy.grade}`;
    dot.title = gradeLabel(trophy.grade);
    dot.textContent = trophy.grade === 'platinum' ? 'P' : trophy.grade.charAt(0).toUpperCase();

    const texts = document.createElement('span');
    texts.className = 'trophy-texts';
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy);
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(trophy);
    texts.append(name, desc);

    const badges = document.createElement('span');
    badges.className = 'trophy-badges';
    if (trophy.hidden) badges.append(badge('Hidden'));
    if (trophy.missable) badges.append(badge('Missable', 'badge-missable'));
    if (trophy.unconfirmed) badges.append(badge('Unconfirmed', 'badge-unconfirmed'));
    if (trophy.count !== null && trophy.count !== undefined) {
      badges.append(badge(`× ${trophy.count}`, 'badge-count'));
    }
    badges.append(badge(kindLabel(trophy.kind), 'badge-kind'));

    body.append(dot, texts, badges);
    item.append(box, body);
    listEl.append(item);
  }
  resultCountEl.textContent = activeKind === 'online'
    ? '0 trophies — GTA VI has no online trophies.'
    : `${shown.length} of ${trophies.length} trophies shown`;
  onlineNoteEl.hidden = activeKind !== 'online';
}

function badge(text, extraClass = '') {
  const el = document.createElement('span');
  el.className = `badge ${extraClass}`.trim();
  el.textContent = text;
  return el;
}

function renderDetail() {
  const trophy = trophies.find((t) => t.id === selectedId);
  detailEl.replaceChildren();
  if (!trophy) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy to read its guide and sources.';
    detailEl.append(p);
    return;
  }
  if (isStorySpoiler(trophy)) {
    const h = document.createElement('h3');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.textContent = 'This trophy is hidden on PlayStation until earned, and the spoiler setting is on. Turn off “Hide story spoilers” above to read its name, description and guide — or tick it off once you have earned it in the game.';
    detailEl.append(h, p);
    return;
  }

  const h = document.createElement('h3');
  h.textContent = trophy.name;
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = `${gradeLabel(trophy.grade)} · ${kindLabel(trophy.kind)}${trophy.hidden ? ' · Hidden on PlayStation' : ''}${trophy.count !== null && trophy.count !== undefined ? ` · Count: ${trophy.count}` : ''} · Roadmap stage ${trophy.stage}`;
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = `Official description: “${trophy.description}”`;
  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'detail-warning';
    warn.textContent = '⚠ Missable — read the guide below before you pass Chapter 1. This is the only trophy any source flags as possibly missable.';
    detailEl.append(h, meta, desc, warn);
  } else {
    detailEl.append(h, meta, desc);
  }
  if (trophy.unconfirmed) {
    const note = document.createElement('p');
    note.className = 'detail-warning';
    note.textContent = 'Method not yet confirmed by any source — this guide says what is known and what is only believed, instead of guessing.';
    detailEl.append(note);
  }
  const guideTitle = document.createElement('h4');
  guideTitle.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = trophy.guide;
  const srcTitle = document.createElement('h4');
  srcTitle.textContent = 'Sources';
  const srcList = document.createElement('ul');
  srcList.className = 'detail-sources';
  for (const source of trophy.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = source.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = source.name;
    li.append(a);
    srcList.append(li);
  }
  const earnedState = document.createElement('p');
  earnedState.className = 'detail-state';
  earnedState.textContent = earned.has(trophy.name) ? '✓ Earned — ticked in your checklist.' : 'Not earned yet — tick the box in the list when you earn it.';
  detailEl.append(guideTitle, guide, srcTitle, srcList, earnedState);
}

function renderRoadmap(roadmap) {
  const factsEl = document.getElementById('roadmapFacts');
  const facts = roadmap.facts;
  const entries = [
    ['Difficulty', facts.difficulty],
    ['Time to platinum', facts.time],
    ['Playthroughs', String(facts.playthroughs)],
    ['Story chapters', String(facts.chapters)],
    ['Online trophies', String(facts.online)],
    ['Missable', facts.missable],
    ['Cheats', facts.cheats],
    ['Saves', facts.saves],
  ];
  for (const [term, value] of entries) {
    const wrap = document.createElement('div');
    wrap.className = 'fact';
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    wrap.append(dt, dd);
    factsEl.append(wrap);
  }
  const stagesEl = document.getElementById('roadmapStages');
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    li.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage.n} — ${stage.title}`;
    const hours = document.createElement('p');
    hours.className = 'stage-hours';
    hours.textContent = stage.hours;
    const text = document.createElement('p');
    text.textContent = stage.text;
    li.append(h, hours, text);
    stagesEl.append(li);
  }
  const listEl100 = document.getElementById('checklist100');
  for (const group of roadmap.checklist) {
    const h = document.createElement('h4');
    h.textContent = group.group;
    const ul = document.createElement('ul');
    for (const item of group.items) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    }
    listEl100.append(h, ul);
  }
  const sourceLink = document.getElementById('roadmapSource');
  sourceLink.href = roadmap.sourceUrl;
  sourceLink.textContent = roadmap.source;
}

function exportProgress() {
  const data = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('not a progress file');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
    saveEarned();
    renderProgress();
    renderList();
    renderDetail();
  } catch {
    alert('That file is not a valid trophy-progress export.');
  }
}

chipsEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-kind]');
  if (!button) return;
  activeKind = button.dataset.kind;
  chipsEl.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c === button));
  renderList();
});
searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
earnedEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => {
  saveSpoiler();
  renderList();
  renderDetail();
});
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importInput').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveEarned();
  renderProgress();
  renderList();
  renderDetail();
});

const [trophyDoc, roadmapDoc] = await Promise.all([
  (await fetch('data/trophies.json')).json(),
  (await fetch('data/roadmap.json')).json(),
]);
trophies = trophyDoc.trophies;
renderRoadmap(roadmapDoc);
renderProgress();
renderList();
renderDetail();
