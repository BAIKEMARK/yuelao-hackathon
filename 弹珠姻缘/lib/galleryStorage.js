export const STORAGE_KEY = "marble_cp_gallery_v1";

export function readGallery(storage) {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGalleryRecord(storage, record) {
  if (!storage) {
    return [record];
  }

  const nextRecords = [record, ...readGallery(storage)];
  storage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  return nextRecords;
}

export function createGalleryRecord({
  cue,
  target,
  archive,
  hitCount,
  tieBreak,
  noHit,
  createdAt = new Date().toISOString()
}) {
  const id = `${Date.parse(createdAt) || Date.now()}-${cue.name}-${target.name}`;

  return {
    id,
    cueName: cue.name,
    targetName: target.name,
    title: archive.title,
    relationshipTag: archive.relationshipTag,
    story: archive.story,
    yuelaoComment: archive.yuelaoComment,
    hitCount,
    tieBreak,
    noHit,
    createdAt
  };
}
