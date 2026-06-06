import assert from "node:assert/strict";
import test from "node:test";
import { createGalleryRecord, readGallery, saveGalleryRecord, STORAGE_KEY } from "../lib/galleryStorage.js";

function createFakeStorage(initialValue = null) {
  const state = new Map();
  if (initialValue !== null) {
    state.set(STORAGE_KEY, initialValue);
  }

  return {
    getItem(key) {
      return state.has(key) ? state.get(key) : null;
    },
    setItem(key, value) {
      state.set(key, value);
    }
  };
}

test("readGallery returns empty list when storage is empty or invalid", () => {
  assert.deepEqual(readGallery(createFakeStorage()), []);
  assert.deepEqual(readGallery(createFakeStorage("{broken")), []);
});

test("saveGalleryRecord prepends a new record and preserves existing records", () => {
  const storage = createFakeStorage(JSON.stringify([{ id: "old", cueName: "林黛玉" }]));
  const record = { id: "new", cueName: "孙悟空", targetName: "薛宝钗", story: "一段新故事" };

  const saved = saveGalleryRecord(storage, record);

  assert.equal(saved.length, 2);
  assert.equal(saved[0].id, "new");
  assert.equal(saved[1].id, "old");
  assert.deepEqual(readGallery(storage), saved);
});

test("createGalleryRecord serializes cp archive fields", () => {
  const record = createGalleryRecord({
    cue: { name: "林黛玉" },
    target: { name: "孙悟空" },
    archive: {
      title: "花影撞入山门",
      relationshipTag: "欢喜冤家",
      story: "她一挑眉，他便认真学会停步。",
      yuelaoComment: "这局有点吵，但不算坏。"
    },
    hitCount: 4,
    tieBreak: false,
    noHit: false,
    createdAt: "2026-06-06T12:00:00.000Z"
  });

  assert.equal(record.cueName, "林黛玉");
  assert.equal(record.targetName, "孙悟空");
  assert.equal(record.title, "花影撞入山门");
  assert.equal(record.relationshipTag, "欢喜冤家");
  assert.equal(record.hitCount, 4);
  assert.equal(record.createdAt, "2026-06-06T12:00:00.000Z");
});
