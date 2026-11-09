const KEY = 'our-little-journey:photos:v1';

export function readJourneyProgress(memories) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved || !Array.isArray(saved.unlockedIds)) return null;
    const firstLocked = memories.findIndex((memory, index) => saved.unlockedIds[index] !== memory.id);
    const completed = firstLocked < 0 ? memories.length : firstLocked;
    const index = memories.findIndex(({ id }) => id === saved.checkpointId);
    if (index < 0 || index > completed || index < completed - 1) return null;
    const finale = completed === memories.length && ['open', 'complete'].includes(saved.finale) ? saved.finale : null;
    return { index, completed, finale, endingViewed: finale === 'complete' && saved.endingViewed === true };
  } catch {
    return null;
  }
}

export function saveJourneyProgress(checkpoints, finale = null) {
  try {
    const { current, memories, completed } = checkpoints;
    localStorage.setItem(KEY, JSON.stringify({
      checkpointId: current.id,
      unlockedIds: memories.slice(0, completed).map(({ id }) => id),
      finale,
    }));
  } catch {
    // The current run can still continue when storage is unavailable.
  }
}

export function clearJourneyProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

export function markEndingViewed() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.finale === 'complete') {
      localStorage.setItem(KEY, JSON.stringify({ ...saved, endingViewed: true }));
    }
  } catch {
    // The ending is still playable without browser storage.
  }
}
