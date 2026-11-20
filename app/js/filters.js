// Filtering and the spoiler rule for the Leonida Trophy Guide.
// A trophy is spoiler-hidden when the spoiler setting is on, the trophy is
// hidden on PlayStation (or a story trophy), and it has not been earned yet.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  'side-quests': 'Side quests',
  robbery: 'Robbery',
  money: 'Money',
  combat: 'Combat',
  misc: 'Hidden & misc',
  completion: '100% completion',
  platinum: 'Platinum',
};

export function isSpoilerHidden(trophy, earned, spoilersHidden) {
  if (!spoilersHidden) return false;
  if (earned.has(trophy.name)) return false;
  return trophy.hidden === true || trophy.kinds.includes('story');
}

export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  return trophy.kinds.includes(kind);
}

export function trophyMatchesSearch(trophy, query) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, ...(trophy.sources || [])]
    .join(' ')
    .toLowerCase();
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

export function applyFilters(trophies, earned, filters) {
  return trophies.filter((trophy) => {
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (!trophyMatchesKind(trophy, filters.kind)) return false;
    if (!trophyMatchesSearch(trophy, filters.search)) return false;
    if (filters.hideEarned && earned.has(trophy.name)) return false;
    return true;
  });
}

export function countByGrade(trophies, earned) {
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  return grades.map((grade) => {
    const total = trophies.filter((t) => t.grade === grade).length;
    const done = trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
    return { grade, done, total };
  });
}

export function nextUnearnedStoryTrophy(trophies, earned) {
  return trophies.find((t) => t.kinds.includes('story') && !earned.has(t.name)) || null;
}
