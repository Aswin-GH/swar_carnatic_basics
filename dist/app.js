import { CURRICULUM, RAGAS, SHRUTIS, TALAS, TAMIL_SWARAS } from "./content.js?v=33";

const state = {
  sectionId: "sarali",
  lessonId: "sarali-01",
  ragaId: "mayamalavagowla",
  talaId: "adi",
  speed: 1,
  shrutiId: "C4",
  sound: "violin",
  sustain: true,
  tempo: 72,
  notationPage: 0,
  cyclesPerPage: 2,
  totalCycles: 1,
  playing: false,
  noteIndex: -1,
  timer: null,
  handTimers: [],
  audioContext: null,
  masterGain: null,
  playSequence: []
};

const elements = {
  library: document.querySelector("#lesson-library"),
  lessonCount: document.querySelector("#lesson-count"),
  raga: document.querySelector("#raga-select"),
  tala: document.querySelector("#tala-select"),
  speed: document.querySelector("#speed-select"),
  shruti: document.querySelector("#shruti-select"),
  sound: document.querySelector("#sound-select"),
  sustain: document.querySelector("#sustain-toggle"),
  sustainControl: document.querySelector("#sustain-control"),
  sectionName: document.querySelector("#section-name"),
  lessonNumber: document.querySelector("#lesson-number"),
  lessonTitle: document.querySelector("#lesson-title"),
  lessonDescription: document.querySelector("#lesson-description"),
  lessonScale: document.querySelector("#lesson-scale"),
  tamilTitle: document.querySelector("#tamil-title"),
  englishSubtitle: document.querySelector("#english-subtitle"),
  octaveKeyLabel: document.querySelector("#octave-key-label"),
  talaTrack: document.querySelector("#tala-track"),
  sheet: document.querySelector("#notation-sheet"),
  play: document.querySelector("#play-button"),
  playLabel: document.querySelector(".play-label"),
  handCue: document.querySelector("#tala-hand-cue"),
  handSprite: document.querySelector("#tala-hand-sprite"),
  handLabel: document.querySelector("#tala-hand-label"),
  cycleLabel: document.querySelector("#cycle-label"),
  beatLabel: document.querySelector("#beat-label"),
  progress: document.querySelector("#progress-bar"),
  pager: document.querySelector("#notation-pager"),
  pageBack: document.querySelector("#page-back"),
  pageNext: document.querySelector("#page-next"),
  pageLabel: document.querySelector("#page-label"),
  tempoOutput: document.querySelector("#tempo-output"),
  tempoDown: document.querySelector("#tempo-down"),
  tempoUp: document.querySelector("#tempo-up"),
  sourceButton: document.querySelector("#source-button"),
  sourceDialog: document.querySelector("#source-dialog"),
  dialogClose: document.querySelector("#dialog-close"),
  guideButton: document.querySelector("#guide-button"),
  guideDialog: document.querySelector("#guide-dialog"),
  exploreButton: document.querySelector("#explore-button"),
  exploreDialog: document.querySelector("#explore-dialog")
};

function currentSection() {
  return CURRICULUM.find((section) => section.id === state.sectionId) ?? CURRICULUM[0];
}

function currentLesson() {
  const section = currentSection();
  return section.lessons.find((lesson) => lesson.id === state.lessonId) ?? section.lessons[0];
}

function persistPreferences() {
  localStorage.setItem(
    "srishti-swara-preferences",
    JSON.stringify({
      ragaId: state.ragaId,
      speed: state.speed,
      shrutiId: state.shrutiId,
      sound: state.sound,
      sustain: state.sustain,
      tempo: state.tempo
    })
  );
}

function restorePreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem("srishti-swara-preferences") || "null");
    if (!saved) return;
    if (RAGAS[saved.ragaId]) state.ragaId = saved.ragaId;
    if ([1, 2, 4].includes(Number(saved.speed))) state.speed = Number(saved.speed);
    if (SHRUTIS[saved.shrutiId]) state.shrutiId = saved.shrutiId;
    if (["sine", "violin", "flute"].includes(saved.sound)) state.sound = saved.sound;
    if (typeof saved.sustain === "boolean") state.sustain = saved.sustain;
    if (Number.isFinite(saved.tempo)) state.tempo = Math.min(120, Math.max(48, saved.tempo));
  } catch {
    // A corrupt preference should never prevent the lesson from opening.
  }
}

function populateControls() {
  elements.raga.innerHTML = Object.entries(RAGAS)
    .map(([id, raga]) => `<option value="${id}">${raga.name}</option>`)
    .join("");

  elements.tala.innerHTML = Object.entries(TALAS)
    .map(([id, tala]) => `<option value="${id}">${tala.name} · ${tala.groups.join(" + ")}</option>`)
    .join("");

  elements.shruti.innerHTML = Object.entries(SHRUTIS)
    .map(([id, shruti]) => `<option value="${id}">${shruti.name}</option>`)
    .join("");

  elements.raga.value = state.ragaId;
  elements.tala.value = state.talaId;
  elements.speed.value = String(state.speed);
  elements.shruti.value = state.shrutiId;
  elements.sound.value = state.sound;
  elements.sustain.checked = state.sustain;
  elements.tempoOutput.value = String(state.tempo);
  updateSustainVisibility();
}

function renderLibrary() {
  const totalLessons = CURRICULUM.reduce((sum, section) => sum + section.lessons.length, 0);
  elements.lessonCount.textContent = `${totalLessons} lessons`;
  const availableSections = CURRICULUM.filter((section) => section.status !== "next");

  const availableMarkup = availableSections.map((section) => {
    const isOpen = section.id === state.sectionId;
    const status = `<span class="summary-chevron" aria-hidden="true">›</span>`;
    const lessonButtons = section.lessons
      .map(
        (lesson) => `
          <button class="lesson-button scope-${lesson.scope || "core"} ${lesson.id === state.lessonId ? "is-active" : ""}" type="button" data-section="${section.id}" data-lesson="${lesson.id}" aria-label="${lesson.number}. ${lesson.title}" title="${lesson.title}">
            <span>${lesson.number}</span>
            <span><strong>${lesson.title}</strong><small>${lesson.description}</small></span>
          </button>`
      )
      .join("");

    return `
      <details class="curriculum-group" ${isOpen ? "open" : ""} ${section.status === "next" ? "data-future" : ""}>
        <summary>
          <span class="group-number">${String(section.order).padStart(2, "0")}</span>
          <span class="group-title"><strong>${section.title}</strong><small lang="ta">${section.tamilTitle}</small></span>
          ${status}
        </summary>
        ${lessonButtons ? `<div class="lesson-list">${lessonButtons}</div>` : ""}
      </details>`;
  }).join("");

  elements.library.innerHTML = availableMarkup;

  elements.library.querySelectorAll("details[data-future] summary").forEach((summary) => {
    summary.addEventListener("click", (event) => event.preventDefault());
  });

  const expandableGroups = [...elements.library.querySelectorAll("details:not([data-future])")];
  expandableGroups.forEach((group) => {
    group.addEventListener("toggle", () => {
      if (!group.open) return;
      expandableGroups.forEach((sibling) => {
        if (sibling !== group) sibling.open = false;
      });
    });
  });

  elements.library.querySelectorAll(".lesson-button").forEach((button) => {
    button.addEventListener("click", () => {
      stopPlayback();
      state.sectionId = button.dataset.section;
      state.lessonId = button.dataset.lesson;
      state.notationPage = 0;
      const lesson = currentLesson();
      state.ragaId = lesson.raga;
      state.talaId = lesson.tala;
      elements.raga.value = state.ragaId;
      elements.tala.value = state.talaId;
      renderLibrary();
      renderLesson();
    });
  });
}

function swaraParts(note) {
  if (note === "~") return { base: "~", octave: 0 };
  return {
    base: note.replace(/[+-]/g, ""),
    octave: note.includes("+") ? 1 : note.includes("-") ? -1 : 0
  };
}

function swaraMarkup(note, script, noteIndex) {
  if (note === "_") {
    return `<span class="swara ${script} rest" data-note-index="${noteIndex}" aria-label="Rest">·</span>`;
  }
  const { base, octave } = swaraParts(note);
  const text = script === "tamil" ? TAMIL_SWARAS[base] : base;
  const octaveClass = octave > 0 ? "upper" : octave < 0 ? "lower" : "";
  const holdClass = base === "~" ? "hold" : "";
  const displayText = base === "~" ? "," : text;
  return `<span class="swara ${script} ${octaveClass} ${holdClass}" data-note-index="${noteIndex}">${displayText}</span>`;
}

function buildSpeedCycles(lesson, tala, subdivision) {
  const notesPerCycle = tala.beats * subdivision;
  const source = lesson.phrases.flatMap((phrase, phraseIndex) =>
    phrase.notes.map((note) => ({ note, phraseIndex }))
  );
  const cycles = [];
  let playIndex = 0;

  for (let start = 0; start < source.length; start += notesPerCycle) {
    const actual = source.slice(start, start + notesPerCycle);
    const cycleIndex = cycles.length;
    const fallbackPhraseIndex = actual[actual.length - 1]?.phraseIndex ?? lesson.phrases.length - 1;
    const entries = Array.from({ length: notesPerCycle }, (_, offset) => {
      const item = actual[offset] ?? { note: "_", phraseIndex: fallbackPhraseIndex, padding: true };
      return { ...item, cycleIndex, index: playIndex++ };
    });
    const phraseIndexes = actual.map((item) => item.phraseIndex);
    cycles.push({
      entries,
      firstPhraseIndex: Math.min(...phraseIndexes),
      lastPhraseIndex: Math.max(...phraseIndexes)
    });
  }

  return { cycles, sequence: cycles.flatMap((cycle) => cycle.entries) };
}

function renderTalaTrack() {
  const tala = TALAS[state.talaId];
  const starts = tala.groups.map((_, index) => tala.groups.slice(0, index).reduce((sum, size) => sum + size, 0));
  let angaIndex = 0;
  elements.talaTrack.classList.toggle("is-dense", tala.beats > 10);
  elements.talaTrack.style.gridTemplateColumns = `repeat(${tala.beats}, minmax(0, 1fr))`;
  elements.talaTrack.innerHTML = tala.actions
    .map((action, index) => {
      if (starts.includes(index)) angaIndex = starts.indexOf(index);
      const anga = tala.angas[angaIndex];
      return `
        <span class="tala-beat ${starts.includes(index) && index > 0 ? "group-start" : ""}" data-beat="${index}" title="${anga.name}: ${action}" aria-label="Beat ${index + 1}, ${anga.name}, ${action}">
          <strong>${index + 1}</strong>
          <span class="action-label">${action}</span>
        </span>`;
    })
    .join("");
}

function renderNotation() {
  const lesson = currentLesson();
  const tala = TALAS[state.talaId];
  const subdivision = state.speed;
  const prepared = buildSpeedCycles(lesson, tala, subdivision);
  state.playSequence = prepared.sequence;
  state.totalCycles = prepared.cycles.length;
  state.cyclesPerPage = tala.beats >= 10 || (subdivision === 4 && tala.beats >= 7) ? 1 : 2;
  const pageCount = Math.max(1, Math.ceil(prepared.cycles.length / state.cyclesPerPage));
  state.notationPage = Math.min(state.notationPage, pageCount - 1);
  const pageStart = state.notationPage * state.cyclesPerPage;
  const visibleCycles = prepared.cycles.slice(pageStart, pageStart + state.cyclesPerPage);

  elements.pager.hidden = pageCount === 1;
  elements.pageLabel.textContent = `${state.notationPage + 1} of ${pageCount}`;
  elements.pageBack.disabled = state.notationPage === 0;
  elements.pageNext.disabled = state.notationPage === pageCount - 1;

  elements.sheet.className = `notation-sheet speed-${subdivision} ${tala.beats > 10 ? "dense-tala" : ""}`;
  elements.sheet.innerHTML = visibleCycles
    .map((cycle) => {
      const cells = [];

      for (let beat = 0; beat < tala.beats; beat += 1) {
        const indexedNotes = cycle.entries.slice(beat * subdivision, (beat + 1) * subdivision);
        const groupStart = tala.groups.reduce((starts, group, index) => {
          if (index === 0) return starts;
          starts.push(tala.groups.slice(0, index).reduce((sum, size) => sum + size, 0));
          return starts;
        }, []).includes(beat);

        cells.push(`
          <div class="beat-cell ${groupStart ? "group-start" : ""} ${beat === tala.beats - 1 ? "cycle-end" : ""}">
            <div class="swara-line" lang="ta">${indexedNotes.map(({ note, index }) => swaraMarkup(note, "tamil", index)).join("")}</div>
            <div class="swara-line" aria-label="English transliteration">${indexedNotes.map(({ note, index }) => swaraMarkup(note, "english", index)).join("")}</div>
          </div>`);
      }

      let notationMarkup;
      if (tala.beats >= 10 || (subdivision === 4 && tala.beats >= 7)) {
        const target = tala.beats <= 10 ? 7 : Math.ceil(tala.beats / 2);
        let splitAfterGroups = 1;
        let runningBeats = tala.groups[0];
        while (
          splitAfterGroups < tala.groups.length - 1 &&
          runningBeats + tala.groups[splitAfterGroups] <= target
        ) {
          runningBeats += tala.groups[splitAfterGroups];
          splitAfterGroups += 1;
        }
        const segments = [cells.slice(0, runningBeats), cells.slice(runningBeats)].filter((segment) => segment.length);
        notationMarkup = `<div class="avartanam-stack">${segments.map((segment) => `
          <div class="avartanam" style="grid-template-columns: repeat(${segment.length}, minmax(0, 1fr))">${segment.join("")}</div>`).join("")}</div>`;
      } else {
        notationMarkup = `<div class="avartanam" style="grid-template-columns: repeat(${tala.beats}, minmax(0, 1fr))">${cells.join("")}</div>`;
      }

      const firstLine = cycle.firstPhraseIndex + 1;
      const lastLine = cycle.lastPhraseIndex + 1;
      const tamilLabel = firstLine === lastLine ? `வரி ${firstLine}` : `வரிகள் ${firstLine}–${lastLine}`;
      const englishLabel = firstLine === lastLine ? `Line ${firstLine}` : `Lines ${firstLine}–${lastLine}`;
      return `
        <div class="phrase-row">
          <div class="phrase-label"><strong lang="ta">${tamilLabel}</strong><small>${englishLabel}</small></div>
          <div class="phrase-content">${notationMarkup}</div>
        </div>`;
    })
    .join("");
}

function renderLesson() {
  const section = currentSection();
  const lesson = currentLesson();
  const raga = RAGAS[state.ragaId];

  elements.sectionName.textContent = section.title;
  elements.lessonNumber.textContent = `Lesson ${lesson.number}`;
  elements.lessonTitle.textContent = lesson.title;
  elements.lessonDescription.textContent = lesson.description;
  elements.lessonScale.textContent = raga.swaras;
  elements.tamilTitle.textContent = lesson.tamilTitle;
  elements.englishSubtitle.textContent = lesson.title;
  const lessonNotes = lesson.phrases.flatMap((phrase) => phrase.notes);
  const hasUpper = lessonNotes.some((note) => note.endsWith("+"));
  const hasLower = lessonNotes.some((note) => note.endsWith("-"));
  elements.octaveKeyLabel.textContent = hasLower && hasUpper
    ? "Upper / lower sthayi"
    : hasLower ? "Lower sthayi" : "Upper sthayi";
  elements.tala.disabled = true;
  elements.tala.title = "Tāḷam is set by the selected lesson";
  renderTalaTrack();
  renderNotation();
  resetPlaybackDisplay();
}

function noteFrequency(note) {
  const { base, octave } = swaraParts(note);
  const raga = RAGAS[state.ragaId];
  const sa = SHRUTIS[state.shrutiId].frequency;
  const semitones = raga.intervals[base] + octave * 12;
  return sa * 2 ** (semitones / 12);
}

function ensureAudio() {
  if (!state.audioContext) {
    state.audioContext = new AudioContext();
    state.masterGain = state.audioContext.createGain();
    state.masterGain.gain.value = 0.58;
    state.masterGain.connect(state.audioContext.destination);
  }
  if (state.audioContext.state === "suspended") state.audioContext.resume();
}

function silenceActiveAudio() {
  if (!state.audioContext || !state.masterGain) return;
  state.masterGain.disconnect();
  state.masterGain = state.audioContext.createGain();
  state.masterGain.gain.value = 0.58;
  state.masterGain.connect(state.audioContext.destination);
}

function playSine(frequency, start, duration) {
  const context = state.audioContext;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const attack = Math.min(0.02, duration * 0.2);
  const release = Math.min(0.08, duration * 0.28);
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.42, start + attack);
  gain.gain.setValueAtTime(0.36, start + Math.max(attack, duration - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(state.masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function playViolin(frequency, start, duration) {
  const context = state.audioContext;
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const vibrato = context.createOscillator();
  const vibratoDepth = context.createGain();
  const attack = Math.min(0.045, duration * 0.24);
  const release = Math.min(0.11, duration * 0.3);
  const soundingDuration = duration;

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3100, start);
  filter.Q.value = 1.4;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.22, start + attack);
  gain.gain.setValueAtTime(0.18, start + Math.max(attack, soundingDuration - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + soundingDuration);
  filter.connect(gain).connect(state.masterGain);

  vibrato.frequency.value = 5.2;
  vibratoDepth.gain.value = 7;
  vibrato.connect(vibratoDepth);

  [
    { type: "sawtooth", detune: -4, volume: 0.55 },
    { type: "triangle", detune: 3, volume: 0.28 }
  ].forEach((voice) => {
    const oscillator = context.createOscillator();
    const voiceGain = context.createGain();
    oscillator.type = voice.type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.value = voice.detune;
    voiceGain.gain.value = voice.volume;
    vibratoDepth.connect(oscillator.detune);
    oscillator.connect(voiceGain).connect(filter);
    oscillator.start(start);
    oscillator.stop(start + soundingDuration + 0.04);
  });

  vibrato.start(start + Math.min(0.12, soundingDuration * 0.5));
  vibrato.stop(start + soundingDuration + 0.04);
}

function playFlute(frequency, start, duration) {
  const context = state.audioContext;
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const oscillator = context.createOscillator();
  const harmonic = context.createOscillator();
  const harmonicGain = context.createGain();
  const attack = Math.min(0.06, duration * 0.26);
  const release = Math.min(0.11, duration * 0.3);

  filter.type = "lowpass";
  filter.frequency.value = 4200;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.32, start + attack);
  gain.gain.setValueAtTime(0.25, start + Math.max(attack, duration - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  harmonic.type = "sine";
  harmonic.frequency.setValueAtTime(frequency * 2, start);
  harmonicGain.gain.value = 0.08;

  oscillator.connect(filter);
  harmonic.connect(harmonicGain).connect(filter);
  filter.connect(gain).connect(state.masterGain);
  oscillator.start(start);
  harmonic.start(start);
  oscillator.stop(start + duration + 0.03);
  harmonic.stop(start + duration + 0.03);
}

function playNote(note, duration) {
  ensureAudio();
  const start = state.audioContext.currentTime + 0.01;
  const frequency = noteFrequency(note);
  if (state.sound === "sine") playSine(frequency, start, duration * 0.98);
  if (state.sound === "violin") playViolin(frequency, start, duration);
  if (state.sound === "flute") playFlute(frequency, start, duration * 0.98);
}

const SPRITE_HAND_ACTIONS = new Set(["clap", "wave", "little", "ring", "middle"]);

function clearHandTimers() {
  state.handTimers.forEach((timer) => window.clearTimeout(timer));
  state.handTimers = [];
}

function animateTalaHand(action) {
  clearHandTimers();
  const actionKey = action.toLowerCase();
  const hasSprite = SPRITE_HAND_ACTIONS.has(actionKey);
  const beatDuration = 60000 / state.tempo;

  elements.handCue.hidden = false;
  elements.handCue.dataset.action = hasSprite ? actionKey : "index";
  elements.handCue.style.setProperty("--beat-duration", `${beatDuration}ms`);
  elements.handLabel.textContent = action;
  elements.handSprite.dataset.frame = "0";

  elements.handCue.classList.remove("is-beating");
  void elements.handCue.offsetWidth;
  elements.handCue.classList.add("is-beating");

  if (!hasSprite) return;
  state.handTimers.push(window.setTimeout(() => {
    elements.handSprite.dataset.frame = "1";
  }, beatDuration * 0.16));
  state.handTimers.push(window.setTimeout(() => {
    elements.handSprite.dataset.frame = "2";
  }, beatDuration * 0.82));
}

function hideTalaHand() {
  clearHandTimers();
  elements.handCue.classList.remove("is-beating");
  elements.handCue.hidden = true;
  elements.handSprite.dataset.frame = "0";
}

function highlightNote(index) {
  document.querySelectorAll(".swara.is-playing").forEach((node) => node.classList.remove("is-playing"));
  document.querySelectorAll(`[data-note-index="${index}"]`).forEach((node) => node.classList.add("is-playing"));

  const tala = TALAS[state.talaId];
  const notesPerBeat = state.speed;
  const noteInCycle = index % (tala.beats * notesPerBeat);
  const beatIndex = Math.floor(noteInCycle / notesPerBeat);
  const beatAction = tala.actions[beatIndex];
  elements.talaTrack.querySelectorAll(".tala-beat").forEach((beat) => {
    beat.classList.toggle("is-active", Number(beat.dataset.beat) === beatIndex);
  });
  if (noteInCycle % notesPerBeat === 0) animateTalaHand(beatAction);

  const totalCycles = Math.ceil(state.playSequence.length / (tala.beats * notesPerBeat));
  const cycle = Math.floor(index / (tala.beats * notesPerBeat)) + 1;
  const pageCount = Math.ceil(state.totalCycles / state.cyclesPerPage);
  elements.cycleLabel.textContent = `Page ${state.notationPage + 1} of ${pageCount} · cycle ${cycle}/${totalCycles}`;
  elements.beatLabel.textContent = `Beat ${beatIndex + 1} of ${tala.beats} · ${beatAction}`;
  elements.progress.style.width = `${((index + 1) / state.playSequence.length) * 100}%`;
}

function showPlaybackPage(index) {
  const entry = state.playSequence[index];
  if (!entry) return;
  const targetPage = Math.floor(entry.cycleIndex / state.cyclesPerPage);
  if (targetPage === state.notationPage) return;
  state.notationPage = targetPage;
  renderNotation();
}

function stepPlayback() {
  if (!state.playing) return;
  state.noteIndex = (state.noteIndex + 1) % state.playSequence.length;
  showPlaybackPage(state.noteIndex);
  const stepDuration = 60 / state.tempo / state.speed;
  const current = state.playSequence[state.noteIndex];
  highlightNote(state.noteIndex);
  if (current.note !== "~" && current.note !== "_") {
    let heldSteps = 0;
    while (state.playSequence[state.noteIndex + heldSteps + 1]?.note === "~") heldSteps += 1;
    const soundingDuration = state.sustain
      ? stepDuration * (heldSteps + 1)
      : stepDuration * 0.72;
    playNote(current.note, soundingDuration);
  }
  state.timer = window.setTimeout(stepPlayback, stepDuration * 1000);
}

function startPlayback() {
  ensureAudio();
  state.notationPage = 0;
  renderNotation();
  state.playing = true;
  state.noteIndex = -1;
  elements.play.classList.add("is-playing");
  elements.playLabel.textContent = "Stop";
  stepPlayback();
}

function resetPlaybackDisplay() {
  const tala = TALAS[state.talaId];
  elements.cycleLabel.textContent = "Ready";
  elements.beatLabel.textContent = `Beat 1 of ${tala.beats} · ${tala.actions[0]}`;
  elements.progress.style.width = "0%";
  document.querySelectorAll(".swara.is-playing, .tala-beat.is-active").forEach((node) => node.classList.remove("is-playing", "is-active"));
  hideTalaHand();
}

function stopPlayback() {
  state.playing = false;
  state.noteIndex = -1;
  if (state.timer) window.clearTimeout(state.timer);
  state.timer = null;
  silenceActiveAudio();
  elements.play.classList.remove("is-playing");
  elements.playLabel.textContent = "Play all & loop";
  resetPlaybackDisplay();
}

function restartForSettingChange() {
  const shouldResume = state.playing;
  stopPlayback();
  if (shouldResume) startPlayback();
}

function updateSustainVisibility() {
  elements.sustainControl.classList.remove("is-hidden");
}

function bindControls() {
  elements.raga.addEventListener("change", () => {
    state.ragaId = elements.raga.value;
    restartForSettingChange();
    elements.lessonScale.textContent = RAGAS[state.ragaId].swaras;
    persistPreferences();
  });

  elements.tala.addEventListener("change", () => {
    state.talaId = elements.tala.value;
    restartForSettingChange();
    renderTalaTrack();
    renderNotation();
    persistPreferences();
  });

  elements.speed.addEventListener("change", () => {
    state.speed = Number(elements.speed.value);
    restartForSettingChange();
    renderNotation();
    persistPreferences();
  });

  elements.shruti.addEventListener("change", () => {
    state.shrutiId = elements.shruti.value;
    restartForSettingChange();
    persistPreferences();
  });

  elements.sound.addEventListener("change", () => {
    state.sound = elements.sound.value;
    updateSustainVisibility();
    restartForSettingChange();
    persistPreferences();
  });

  elements.sustain.addEventListener("change", () => {
    state.sustain = elements.sustain.checked;
    restartForSettingChange();
    persistPreferences();
  });

  elements.play.addEventListener("click", () => {
    if (state.playing) stopPlayback();
    else startPlayback();
  });

  elements.tempoDown.addEventListener("click", () => {
    state.tempo = Math.max(48, state.tempo - 4);
    elements.tempoOutput.value = String(state.tempo);
    restartForSettingChange();
    persistPreferences();
  });

  elements.tempoUp.addEventListener("click", () => {
    state.tempo = Math.min(120, state.tempo + 4);
    elements.tempoOutput.value = String(state.tempo);
    restartForSettingChange();
    persistPreferences();
  });

  elements.sourceButton.addEventListener("click", () => elements.sourceDialog.showModal());
  elements.dialogClose.addEventListener("click", () => elements.sourceDialog.close());
  elements.sourceDialog.addEventListener("click", (event) => {
    if (event.target === elements.sourceDialog) elements.sourceDialog.close();
  });
  elements.guideButton.addEventListener("click", () => elements.guideDialog.showModal());
  elements.exploreButton.addEventListener("click", () => elements.exploreDialog.showModal());
  [elements.guideDialog, elements.exploreDialog].forEach((dialog) => {
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  elements.pageBack.addEventListener("click", () => {
    if (state.notationPage === 0) return;
    stopPlayback();
    state.notationPage -= 1;
    renderNotation();
    resetPlaybackDisplay();
  });

  elements.pageNext.addEventListener("click", () => {
    const pageCount = Math.ceil(state.totalCycles / state.cyclesPerPage);
    if (state.notationPage >= pageCount - 1) return;
    stopPlayback();
    state.notationPage += 1;
    renderNotation();
    resetPlaybackDisplay();
  });

  window.addEventListener("pagehide", stopPlayback);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {}));
}

restorePreferences();
populateControls();
renderLibrary();
renderLesson();
bindControls();

