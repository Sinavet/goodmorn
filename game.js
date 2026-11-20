"use strict";

const byId = (id) => document.getElementById(id);
const intro = byId("intro");
const play = byId("play");
const tea = byId("tea");
const final = byId("final");
const canvas = byId("vessel");
const speech = byId("speech");
const speechText = byId("speech-text");
const speechLetters = byId("speech-letters");
const soundButton = byId("sound");
const pauseButton = byId("pause");
const brewButton = byId("brew");
const photoPaths = {
  beard: "assets/beard.jpg",
  tea: "assets/tea.jpg",
  shrek: "assets/shrek.jpg",
  kissMeme: "assets/kiss-meme.jpg",
};
const portrait = new Image();
portrait.src = "assets/portrait.jpg";

const chapters = [
  ["Расчистить проход", "Потяни лейкоцит назад и отпусти."],
  ["Доставить в сердце", "Потяни лейкоцит вниз от тележки и отпусти."],
  ["Егор Вирус", "Зайди рикошетом в пролом."],
];
const dialogueHints = {
  ricochet: "Направь бросок через светлый диск.",
  "egor-2": "Дождись, пока волна пройдёт.",
  "egor-3": "Поймай угол, пока диск движется.",
};
const cast = {
  hero: "Лейкоцит",
  egor: "Егор Вирус",
};
const script = {
  start: [["hero", "Егор записал тебя в хейтеры. Выбей его вирусы из прохода."]],
  "portrait-fly": [["portrait", "Ну всё. Теперь твоё сердце принадлежит мне. Хе-хе-хе."]],
  "egor-arrive": [
    ["egor", "Я пришёл извиниться."],
    ["hero", "Правда?"],
    ["egor", "Нет, крошка, я прикалываюсь. (Самодовольно усмехается и подмигивает.) Я пришёл посмотреть, извинишься ли ты."],
  ],
  "egor-2": [["egor", "Ещё раз так сделаешь, крошка, и розу ты не получишь."]],
  "egor-3": [["egor", "Ангел, возьми мой поцелуй, души меня"]],
  "egor-down": [["egor", "Всегда так, никто не полюбит мою наивную душу....."]],
};

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const audio = window.createGameSound?.();
const game = window.createVesselGame?.(canvas, { onEvent, portrait });
let scene = 1;
let paused = false;
let dialogue = null;
let speechTimer;
let brewTimer;
let teaStep;
let kissed = false;
let exited = false;
let soundOn = readSound();

function readSound() {
  try { return localStorage.getItem("capillary-sound") !== "off"; }
  catch { return true; }
}

function updateAudioButton() {
  soundButton.setAttribute("aria-pressed", String(soundOn));
  soundButton.setAttribute("aria-label", soundOn ? "Выключить звук" : "Включить звук");
}

function show(panel) {
  for (const section of [intro, play, tea, final]) section.hidden = section !== panel;
  window.scrollTo(0, 0);
}

function start() {
  if (!game) return;
  clearTimeout(brewTimer);
  clearDialogue();
  game.stop();
  show(play);
  setPaused(false);
  if (soundOn) void audio?.enable();
  audio?.play("button");
  game.start();
}

function onEvent(event) {
  if (event.type === "scene") {
    scene = event.scene;
    const [objective, hint] = chapters[scene - 1];
    byId("chapter").textContent = `${scene} из ${chapters.length}`;
    byId("objective").textContent = objective;
    byId("hint").textContent = hint;
    byId("heart-note").hidden = scene !== 2;
    play.dataset.scene = String(scene);
    audio?.setScene(scene);
  }
  if (event.type === "progress") {
    if (scene === 1 && event.done === 2) byId("hint").textContent = "Расчисти левый проход.";
    if (scene === 2 && event.done === 1) {
      byId("hint").textContent = "Направь пунктир через светлый диск в тележку.";
    }
    if (scene === 2 && event.done === event.total) byId("hint").textContent = "";
    const meter = byId("progress");
    meter.setAttribute("aria-valuemin", "0");
    meter.setAttribute("aria-valuemax", String(event.total));
    meter.setAttribute("aria-valuenow", String(event.done));
    const pieces = Array.from({ length: event.total }, (_, index) => {
      const pixel = document.createElement("i");
      if (index < event.done) pixel.classList.add("filled");
      return pixel;
    });
    meter.replaceChildren(...pieces);
  }
  if (event.type === "sound") audio?.play(event.cue, event.strength);
  if (event.type === "dialogue") {
    if (dialogueHints[event.id]) byId("hint").textContent = dialogueHints[event.id];
    if (script[event.id]) {
      dialogue = { entries: script[event.id], index: 0 };
      audio?.setDialogue(true);
      syncPause();
      renderLine();
    }
  }
  if (event.type === "hint") byId("hint").textContent = event.text;
  if (event.type === "complete") showTea();
}

function syncPause() {
  if (paused || dialogue) game?.pause();
  else game?.resume();
  audio?.pause(paused);
}

function setPaused(next) {
  paused = next;
  byId("paused").hidden = !paused;
  pauseButton.textContent = paused ? "▶" : "Ⅱ";
  pauseButton.setAttribute("aria-label", paused ? "Продолжить игру" : "Пауза");
  syncPause();
  if (paused) byId("resume").focus({ preventScroll: true });
  else if (dialogue) byId("speech-next").focus({ preventScroll: true });
  else if (!play.hidden) canvas.focus({ preventScroll: true });
}

function renderLine() {
  clearTimeout(speechTimer);
  const [speaker, text] = dialogue.entries[dialogue.index];
  dialogue.chars = Array.from(text);
  dialogue.visible = 0;
  speech.dataset.speaker = speaker;
  const speakerName = cast[speaker];
  byId("speaker").textContent = speakerName ?? "";
  byId("speaker").hidden = !speakerName;
  speechLetters.textContent = "";
  speechText.dataset.full = text;
  byId("speech-announcement").textContent = speakerName ? speakerName + ": " + text : text;
  speech.hidden = false;
  byId("speech-next").focus({ preventScroll: true });
  positionSpeech();
  speechTimer = setTimeout(printLetter, 160);
}

function positionSpeech() {
  if (!dialogue || play.hidden || speech.hidden) return;
  const speaker = dialogue.entries[dialogue.index][0];
  const anchor = game.speakerPoint(speaker) ?? {
    x: play.clientWidth / 2, y: play.clientHeight * .49,
  };
  const topBound = 65;
  const left = Math.max(10, Math.min(play.clientWidth - speech.offsetWidth - 10, anchor.x - speech.offsetWidth * .45));
  const spriteRadius = { hero: 8, portrait: 13, egor: 21 }[speaker];
  const gap = 5 + spriteRadius * (play.clientWidth / 180);
  const above = anchor.y - speech.offsetHeight - gap >= topBound;
  const y = above ? anchor.y - speech.offsetHeight - gap : anchor.y + gap;
  speech.classList.toggle("below", !above);
  speech.style.left = Math.round(left) + "px";
  speech.style.top = Math.round(Math.max(topBound, Math.min(play.clientHeight - speech.offsetHeight - 13, y))) + "px";
  speech.style.setProperty("--tail", Math.round(Math.max(19, Math.min(speech.offsetWidth - 21, anchor.x - left))) + "px");
}

function printLetter() {
  if (!dialogue) return;
  if (paused) {
    speechTimer = setTimeout(printLetter, 100);
    return;
  }
  const char = dialogue.chars[dialogue.visible++];
  speechLetters.textContent += char;
  if (/\p{L}/u.test(char)) audio?.text(dialogue.entries[dialogue.index][0], char);
  if (dialogue.visible < dialogue.chars.length) {
    speechTimer = setTimeout(printLetter, /[.?!]/.test(char) ? 180 : (char === "," ? 88 : 24));
  }
}

function advanceSpeech() {
  if (!dialogue || paused) return;
  if (dialogue.visible < dialogue.chars.length) {
    clearTimeout(speechTimer);
    dialogue.visible = dialogue.chars.length;
    speechLetters.textContent = dialogue.chars.join("");
    return;
  }

  dialogue.index += 1;
  if (dialogue.index < dialogue.entries.length) {
    renderLine();
    return;
  }
  clearDialogue();
  syncPause();
  canvas.focus({ preventScroll: true });
}

function clearDialogue() {
  clearTimeout(speechTimer);
  speech.hidden = true;
  dialogue = null;
  audio?.setDialogue(false);
}

function setTeaStep(step) {
  teaStep = step;
  tea.dataset.step = step;
}

function showTea() {
  game?.stop();
  clearDialogue();
  audio?.pause(false);
  audio?.setScene(4);
  setTeaStep("bag");
  byId("tea-line").textContent = "ЭЭЭЭ, почему я чайный пакетик???";
  brewButton.disabled = false;
  brewButton.innerHTML = 'Заварить чай <span aria-hidden="true">↓</span>';
  show(tea);
  byId("tea-title").focus({ preventScroll: true });
}

function brew() {
  if (teaStep === "bag") {
    setTeaStep("brewing");
    brewButton.disabled = true;
    audio?.play("brew");
    byId("tea-line").textContent = "";
    brewTimer = setTimeout(() => {
      setTeaStep("cup");
      brewButton.innerHTML = 'Выпить чай <span aria-hidden="true">↗</span>';
      brewButton.disabled = false;
      brewButton.focus({ preventScroll: true });
    }, motion.matches ? 40 : 1220);
  } else if (teaStep === "cup") {
    setTeaStep("raising");
    brewButton.disabled = true;
    audio?.setDialogue(true);
    brewTimer = setTimeout(() => {
      setTeaStep("sipping");
      audio?.play("sip");
      brewTimer = setTimeout(() => {
        setTeaStep("lowering");
        brewTimer = setTimeout(() => {
          audio?.play("cupDown");
          brewTimer = setTimeout(finish, 290);
        }, motion.matches ? 75 : 330);
      }, 650);
    }, motion.matches ? 75 : 330);
  }
}

function finish() {
  clearTimeout(brewTimer);
  game?.stop();
  clearDialogue();
  audio?.pause(false);
  audio?.setScene(4);
  kissed = false;
  exited = false;
  delete final.dataset.result;
  byId("kiss").hidden = false;
  byId("kiss-mark").hidden = true;
  byId("kiss-meme").hidden = true;
  byId("final-photo").hidden = false;
  byId("final-line").hidden = false;
  byId("final-line").textContent = "Шрек уже занял губы. Щёка пока свободна.";
  byId("final-actions").hidden = false;
  byId("exit").textContent = "Разбить Мише сердце....";
  byId("outcome").textContent = "Вирусов больше нет";
  show(final);
  byId("final-title").focus({ preventScroll: true });
}

function stamp() {
  if (kissed || exited) return;
  kissed = true;
  final.dataset.result = "kissed";
  byId("kiss-mark").hidden = false;
  byId("kiss").hidden = true;
  byId("final-line").hidden = true;
  byId("kiss-meme").hidden = false;
  byId("exit").textContent = "Закрыть";
  audio?.play("kiss");
  byId("exit").focus({ preventScroll: true });
}

function exit() {
  if (exited) return;
  exited = true;
  byId("final-actions").hidden = true;
  byId("final-title").focus({ preventScroll: true });
  if (kissed) {
    byId("final-photo").hidden = true;
    byId("kiss-meme").hidden = true;
  } else {
    byId("final-line").textContent = "Ну и ладно.... Больно надо... У меня есть шрек, давай гуляй";
  }
}

function loadPhoto(image, path, onLoad) {
  image.addEventListener("load", onLoad, { once: true });
  image.src = path;
}

const teaPhoto = byId("tea-photo");
const teaCandidate = new Image();
loadPhoto(teaCandidate, photoPaths.tea, () => { teaPhoto.src = photoPaths.tea; });
loadPhoto(new Image(), photoPaths.beard, () => {
  portrait.dataset.focusY = "0.95";
  portrait.src = photoPaths.beard;
  if (!teaCandidate.naturalWidth) teaPhoto.src = photoPaths.beard;
});
for (const [path, imageId, placeholderId] of [
  [photoPaths.shrek, "shrek-photo", "shrek-placeholder"],
  [photoPaths.kissMeme, "kiss-meme-photo", "kiss-meme-placeholder"],
]) {
  const image = byId(imageId);
  loadPhoto(image, path, () => {
    image.hidden = false;
    byId(placeholderId).hidden = true;
  });
}

byId("start").addEventListener("click", start);
byId("resume").addEventListener("click", () => setPaused(false));
pauseButton.addEventListener("click", () => setPaused(!paused));
brewButton.addEventListener("click", brew);
byId("kiss").addEventListener("click", stamp);
byId("exit").addEventListener("click", exit);
document.addEventListener("click", (event) => {
  if (!dialogue || paused) return;
  const button = event.target.closest("button");
  if (button && button.id !== "speech-next") return;
  advanceSpeech();
});
soundButton.addEventListener("click", () => {
  soundOn = !soundOn;
  if (soundOn) void audio?.enable();
  else audio?.mute();
  try { localStorage.setItem("capillary-sound", soundOn ? "on" : "off"); } catch {}
  updateAudioButton();
});
window.addEventListener("keydown", (event) => {
  if (play.hidden || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === "Escape") {
    event.preventDefault();
    setPaused(!paused);
  } else if (dialogue && !paused && ["Enter", " "].includes(event.key) &&
    !event.target.closest("#pause, #sound")) {
    event.preventDefault();
    advanceSpeech();
  }
});
window.addEventListener("resize", () => {
  if (play.hidden) return;
  game?.step(0);
  positionSpeech();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !play.hidden && !paused) setPaused(true);
});
updateAudioButton();
window.render_game_to_text = () => JSON.stringify({
  screen: [intro, play, tea, final].find((panel) => !panel.hidden).id,
  scene, paused, dialogue: dialogue?.entries[dialogue.index][1], teaStep, kissed, exited,
  game: play.hidden ? null : game?.state(),
});
window.advanceTime = (ms) => game?.step(ms);
