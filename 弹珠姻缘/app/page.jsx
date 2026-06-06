"use client";

import { useState } from "react";
import CharacterSelect from "../components/CharacterSelect.jsx";
import Gallery from "../components/Gallery.jsx";
import MarbleBoard from "../components/MarbleBoard.jsx";
import ResultCard from "../components/ResultCard.jsx";
import StartScreen from "../components/StartScreen.jsx";
import { findCharacter } from "../lib/characters.js";

export default function HomePage() {
  const [screen, setScreen] = useState("start");
  const [round, setRound] = useState(null);
  const [boardResult, setBoardResult] = useState(null);
  const [archive, setArchive] = useState(null);
  const [error, setError] = useState("");
  const [savedRecordId, setSavedRecordId] = useState("");

  function startSelection() {
    setArchive(null);
    setBoardResult(null);
    setError("");
    setSavedRecordId("");
    setScreen("select");
  }

  function handleSelect(selection) {
    setRound(selection);
    setScreen("board");
  }

  async function generateArchive(resultOverride = boardResult) {
    const currentResult = resultOverride;
    const target = currentResult ? findCharacter(currentResult.winnerId) : null;

    if (!round || !target || !currentResult) {
      setError("本局结果不完整，请重新开始。");
      return;
    }

    setScreen("generating");
    setError("");
    setBoardResult(currentResult);

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cue: round.cue,
          target,
          hitCount: currentResult.hitCount,
          tieBreak: currentResult.tieBreak,
          noHit: currentResult.noHit
        })
      });

      if (!response.ok) {
        throw new Error("生成失败");
      }

      const nextArchive = await response.json();
      setArchive(nextArchive);
      setScreen("result");
    } catch {
      setError("AI 姻缘档案暂时没有写成。请确认 API_KEY 后重试。");
    }
  }

  function handleBoardComplete(result) {
    generateArchive(result);
  }

  const target = boardResult ? findCharacter(boardResult.winnerId) : null;

  return (
    <main className="app-shell">
      {screen === "start" ? <StartScreen onStart={startSelection} onOpenGallery={() => setScreen("gallery")} /> : null}
      {screen === "select" ? <CharacterSelect onSelect={handleSelect} onBack={() => setScreen("start")} /> : null}
      {screen === "board" && round ? (
        <MarbleBoard cue={round.cue} targets={round.targets} onComplete={handleBoardComplete} onBack={() => setScreen("select")} />
      ) : null}
      {screen === "generating" && round && target ? (
        <section className="generating-card">
          <p className="eyebrow">姻缘簿正在翻页</p>
          <h2>
            {round.cue.name} × {target.name}
          </h2>
          <div className="ink-loader" />
          {error ? <p className="error-text">{error}</p> : <p>AI 正在把这局相遇写成档案。</p>}
          {error ? (
            <div className="result-actions">
              <button className="primary-button" type="button" onClick={() => generateArchive()}>
                重试生成
              </button>
              <button className="ghost-button" type="button" onClick={startSelection}>
                重新开始
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
      {screen === "result" && round && target && archive && boardResult ? (
        <ResultCard
          cue={round.cue}
          target={target}
          archive={archive}
          result={boardResult}
          onSaved={(record) => setSavedRecordId(record.id)}
          onRestart={startSelection}
          onOpenGallery={() => setScreen("gallery")}
        />
      ) : null}
      {screen === "gallery" ? <Gallery onBack={() => setScreen("start")} /> : null}
      {savedRecordId ? <div className="toast">已存入 CP 图鉴</div> : null}
    </main>
  );
}
