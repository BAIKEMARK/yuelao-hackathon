import { createGalleryRecord, saveGalleryRecord } from "../lib/galleryStorage.js";

export default function ResultCard({ cue, target, archive, result, onSaved, onRestart, onOpenGallery }) {
  function handleSave() {
    const record = createGalleryRecord({
      cue,
      target,
      archive,
      hitCount: result.hitCount,
      tieBreak: result.tieBreak,
      noHit: result.noHit
    });
    saveGalleryRecord(window.localStorage, record);
    onSaved(record);
  }

  return (
    <section className="archive-card">
      <p className="eyebrow">姻缘簿已落款</p>
      <h2>{archive.title}</h2>
      <div className="cp-line">
        <span>{cue.name}</span>
        <b>×</b>
        <span>{target.name}</span>
      </div>
      <span className="relationship-tag">{archive.relationshipTag}</span>
      <p className="story-text">{archive.story}</p>
      <div className="archive-meta">
        <p>{result.noHit ? "红绳簿自动补签" : `相遇记录：${result.hitCount} 次`}</p>
        {result.tieBreak ? <p>命运最后一撞锁定本局 CP</p> : null}
        <p>月老批注：{archive.yuelaoComment}</p>
      </div>
      <div className="result-actions">
        <button className="primary-button" type="button" onClick={handleSave}>
          存入图鉴
        </button>
        <button className="ghost-button" type="button" onClick={onRestart}>
          再撞一次
        </button>
        <button className="ghost-button" type="button" onClick={onOpenGallery}>
          查看图鉴
        </button>
      </div>
    </section>
  );
}
