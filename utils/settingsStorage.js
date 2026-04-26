import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@tappy_math_settings';
const DEFAULTS = { sfxEnabled: true, musicEnabled: true };

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch {}
}
