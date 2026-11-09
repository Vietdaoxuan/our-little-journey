const SCORES = {
  welcome: { beat: 0.54, chords: [[48, 55, 64, 67], [45, 52, 60, 64], [41, 48, 57, 60], [43, 50, 59, 62]] },
  journey: { beat: 0.46, chords: [[50, 57, 65, 69], [46, 53, 62, 65], [48, 55, 64, 67], [45, 52, 61, 64]] },
  ending: { beat: 0.64, chords: [[41, 48, 57, 64], [43, 50, 59, 62], [45, 52, 60, 67], [48, 55, 64, 69]] },
};

const EFFECTS = {
  transition: { notes: [67, 72], level: 0.07 },
  incorrect: { notes: [62, 59], level: 0.09 },
  correct: { notes: [64, 67, 72], level: 0.1 },
  interaction: { notes: [76], level: 0.055 },
  unlock: { notes: [67, 72, 76, 79], level: 0.11 },
  bloom: { notes: [60, 64, 67, 72, 76], level: 0.09 },
};

const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12);

export function synthMusic(context, mood) {
  const { beat, chords } = SCORES[mood];
  const sampleRate = 22050;
  const buffer = context.createBuffer(1, Math.round(sampleRate * beat * 4 * chords.length), sampleRate);
  const samples = buffer.getChannelData(0);
  const pattern = [0, 2, 1, 3, 2, 1];
  const offsets = [0, 0.5, 1, 1.5, 2.5, 3];

  const addNote = (note, start, duration, volume) => {
    const offset = Math.round(start * sampleRate);
    const length = Math.min(Math.round(duration * sampleRate), samples.length - offset);
    const angular = 2 * Math.PI * frequency(note) / sampleRate;
    for (let i = 0; i < length; i += 1) {
      const envelope = Math.min(1, i / 360) * (1 - i / length) ** 2;
      const wave = Math.sin(i * angular) + 0.2 * Math.sin(i * angular * 2);
      samples[offset + i] += wave * envelope * volume;
    }
  };

  chords.forEach((chord, measure) => {
    const start = measure * beat * 4;
    addNote(chord[0] - 12, start, beat * 3.9, 0.15);
    pattern.forEach((index, i) => addNote(chord[index], start + offsets[i] * beat, beat * 0.95, 0.22));
  });
  return buffer;
}

export function playEffect(context, output, name) {
  const effect = EFFECTS[name];
  const start = context.currentTime;
  effect.notes.forEach((note, index) => {
    const at = start + index * 0.075;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency(note);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(effect.level, at + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.24);
    oscillator.connect(gain).connect(output);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(at);
    oscillator.stop(at + 0.25);
  });
}
