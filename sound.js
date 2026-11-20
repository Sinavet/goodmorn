"use strict";

window.createGameSound = function createGameSound() {
  const beats = [
    {
      bpm: 100, roots: [48, 45, 41, 43], third: [4, 3, 4, 4], kit: 0, swing: .12,
      phrases: [
        [72, 0, 76, 0, 74, 0, 67, 0], [69, 0, 72, 74, 76, 0, 0, 0],
        [72, 0, 69, 0, 65, 67, 69, 0], [74, 72, 71, 0, 67, 0, 0, 0],
      ],
    },
    {
      bpm: 122, roots: [48, 45, 41, 43], third: [4, 3, 4, 4], kit: 1, swing: .09,
      phrases: [
        [72, 0, 76, 79, 0, 76, 74, 0], [69, 72, 76, 0, 81, 0, 76, 0],
        [72, 0, 69, 0, 65, 67, 69, 0], [71, 74, 79, 0, 77, 74, 72, 0],
      ],
    },
    {
      bpm: 113, roots: [53, 55, 52, 57], third: [4, 4, 4, 3], kit: 2, swing: .23,
      phrases: [
        [77, 76, 72, 0, 69, 72, 76, 0], [74, 0, 71, 74, 79, 77, 74, 0],
        [76, 0, 80, 0, 77, 76, 71, 0], [72, 76, 81, 76, 72, 0, 69, 0],
      ],
    },
    {
      bpm: 142, roots: [45, 41, 43, 40], third: [3, 4, 4, 4], kit: 3,
      phrases: [
        [69, 69, 0, 72, 0, 76, 75, 72], [69, 0, 72, 0, 77, 76, 72, 0],
        [67, 67, 71, 0, 74, 77, 76, 74], [68, 0, 71, 76, 79, 77, 76, 0],
      ],
    },
    {
      bpm: 90, roots: [48, 43, 45, 41], third: [4, 4, 3, 4], kit: 0, swing: .11,
      phrases: [
        [76, 0, 74, 0, 72, 0, 67, 0], [71, 0, 72, 74, 79, 0, 0, 0],
        [76, 0, 72, 0, 69, 67, 69, 0], [72, 0, 69, 0, 65, 0, 67, 0],
      ],
    },
  ];

  // [start Hz, end Hz, seconds, volume, waveform, delay]
  const cues = {
    aim: [[551, 475, .085, .12, "triangle"], [950, 710, .052, .048, "sine", .016]],
    launch: [[180, 525, .18, .23, "triangle"], [675, 1160, .096, .087, "triangle", .028]],
    bounce: [[255, 153, .112, .23, "sine"], [705, 457, .056, .11, "triangle"]],
    virus: [[194, 66, .15, .24, "sine"], [658, 870, .095, .135, "triangle"], [1020, 665, .08, .067, "square", .052]],
    assist: [[330, 490, .11, .16, "sine"], [660, 880, .12, .11, "triangle", .073], [1046, 1046, .14, .07, "sine", .14]],
    checkpoint: [[523, 523, .14, .13, "triangle"], [659, 659, .15, .12, "triangle", .08], [784, 784, .23, .14, "triangle", .16]],
    pickup: [[750, 930, .08, .15, "square"], [1090, 1320, .115, .12, "triangle", .05]],
    shield: [[420, 160, .103, .12, "square"], [625, 245, .16, .18, "triangle"]],
    wave: [[186, 92, .27, .20, "triangle"], [350, 185, .18, .13, "square", .028], [94, 50, .22, .15, "sine"]],
    bossHit: [[127, 45, .21, .31, "sine"], [540, 120, .13, .22, "sawtooth"], [1160, 460, .15, .11, "triangle", .08]],
    victory: [
      [392, 392, .24, .13, "triangle"], [523, 523, .24, .15, "square", .12],
      [659, 659, .24, .14, "triangle", .24], [784, 784, .33, .16, "triangle", .37],
      [1046, 1046, .32, .09, "square", .40],
    ],
    transition: [[310, 810, .23, .16, "triangle"], [640, 980, .12, .11, "triangle", .12]],
    kiss: [[780, 390, .12, .13, "sine"], [315, 1040, .18, .17, "triangle", .08], [900, 1250, .13, .12, "sine", .17]],
    button: [[620, 420, .07, .12, "triangle"]],
    portrait: [[168, 62, .26, .28, "triangle"], [123, 42, .32, .23, "sine"], [535, 230, .10, .12, "square", .055], [645, 672, .19, .10, "triangle", .20]],
    portraitRise: [[111, 237, .29, .19, "triangle"], [147, 315, .3, .10, "square"], [432, 658, .19, .09, "triangle", .15]],
    brew: [[235, 410, .12, .14, "sine"], [315, 545, .10, .12, "sine", .08], [410, 660, .10, .12, "sine", .15], [523, 784, .18, .14, "triangle", .23]],
    cupDown: [[190, 72, .068, .16, "triangle"], [1731, 1688, .12, .070, "sine"], [2650, 2570, .075, .031, "sine"]],
  };

  const aliases = {
    jump: "launch", double: "launch", doubleJump: "launch", spring: "assist",
    "aim-start": "aim", release: "launch", shot: "launch",
    stomp: "virus", pop: "virus", "virus-hit": "virus", bump: "bounce", ricochet: "bounce", wall: "bounce", land: "bounce",
    hurt: "shield", miss: "shield", fall: "shield", death: "shield", respawn: "assist",
    beat: "wave", windup: "wave", boss: "wave", bossWindup: "wave", bossAttack: "wave",
    hit: "bossHit", "boss-hit": "bossHit", win: "victory", finish: "victory",
    leaf: "pickup", collect: "pickup", level: "transition", gate: "transition", room: "transition",
    "portrait-rise": "portraitRise", "portrait-hit": "portrait", lift: "portraitRise", tea: "brew",
    drink: "sip", "cup-down": "cupDown",
  };
  const voices = {
    hero: { hz: 536, bend: 1.23, wave: "triangle" },
    egor: { hz: 277, bend: .86, wave: "square" },
    portrait: { hz: 165, bend: .92, wave: "triangle" },
    virus: { hz: 730, bend: .83, wave: "triangle" },
  };
  const semitone = (midi) => 440 * 2 ** ((midi - 69) / 12);
  const db = (value) => 10 ** (value / 20);
  const silence = .0001;
  const letter = /[\p{L}\p{N}]/u;
  let context;
  let master;
  let music;
  let emphasis;
  let effects;
  let voice;
  let noise;
  let sipRecording;
  let sipLoading = false;
  let timer;
  let enabled = false;
  let userPaused = false;
  let dialogue = false;
  let quiet = false;
  let request = 0;
  let desiredScene = 0;
  let currentScene = 0;
  let slot = 0;
  let bar = 0;
  let nextMusic = 0;
  let lastLetter = -Infinity;
  let lastBounce = -Infinity;

  function gainBus(output, volume) {
    const bus = context.createGain();
    bus.gain.value = volume;
    bus.connect(output);
    return bus;
  }

  function setup() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return false;
    context = new Audio();

    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -13;
    limiter.knee.value = 7;
    limiter.ratio.value = 5;
    limiter.attack.value = .003;
    limiter.release.value = .19;
    limiter.connect(context.destination);
    master = gainBus(limiter, 0);
    emphasis = gainBus(master, 1);
    music = gainBus(emphasis, db(-13));
    effects = gainBus(master, db(-6));
    voice = gainBus(master, db(-6));

    noise = context.createBuffer(1, Math.floor(context.sampleRate * .16), context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;
    return true;
  }

  function gainTo(bus, value, seconds) {
    const clock = context.currentTime;
    if (typeof bus.gain.cancelAndHoldAtTime === "function") {
      bus.gain.cancelAndHoldAtTime(clock);
    } else {
      bus.gain.cancelScheduledValues(clock);
    }
    bus.gain.setTargetAtTime(value, clock, seconds);
  }

  function tone(output, time, startHz, endHz, duration, volume, wave) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(startHz, time);
    if (endHz !== startHz) oscillator.frequency.exponentialRampToValueAtTime(endHz, time + duration * .83);
    envelope.gain.setValueAtTime(silence, time);
    envelope.gain.linearRampToValueAtTime(volume, time + Math.min(.012, duration * .2));
    envelope.gain.exponentialRampToValueAtTime(silence, time + duration);
    oscillator.connect(envelope);
    envelope.connect(output);
    oscillator.start(time);
    oscillator.stop(time + duration + .009);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }

  function filteredNoise(output, time, hz, duration, volume, type, endHz = hz, attack = 0) {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    source.buffer = noise;
    filter.type = type;
    const safeHz = (frequency) => Math.min(frequency, context.sampleRate * .43);
    filter.frequency.setValueAtTime(safeHz(hz), time);
    if (endHz !== hz) filter.frequency.exponentialRampToValueAtTime(safeHz(endHz), time + duration);
    envelope.gain.setValueAtTime(attack ? silence : volume, time);
    if (attack) envelope.gain.linearRampToValueAtTime(volume, time + attack);
    envelope.gain.exponentialRampToValueAtTime(silence, time + duration);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(output);
    source.start(time);
    source.stop(time + duration);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
  }

  async function preloadSip() {
    if (sipRecording || sipLoading) return;
    sipLoading = true;
    try {
      const response = await window.fetch("assets/sip.mp3");
      if (response.ok) sipRecording = await context.decodeAudioData(await response.arrayBuffer());
    } catch {
      // Browsers may block fetch on file://. The synth still plays a wet gulp.
    } finally {
      sipLoading = false;
    }
  }

  function playSip(time) {
    if (sipRecording) {
      const source = context.createBufferSource();
      const level = gainBus(effects, .9);
      source.buffer = sipRecording;
      source.connect(level);
      source.start(time);
      source.onended = () => {
        source.disconnect();
        level.disconnect();
      };
      return;
    }

    filteredNoise(effects, time, 1500, .15, .21, "bandpass", 660, .026);
    filteredNoise(effects, time + .115, 630, .12, .29, "bandpass", 275, .021);
    tone(effects, time + .153, 179, 66, .121, .16, "sine");
    filteredNoise(effects, time + .249, 430, .15, .17, "bandpass", 240, .017);
    tone(effects, time + .273, 128, 52, .126, .15, "sine");
  }

  function note(midi, time, seconds, volume, wave) {
    const frequency = semitone(midi);
    tone(music, time, frequency, frequency, seconds, volume, wave);
  }

  function percussion(kit, time) {
    if (kit === 0) return;
    if (slot === 0 || slot === 4 || (kit === 3 && slot === 6)) {
      tone(music, time, 110, 44, .13, kit === 3 ? .36 : .21, "sine");
    }
    if (slot === 2 || slot === 6) {
      filteredNoise(music, time, kit === 2 ? 2900 : 1320, .09, kit === 3 ? .26 : .13, "bandpass");
      if (kit === 3) tone(music, time, 178, 90, .08, .14, "triangle");
    }
    if (slot % 2 === 1 || kit === 3) {
      filteredNoise(music, time, 5400, .041, slot % 2 === 1 ? .13 : .068, "highpass");
    }
  }

  function schedule(time) {
    const theme = beats[currentScene];
    const beat = 30 / theme.bpm;
    const measure = bar % theme.roots.length;
    const root = theme.roots[measure];
    const third = theme.third[measure];
    const melody = theme.phrases[measure][slot];
    if (melody) {
      note(melody, time, beat * 1.05, currentScene === 3 ? .14 : .23, currentScene === 3 ? "square" : "triangle");
    }
    if (slot === 0 || slot === 4 || (currentScene === 3 && slot % 2 === 0)) {
      const pitch = slot === 4 && currentScene !== 3 ? root - 5 : root - 12 + (slot === 6 ? 7 : 0);
      note(pitch, time, beat * 1.9, currentScene === 3 ? .26 : .18, "triangle");
    }
    const chord = [0, third, 7, 12, 7, third, 7, third];
    if (slot % 2 === 1 || theme.kit > 1 || (currentScene === 0 && slot === 0)) {
      note(root + 12 + chord[slot], time + .011, beat * .53, currentScene === 0 ? .095 : .082, "triangle");
    }
    if (currentScene === 4 && slot === 0) {
      note(root + 24 + third, time + .029, beat * 2.3, .09, "sine");
    }
    percussion(theme.kit, time);
    nextMusic += beat * (1 + (slot % 2 === 0 ? 1 : -1) * (theme.swing || 0));
    slot = (slot + 1) % 8;
    if (slot === 0) bar += 1;
  }

  function keepMusicAhead() {
    if (!enabled || userPaused || context.state !== "running") return;
    const clock = context.currentTime;
    if (nextMusic + .035 < clock) nextMusic = clock + .045;
    while (nextMusic < clock + .14) {
      if (slot === 0 && currentScene !== desiredScene) {
        currentScene = desiredScene;
        bar = 0;
      }
      schedule(nextMusic);
    }
  }

  function updateMix() {
    if (!context) return;
    gainTo(master, enabled ? db(quiet ? -9 : -4) : 0, .025);
    const musicDb = quiet ? -22 : -13;
    gainTo(music, db(userPaused ? -38 : dialogue ? musicDb - 10 : musicDb), dialogue ? .075 : .17);
  }

  async function enable() {
    if (enabled && context.state === "running") return true;
    const token = ++request;
    try {
      if (!context && !setup()) return false;
      if (context.state !== "running") await context.resume();
    } catch {
      return false;
    }
    if (token !== request || context.state !== "running") return false;
    enabled = true;
    nextMusic = context.currentTime + .035;
    updateMix();
    void preloadSip();
    if (!timer) timer = window.setInterval(keepMusicAhead, 27);
    keepMusicAhead();
    return true;
  }

  function mute() {
    request += 1;
    enabled = false;
    window.clearInterval(timer);
    timer = null;
    updateMix();
  }

  function setScene(id) {
    if (!Number.isInteger(id) || !beats[id]) return;
    desiredScene = id;
    if (!enabled || userPaused) {
      currentScene = id;
      bar = 0;
      slot = 0;
    }
  }

  function pause(paused) {
    const next = Boolean(paused);
    if (next === userPaused) return;
    userPaused = next;
    if (context && !userPaused) {
      nextMusic = context.currentTime + .05;
      keepMusicAhead();
    }
    updateMix();
  }

  function setDialogue(open) {
    dialogue = Boolean(open);
    updateMix();
  }

  function setQuiet(value) {
    quiet = Boolean(value);
    updateMix();
  }

  function duckBriefly() {
    const clock = context.currentTime;
    gainTo(emphasis, db(-7), .04);
    emphasis.gain.setTargetAtTime(1, clock + .31, .23);
  }

  function play(cue, strength) {
    if (!enabled) return;
    const key = Object.hasOwn(aliases, cue) ? aliases[cue] : cue;
    const time = context.currentTime + .005;
    if (key === "sip") {
      duckBriefly();
      playSip(time);
      return;
    }
    if (!Object.hasOwn(cues, key)) return;
    const sound = cues[key];
    if (key === "bounce" && time - lastBounce < .032) return;
    if (key === "bounce") lastBounce = time;
    if (key === "portrait" || key === "victory" || key === "bossHit") duckBriefly();
    if (key === "cupDown") filteredNoise(effects, time, 870, .05, .07, "bandpass");

    const varied = key === "bounce" || key === "virus" || key === "launch";
    const impact = Number.isFinite(strength) ? Math.min(1, Math.max(0, strength)) : .6;
    const pitch = varied ? .92 + impact * .14 + Math.random() * .12 : 1;
    const gain = varied ? .69 + impact * .42 : 1;
    for (const [start, end, seconds, volume, wave, delay = 0] of sound) {
      tone(effects, time + delay, start * pitch, end * pitch, seconds, volume * gain, wave);
    }
  }

  function text(speaker, character) {
    if (!enabled || !character || !letter.test(character)) return;
    const time = context.currentTime;
    if (time - lastLetter < .044) return;
    lastLetter = time;
    const voiceStyle = voices[speaker] || voices.hero;
    const pitch = voiceStyle.hz * (.94 + (character.codePointAt(0) % 7) * .037);
    const soft = voiceStyle.wave === "square" ? .09 : .16;
    tone(voice, time + .004, pitch, pitch * voiceStyle.bend, .055, soft, voiceStyle.wave);
  }

  return { enable, mute, setScene, play, text, setDialogue, setQuiet, pause };
};
