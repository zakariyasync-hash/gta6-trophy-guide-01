// Progress and settings storage for the Leonida Trophy Guide.
// Earned ticks and the spoiler setting live in localStorage only; nothing
// leaves the browser except through the explicit Export button.
export const EARNED_KEY = 'leonida-trophy-guide-earned-v1';
export const SETTINGS_KEY = 'leonida-trophy-guide-settings-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((name) => typeof name === 'string'));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort()));
}

export function loadSettings() {
  const fallback = { spoilersHidden: true, hideEarned: false, grade: 'all', kind: 'all', search: '' };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function buildExportPayload(earned) {
  return {
    app: 'Leonida Trophy Guide',
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
}

export function downloadExport(earned) {
  const payload = buildExportPayload(earned);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-trophy-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload.earned.length;
}

// Parse an imported progress file. Returns { earned, rejected } where
// rejected counts names that are not trophies in this guide.
export function parseImportFile(text, knownNames) {
  const parsed = JSON.parse(text);
  const rawList = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(rawList)) throw new Error('not a progress file');
  const earned = new Set();
  let rejected = 0;
  for (const name of rawList) {
    if (typeof name === 'string' && knownNames.has(name)) earned.add(name);
    else rejected += 1;
  }
  return { earned, rejected };
}
