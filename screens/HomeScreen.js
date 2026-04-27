import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Animated, Easing, Modal } from 'react-native';
import { GRADES, GRADE_KEYS } from '../constants/difficulty';

const { width: SW, height: SH } = Dimensions.get('window');

const BG_ITEMS = [
  '2 + 3', '7 × 4', '15 − 8', '5 + 5', '3 × 3', '11 + 8', '6 × 6',
  '8 × 8', '3 + 4', '9 × 9', '6 + 7', '3 + 8', '10 × 10', '4 + 6',
  '2 + 7', '9 + 1', '5 × 4', '12 ÷ 4', '2 + 2', '10 − 3', '8 + 8',
  '★', '✦', '♥', '◆', '✿', '★', '✦', '♥',
];

const BG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD93D',
  '#C7A4FF', '#FF8E53', '#6BCB77', '#F7A072',
];

function BgItem({ label, x, y, fontSize, opacity, color }) {
  const driftY = useRef(new Animated.Value(0)).current;
  const driftX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    const easing = Easing.inOut(Easing.quad);

    const drift = (value, range) => {
      if (!active) return;
      Animated.timing(value, {
        toValue: (Math.random() - 0.5) * range,
        duration: 900 + Math.random() * 900,
        easing,
        useNativeDriver: true,
      }).start(({ finished }) => { if (finished) drift(value, range); });
    };

    drift(driftX, 40);
    drift(driftY, 50);
    return () => { active = false; };
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: x,
        top: y,
        color,
        opacity,
        fontSize,
        fontWeight: '800',
        transform: [{ translateX: driftX }, { translateY: driftY }],
      }}
    >
      {label}
    </Animated.Text>
  );
}

function FloatingBackground() {
  const items = useRef(
    BG_ITEMS.map((label, i) => ({
      label,
      x: Math.random() * (SW - 120),
      y: Math.random() * (SH - 40),
      fontSize: 13 + Math.random() * 10,
      opacity: 0.08 + Math.random() * 0.10,
      color: BG_COLORS[i % BG_COLORS.length],
    }))
  ).current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((item, i) => (
        <BgItem key={i} {...item} />
      ))}
    </View>
  );
}

const MODES = [
  { key: 'normal',   label: 'Standard',   icon: '🎯', sub: 'Find all equations before time runs out!' },
  { key: 'survival', label: 'Survival',   icon: '⚡', sub: 'Right answer = +20s · Wrong tap = −5s' },
  { key: 'falling',  label: 'Falling Numbers', icon: '🌊', sub: 'Tap the equations as they fall down!' },
];

export default function HomeScreen({ onPlay, sfxEnabled, musicEnabled, onToggleSfx, onToggleMusic }) {
  const [gradeIndex, setGradeIndex] = useState(3); // default: 3rd grade
  const [modeIndex, setModeIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const gradeKey = GRADE_KEYS[gradeIndex];
  const grade = GRADES[gradeKey];
  const currentMode = MODES[modeIndex];
  const modeColor = grade.color;

  return (
    <SafeAreaView style={styles.container}>
      <FloatingBackground />

      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.topBarBtn} hitSlop={12} activeOpacity={0.7}>
          <Text style={styles.topBarIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Tappy{'\n'}Math!</Text>
        <Text style={styles.subtitle}>Find equations equal to the target number!</Text>

        <Text style={styles.sectionLabel}>📚 Grade Level</Text>
        <View style={[styles.gradeSelector, { borderColor: grade.color }]}>
          <TouchableOpacity
            onPress={() => setGradeIndex(i => Math.max(0, i - 1))}
            hitSlop={16}
            activeOpacity={gradeIndex === 0 ? 0.2 : 0.6}
          >
            <Text style={[styles.gradeArrow, { color: gradeIndex === 0 ? '#D9CFC4' : grade.color }]}>‹</Text>
          </TouchableOpacity>
          <View style={styles.gradeCard}>
            <Text style={[styles.gradeName, { color: grade.color }]}>{grade.label}</Text>
            <Text style={styles.gradeSkill}>{grade.skillDesc}</Text>
            <Text style={styles.gradeTimer}>⏱ {grade.duration}s</Text>
          </View>
          <TouchableOpacity
            onPress={() => setGradeIndex(i => Math.min(GRADE_KEYS.length - 1, i + 1))}
            hitSlop={16}
            activeOpacity={gradeIndex === GRADE_KEYS.length - 1 ? 0.2 : 0.6}
          >
            <Text style={[styles.gradeArrow, { color: gradeIndex === GRADE_KEYS.length - 1 ? '#D9CFC4' : grade.color }]}>›</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.gradeProgress}>{gradeIndex + 1} of {GRADE_KEYS.length}</Text>

        <Text style={styles.sectionLabel}>🎮 Game Mode</Text>
        <View style={[styles.modeSelector, { borderColor: modeColor }]}>
          <TouchableOpacity
            onPress={() => setModeIndex(i => (i + MODES.length - 1) % MODES.length)}
            hitSlop={16}
            activeOpacity={0.6}
          >
            <Text style={[styles.modeArrow, { color: modeColor }]}>‹</Text>
          </TouchableOpacity>
          <View style={styles.modeCard}>
            <Text style={styles.modeIcon}>{currentMode.icon}</Text>
            <Text style={[styles.modeName, { color: modeColor }]}>{currentMode.label}</Text>
            <Text style={styles.modeSub}>{currentMode.sub}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setModeIndex(i => (i + 1) % MODES.length)}
            hitSlop={16}
            activeOpacity={0.6}
          >
            <Text style={[styles.modeArrow, { color: modeColor }]}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modeDots}>
          {MODES.map((_, i) => (
            <View key={i} style={[styles.modeDot, i === modeIndex && { backgroundColor: modeColor }]} />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: modeColor, shadowColor: modeColor }]}
          onPress={() => onPlay(gradeKey, currentMode.key)}
          activeOpacity={0.85}
        >
          <Text style={styles.playBtnText}>▶  Play!</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showSettings} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSettings(false)}>
          <View style={styles.settingsModal} onStartShouldSetResponder={() => true}>
            <Text style={styles.settingsModalTitle}>⚙️ Settings</Text>

            <TouchableOpacity
              style={[styles.settingsToggle, sfxEnabled && styles.settingsToggleOn]}
              onPress={onToggleSfx}
              activeOpacity={0.8}
            >
              <View style={styles.settingsToggleLeft}>
                <Text style={styles.settingsToggleIcon}>🔊</Text>
                <Text style={styles.settingsToggleLabel}>Sound Effects</Text>
              </View>
              <View style={[styles.pill, sfxEnabled && styles.pillOn]}>
                <Text style={[styles.pillText, sfxEnabled && styles.pillTextOn]}>
                  {sfxEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingsToggle, musicEnabled && styles.settingsToggleOn]}
              onPress={onToggleMusic}
              activeOpacity={0.8}
            >
              <View style={styles.settingsToggleLeft}>
                <Text style={styles.settingsToggleIcon}>🎵</Text>
                <Text style={styles.settingsToggleLabel}>Music</Text>
              </View>
              <View style={[styles.pill, musicEnabled && styles.pillOn]}>
                <Text style={[styles.pillText, musicEnabled && styles.pillTextOn]}>
                  {musicEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsDoneBtn} onPress={() => setShowSettings(false)} activeOpacity={0.8}>
              <Text style={styles.settingsDoneText}>Done ✓</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6E3',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  topBarSpacer: {
    width: 36,
  },
  topBarBtn: {
    padding: 6,
  },
  topBarIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FF7043',
    textAlign: 'center',
    lineHeight: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#7B6B5A',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  sectionLabel: {
    color: '#5A4A3A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  gradeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 2.5,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  gradeArrow: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
    width: 28,
    textAlign: 'center',
  },
  gradeCard: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  gradeName: {
    fontSize: 20,
    fontWeight: '800',
  },
  gradeSkill: {
    color: '#7B6B5A',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  gradeTimer: {
    color: '#7B6B5A',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  gradeProgress: {
    color: '#B0A090',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 2.5,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  modeArrow: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
    width: 28,
    textAlign: 'center',
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  modeIcon: {
    fontSize: 30,
  },
  modeName: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeSub: {
    color: '#7B6B5A',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  modeDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9CFC4',
  },
  playBtn: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsModal: {
    width: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  settingsModalTitle: {
    color: '#2C2C2C',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  settingsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E8DDD2',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  settingsToggleOn: {
    borderColor: '#FF7043',
    backgroundColor: '#FFF6F3',
  },
  settingsToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsToggleIcon: {
    fontSize: 20,
  },
  settingsToggleLabel: {
    color: '#2C2C2C',
    fontSize: 16,
    fontWeight: '700',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#E8DDD2',
  },
  pillOn: {
    backgroundColor: '#FF7043',
  },
  pillText: {
    color: '#7B6B5A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pillTextOn: {
    color: '#fff',
  },
  settingsDoneBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 4,
    backgroundColor: '#FF7043',
    borderRadius: 50,
  },
  settingsDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
