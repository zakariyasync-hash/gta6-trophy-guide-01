// Rendering for the Leonida Trophy Guide: the checklist, the guide pane,
// the platinum roadmap and the missable-trophy page. All text comes from
// app/data/trophies.json; this file only turns it into HTML.
import { countByGrade, isSpoilerHidden, KIND_LABELS, nextUnearnedStoryTrophy } from './filters.js';

const GRADE_DOT = { platinum: '◆', gold: '◆', silver: '◆', bronze: '◆' };
const GRADE_WORD = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

export function renderProgress(trophies, earned) {
  const done = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('earnedCount').textContent = String(done);
  document.getElementById('progressFill').style.width = `${Math.round((done / trophies.length) * 100)}%`;
  document.getElementById('progressPct').textContent =
    `${Math.round((done / trophies.length) * 100)}% to the platinum — ${trophies.length - done} to go`;
  const counts = countByGrade(trophies, earned);
  document.getElementById('gradeCounts').innerHTML = counts
    .map((c) => `<li>${GRADE_WORD[c.grade]} ${c.done}/${c.total}</li>`)
    .join('');
  const next = nextUnearnedStoryTrophy(trophies, earned);
  document.getElementById('nextUp').innerHTML = next
    ? `Next story trophy: <strong>${escapeHtml(next.name)}</strong> — ${escapeHtml(next.description)}`
    : done >= trophies.length
      ? '<strong>Platinum earned — you are a Leonida Legend.</strong>'
      : 'Story complete — clean up the side trophies below.';
}

function pill(trophy) {
  const bits = [`<span class="pill grade-${trophy.grade}">${GRADE_WORD[trophy.grade]}</span>`];
  if (trophy.hidden) bits.push('<span class="pill hidden-flag">Hidden</span>');
  if (trophy.missable) bits.push('<span class="pill missable">Missable</span>');
  if (trophy.status === 'unconfirmed') bits.push('<span class="pill unconfirmed">Unconfirmed</span>');
  if (trophy.status === 'reported') bits.push('<span class="pill reported">Reported</span>');
  return bits.join('');
}

function kindPills(trophy) {
  // The grade pill and the Missable pill already cover the 'platinum' and
  // 'missable' kinds, so leave those out here instead of showing them twice.
  return trophy.kinds
    .filter((kind) => kind !== 'platinum' && kind !== 'missable')
    .map((kind) => `<span class="pill">${KIND_LABELS[kind] || kind}</span>`)
    .join('');
}

export function renderChecklist(trophies, visible, earned, spoilersHidden, selectedId, onToggle, onSelect) {
  const list = document.getElementById('trophyList');
  list.replaceChildren();
  document.getElementById('listHeading').textContent =
    `${visible.length} of ${trophies.length} trophies shown`;
  document.getElementById('filterNote').textContent =
    visible.length === 0
      ? 'No trophies match these filters — clear the search or widen the grade and kind.'
      : '';
  for (const trophy of visible) {
    const hidden = isSpoilerHidden(trophy, earned, spoilersHidden);
    const li = document.createElement('li');
    li.className = 'trophy-row' + (earned.has(trophy.name) ? ' is-earned' : '') + (trophy.id === selectedId ? ' is-selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Earned: ${trophy.name}`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      onToggle(trophy);
    });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = hidden ? 'Hidden trophy' : trophy.name;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = hidden ? 'Spoiler hidden — earn it, or turn “Hide spoilers” off.' : trophy.description;
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.innerHTML = hidden ? pill(trophy) : pill(trophy) + kindPills(trophy);
    body.append(name, desc, meta);
    const dot = document.createElement('span');
    dot.className = `grade-dot ${trophy.grade}`;
    dot.textContent = GRADE_DOT[trophy.grade];
    dot.title = GRADE_WORD[trophy.grade];
    li.append(box, body, dot);
    li.addEventListener('click', (event) => {
      if (event.target !== box) onSelect(trophy);
    });
    list.append(li);
  }
}

export function renderDetail(trophy, earned, spoilersHidden, onToggle) {
  const pane = document.getElementById('detailPane');
  if (!trophy) {
    pane.innerHTML = '<p class="detail-empty">Pick a trophy on the left to read its guide.</p>';
    return;
  }
  const hidden = isSpoilerHidden(trophy, earned, spoilersHidden);
  const isEarned = earned.has(trophy.name);
  const countLine = trophy.count
    ? `<p><strong>Target:</strong> ${trophy.count.toLocaleString('en-US')} — tracked by PlayStation.</p>`
    : '';
  const stageLine = `<p><strong>Roadmap stage:</strong> Stage ${trophy.stage} of 3.</p>`;
  const missableBox = trophy.missable
    ? `<div class="missable-box"><strong>Missable — read this first.</strong> ${escapeHtml(trophy.missable_reason || '')}</div>`
    : '';
  const statusBox =
    trophy.status === 'unconfirmed'
      ? '<div class="unconfirmed-box"><strong>Belum terkonfirmasi.</strong> No guide has confirmed this method yet — this guide says so instead of guessing.</div>'
      : trophy.status === 'reported'
        ? '<div class="unconfirmed-box"><strong>Reported, not yet confirmed.</strong> One source reports this method; a second guide has not confirmed it yet.</div>'
        : '';
  pane.innerHTML = `
    <h2>${hidden ? 'Hidden trophy' : escapeHtml(trophy.name)}</h2>
    <div class="trophy-meta">${pill(trophy)}${hidden ? '' : kindPills(trophy)}</div>
    <p class="detail-official">${hidden ? 'Spoiler hidden — earn it, or turn “Hide spoilers” off.' : `Official description: “${escapeHtml(trophy.description)}”`}</p>
    ${missableBox}
    ${statusBox}
    ${hidden ? '<p class="spoiler-hidden">The guide for this trophy is hidden with its name. Earn the trophy in-game (or turn spoilers off) to read it here.</p>' : `<div class="detail-guide"><p>${escapeHtml(trophy.guide)}</p></div>`}
    ${hidden ? '' : countLine + stageLine}
    <p class="source-line"><strong>Sources:</strong> ${trophy.sources.map(escapeHtml).join(' · ')} — named beside the guide, never copied. Names, descriptions and grades: the official PS5 list via Exophase and PSNProfiles.</p>
    <div class="detail-actions">
      <button type="button" id="detailToggle">${isEarned ? 'Mark as not earned' : 'Mark as earned'}</button>
      <button type="button" class="secondary" id="detailNext">Next trophy</button>
    </div>`;
  document.getElementById('detailToggle').addEventListener('click', () => onToggle(trophy));
  document.getElementById('detailNext').addEventListener('click', () => {
    const event = new CustomEvent('leonida-next-trophy', { detail: { id: trophy.id } });
    document.dispatchEvent(event);
  });
}

const STAGE_INFO = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story',
    time: '60–80 hours · 22 trophies',
    intro: 'Finish the 5 chapters and start the side questlines as they open. Scan vehicles and study animals as you go — the checklist counts it later.',
  },
  {
    stage: 2,
    title: 'Stage 2 — The 100% checklist',
    time: 'About 100 hours · 24 trophies',
    intro: 'After the credits, open Progress, Stats, 100% Completion and work the list: robberies, ranges, drone races, stunts, challenges and collections. Only 70 of 80 challenges are needed.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Strangers & cleanup',
    time: 'About 10 hours · 9 trophies',
    intro: 'Finish the 8 stranger strands, then sweep up the one-off hidden trophies and the last money and combat trophies. The platinum pops with the last one.',
  },
];

export function renderRoadmap(trophies, earned) {
  const host = document.getElementById('roadmapStages');
  host.replaceChildren();
  for (const info of STAGE_INFO) {
    const members = trophies.filter((t) => t.stage === info.stage);
    const done = members.filter((t) => earned.has(t.name)).length;
    const card = document.createElement('article');
    card.className = 'stage';
    const listItems = members
      .map(
        (t) =>
          `<li class="${earned.has(t.name) ? 'is-earned' : ''}">${escapeHtml(t.name)} — ${GRADE_WORD[t.grade]}${t.missable ? ' · Missable' : ''}</li>`,
      )
      .join('');
    card.innerHTML = `
      <h3>${info.title}</h3>
      <p class="stage-time">${info.time}</p>
      <p>${info.intro}</p>
      <p class="stage-count">${done} of ${members.length} earned in this stage</p>
      <ul>${listItems}</ul>`;
    host.append(card);
  }
}

export function renderMissable(trophies, earned) {
  const host = document.getElementById('missableList');
  host.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  for (const trophy of flagged) {
    const card = document.createElement('article');
    card.className = 'stage';
    card.innerHTML = `
      <h3>${escapeHtml(trophy.name)} — ${GRADE_WORD[trophy.grade]}</h3>
      <p class="detail-official">Official description: “${escapeHtml(trophy.description)}”</p>
      <p><strong>${escapeHtml(trophy.missable_reason || '')}</strong></p>
      <p>${escapeHtml(trophy.guide)}</p>
      <p class="source-line"><strong>Sources:</strong> ${trophy.sources.map(escapeHtml).join(' · ')}</p>
      <p>${earned.has(trophy.name) ? 'Earned — safe.' : 'Not earned yet — do the Chapter 1 meditation before Chapter 1 ends.'}</p>`;
    host.append(card);
  }
  if (flagged.length === 0) {
    host.innerHTML = '<p>No trophy is flagged missable.</p>';
  }
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
