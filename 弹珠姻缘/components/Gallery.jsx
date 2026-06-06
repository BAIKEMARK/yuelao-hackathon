"use client";

import { useEffect, useState } from "react";
import { readGallery } from "../lib/galleryStorage.js";

export default function Gallery({ onBack }) {
  const [records, setRecords] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const saved = readGallery(window.localStorage);
    setRecords(saved);
    setActiveId(saved[0]?.id || null);
  }, []);

  const activeRecord = records.find((record) => record.id === activeId);

  return (
    <section className="screen-stack">
      <div className="screen-header">
        <button className="text-button" type="button" onClick={onBack}>
          返回
        </button>
        <div>
          <p className="eyebrow">CP 图鉴</p>
          <h2>已经撞出的缘分</h2>
        </div>
      </div>
      {records.length ? (
        <div className="gallery-layout">
          <div className="gallery-list">
            {records.map((record) => (
              <button
                className={`gallery-item ${record.id === activeId ? "is-active" : ""}`}
                key={record.id}
                type="button"
                onClick={() => setActiveId(record.id)}
              >
                <strong>
                  {record.cueName} × {record.targetName}
                </strong>
                <span>{record.relationshipTag}</span>
              </button>
            ))}
          </div>
          {activeRecord ? (
            <article className="gallery-detail">
              <p className="eyebrow">{activeRecord.relationshipTag}</p>
              <h3>{activeRecord.title}</h3>
              <p>{activeRecord.story}</p>
              <small>{new Date(activeRecord.createdAt).toLocaleString("zh-CN")}</small>
            </article>
          ) : null}
        </div>
      ) : (
        <div className="empty-state">
          <p>图鉴还空着。先去撞一局，把第一段 CP 档案收进来。</p>
        </div>
      )}
    </section>
  );
}
