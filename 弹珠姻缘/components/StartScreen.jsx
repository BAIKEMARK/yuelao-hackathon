export default function StartScreen({ onStart, onOpenGallery }) {
  return (
    <section className="hero-screen">
      <div className="moon-badge">月老今日罢工</div>
      <h1>红绳懒得系，弹珠自己撞</h1>
      <p className="hero-copy">选一个名著角色当母球，拖进姻缘盘，只发射一次。撞谁最多，谁就进本局 CP 档案。</p>
      <div className="hero-actions">
        <button className="primary-button" type="button" onClick={onStart}>
          开始撞姻缘
        </button>
        <button className="ghost-button" type="button" onClick={onOpenGallery}>
          CP 图鉴
        </button>
      </div>
    </section>
  );
}
