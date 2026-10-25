import { CURRICULUM, TALAS, TAMIL_SWARAS } from "./content.js?v=29";

const content = document.querySelector("#booklet-content");
const printableSections = CURRICULUM.filter((section) => section.order <= 6 && section.status !== "next");

const noteParts = (note) => ({
  base: note.replace(/[+-]$/, ""),
  octave: note.endsWith("+") ? "upper" : note.endsWith("-") ? "lower" : ""
});

const noteMarkup = (note, script) => {
  const { base, octave } = noteParts(note);
  const isHold = base === "~";
  const text = isHold ? "," : script === "tamil" ? TAMIL_SWARAS[base] : base;
  return `<span class="note ${script} ${octave} ${isHold ? "hold" : ""}">${text}</span>`;
};

const rowMarkup = (phrase, tala) => {
  let offset = 0;
  const groups = tala.groups.map((size, groupIndex) => {
    const notes = phrase.notes.slice(offset, offset + size);
    offset += size;
    return `
      <div class="anga ${groupIndex === tala.groups.length - 1 ? "cycle-end" : ""}" style="--beats:${size}">
        <div class="note-line" lang="ta">${notes.map((note) => noteMarkup(note, "tamil")).join("")}</div>
        <div class="note-line" aria-label="English transliteration">${notes.map((note) => noteMarkup(note, "english")).join("")}</div>
      </div>`;
  }).join("");

  return `
    <div class="notation-row">
      <div class="line-label"><strong lang="ta">${phrase.tamilLabel}</strong><small>${phrase.label}</small></div>
      <div class="notation-groups">${groups}</div>
    </div>`;
};

content.innerHTML = printableSections.map((section) => `
  <section class="book-section">
    <header class="section-heading">
      <span>${String(section.order).padStart(2, "0")}</span>
      <div>
        <p>Foundation curriculum</p>
        <h2>${section.title}</h2>
        <h3 lang="ta">${section.tamilTitle}</h3>
      </div>
      <small>${section.lessons.length} lessons</small>
    </header>

    <div class="lesson-stack">
      ${section.lessons.map((lesson) => {
        const tala = TALAS[lesson.talaId];
        return `
          <article class="print-lesson">
            <header class="lesson-head">
              <span class="lesson-number">${String(lesson.sequence).padStart(2, "0")}</span>
              <div>
                <h4 lang="ta">${lesson.tamilTitle}</h4>
                <p>${lesson.title}</p>
              </div>
              <div class="lesson-meta">
                <strong>${tala.name}</strong>
                <span>${tala.groups.join(" + ")} · ${tala.beats} beats</span>
              </div>
            </header>
            <div class="notation-block">${lesson.phrases.map((phrase) => rowMarkup(phrase, tala)).join("")}</div>
          </article>`;
      }).join("")}
    </div>

    <footer class="page-note">
      <span>SWAR, music and more - Carnatic basics</span>
      <span>${String(section.order).padStart(2, "0")} · ${section.title}</span>
    </footer>
  </section>`).join("");

document.querySelector("#print-button").addEventListener("click", () => window.print());
