import { useCallback, useEffect, useRef, useState } from 'react';

// Sound for the Virtual Casino tables. Two independent switches, exactly as the
// reference's two icons: SOUND is the table's effects (shuffle, card flip),
// MUSIC is the winner sting. Both persist so a player who muted once stays
// muted across rounds and games.
//
// Files are served from public/ (downloaded, never hotlinked).
const SOUND_BASE = '/assets/sounds';
const EFFECTS = { cardsMix: 'cards_mix', cardFlip: 'card_flip' };
const MUSIC = { winner: 'winner' };

const STORAGE = { sound: 'vcasino.sound', music: 'vcasino.music' };

// Default ON, and only an explicit 'off' turns it off — a cleared storage or a
// browser blocking access should not silently mute the table.
const readFlag = (key) => {
  try {
    return localStorage.getItem(key) !== 'off';
  } catch {
    return true;
  }
};

export default function useVcasinoSound() {
  const [soundOn, setSoundOn] = useState(() => readFlag(STORAGE.sound));
  const [musicOn, setMusicOn] = useState(() => readFlag(STORAGE.music));
  const players = useRef({});

  // One Audio per clip, built once. Playing the same element again from the
  // start is far cheaper than constructing a new one every round.
  useEffect(() => {
    const all = { ...EFFECTS, ...MUSIC };
    for (const [name, file] of Object.entries(all)) {
      const audio = new Audio(`${SOUND_BASE}/${file}.mp3`);
      audio.preload = 'auto';
      players.current[name] = audio;
    }
    const built = players.current;
    return () => {
      for (const audio of Object.values(built)) {
        audio.pause();
      }
    };
  }, []);

  // Silence a whole group NOW. Pausing alone would resume mid-clip on the next
  // play(), so the position is reset too.
  const stopGroup = useCallback((group) => {
    for (const name of Object.keys(group)) {
      const audio = players.current[name];
      if (!audio) continue;
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  // Muting has to kill what is ALREADY sounding, not just the next clip.
  // Gating play() on its own left winner.mp3 — several seconds long — running
  // well after the icon had switched to muted, which reads as a dead button.
  useEffect(() => {
    if (!soundOn) stopGroup(EFFECTS);
  }, [soundOn, stopGroup]);

  useEffect(() => {
    if (!musicOn) stopGroup(MUSIC);
  }, [musicOn, stopGroup]);

  const persist = (key, on) => {
    try {
      localStorage.setItem(key, on ? 'on' : 'off');
    } catch {
      // Private-mode storage failures must not break the table.
    }
  };

  const toggleSound = useCallback(() => {
    setSoundOn((on) => { persist(STORAGE.sound, !on); return !on; });
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicOn((on) => { persist(STORAGE.music, !on); return !on; });
  }, []);

  const play = useCallback((name) => {
    const enabled = name in MUSIC ? musicOn : soundOn;
    if (!enabled) return;
    const audio = players.current[name];
    if (!audio) return;
    audio.currentTime = 0;
    // Autoplay is blocked until the page has been interacted with; that
    // rejection is expected on a fresh load and is not an error worth logging.
    audio.play().catch(() => {});
  }, [soundOn, musicOn]);

  return { soundOn, musicOn, toggleSound, toggleMusic, play };
}
