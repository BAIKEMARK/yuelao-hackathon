import { characters, splitCueAndTargets } from "../lib/characters.js";

export default function CharacterSelect({ onSelect, onBack }) {
  return (
    <section className="screen-stack">
      <div className="screen-header">
        <button className="text-button" type="button" onClick={onBack}>
          返回
        </button>
        <div>
          <p className="eyebrow">第一步</p>
          <h2>选一个母球角色</h2>
        </div>
      </div>
      <div className="character-grid">
        {characters.map((character) => (
          <button
            className="character-card"
            key={character.id}
            type="button"
            onClick={() => onSelect(splitCueAndTargets(character.id))}
          >
            <span className="character-orb" style={{ "--orb-color": character.color }}>
              {character.name.slice(0, 1)}
            </span>
            <span className="character-name">{character.name}</span>
            <span className="character-source">{character.source}</span>
            <span className="character-tag">{character.tag}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
