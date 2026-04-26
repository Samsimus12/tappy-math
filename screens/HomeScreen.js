import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Animated, Easing, Modal } from 'react-native';
import { DIFFICULTY } from '../constants/difficulty';

const { width: SW, height: SH } = Dimensions.get('window');

const BG_ITEMS = [
  '2 + 3', '7 × 4', '15 − 8', '36 ÷ 6', '42', '7', '13', '99', '5 + 5',
  '3 × 3', '100 ÷ 10', '11 + 8', '20 − 7', '6 × 6', '50 ÷ 2', '13 + 7',
  '8 × 8', '77', '3 + 4', '9 × 9', '81 ÷ 9', '30 + 12', '25 − 11',
  '4 × 7', '16 + 16', '64 ÷ 8', '19', '37', '2 × 9', '100',
  '12 × 3', '45 − 9', '24 ÷ 4', '6 + 7', '88', '18 + 6',
  '5 × 5', '3 + 8', '50', '10 × 10', '44 ÷ 4',
];

function BgItem({ label, x, y, fontSize, opacity }) {
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
        color: '#a5b4fc',
        opacity,
        fontSize,
        fontWeight: '700',
        transform: [{ translateX: driftX }, { translateY: driftY }],
      }}
    >
      {label}
    </Animated.Text>
  );
}

function FloatingBackground() {
  const items = useRef(
    BG_ITEMS.map(label => ({
      label,
      x: Math.random() * (SW - 120),
      y: Math.random() * (SH - 40),
      fontSize: 12 + Math.random() * 9,
      opacity: 0.04 + Math.random() * 0.07,
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
  { key: 'normal',   label: 'Standard',      icon: '🎯', sub: 'Find all equations before time runs out' },
  { key: 'survival', label: 'Survival',       icon: '⚡', sub: 'Solve numbers to add time · wrong taps cost 5s' },
  { key: 'falling',  label: 'Falling Equations', icon: '🌊', sub: 'Tap equations as they fall' },
];

export default function HomeScreen({ onPlay, sfxEnabled, musicEnabled, onToggleSfx, onToggleMusic }) {
  const [selected, setSelected] = useState('medium');
  const [modeIndex, setModeIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const diff = DIFFICULTY[selected];
  const currentMode = MODES[modeIndex];
  const modeColor = diff.color;

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
        <Text style={styles.title}>Tappy{'\n'}Math</Text>
        <Text style={styles.subtitle}>Find equations that equal the target!</Text>

        <Text style={styles.sectionLabel}>Difficulty</Text>
        <View style={styles.diffRow}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.diffBtn,
                { borderColor: d.color },
                selected === key && { backgroundColor: d.color },
              ]}
              onPress={() => setSelected(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.diffBtnText, selected === key && styles.diffBtnTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Mode</Text>
        <View style={[styles.modeSelector, { borderColor: modeColor }]}>
          <TouchableOpacity
            onPress={() => setModeIndex(i => (i + MODES.length - 1) % MODES.length)}
            hitSlop={12}
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
            hitSlop={12}
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
          onPress={() => onPlay(selected, currentMode.key)}
          activeOpacity={0.85}
        >
          <Text style={styles.playBtnText}>Play</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showSettings} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSettings(false)}>
          <View style={styles.settingsModal} onStartShouldSetResponder={() => true}>
            <Text style={styles.settingsModalTitle}>Settings</Text>

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
              <Text style={styles.settingsDoneText}>Done</Text>
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
    backgroundColor: '#0f0f2e',
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
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 58,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#a5b4fc',
    textAlign: 'center',
    marginBottom: 36,
  },
  sectionLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
    width: '100%',
  },
  diffBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  diffBtnText: {
    color: '#e0e7ff',
    fontSize: 15,
    fontWeight: '700',
  },
  diffBtnTextActive: {
    color: '#fff',
  },
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  modeArrow: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
    width: 24,
    textAlign: 'center',
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  modeIcon: {
    fontSize: 28,
  },
  modeName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeSub: {
    color: '#a5b4fc',
    fontSize: 12,
    textAlign: 'center',
  },
  modeDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  modeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2d2d6e',
  },
  playBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsModal: {
    width: '82%',
    backgroundColor: '#1e1e4a',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 14,
  },
  settingsModalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  settingsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#2d2d6e',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingsToggleOn: {
    borderColor: '#6366f1',
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
    color: '#e0e7ff',
    fontSize: 16,
    fontWeight: '600',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#2d2d6e',
  },
  pillOn: {
    backgroundColor: '#6366f1',
  },
  pillText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
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
  },
  settingsDoneText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '700',
  },
});
