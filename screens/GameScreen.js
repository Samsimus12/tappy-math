import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Animated, Modal } from 'react-native';
import FloatingEquation from '../components/FloatingEquation';
import FallingEquation from '../components/FallingEquation';
import { playSound, startMusic, stopMusic } from '../utils/audio';
import { generateTarget, buildEquationPool } from '../utils/mathEngine';
import { DIFFICULTY } from '../constants/difficulty';

const { width: SW, height: SH } = Dimensions.get('window');
const HEADER_H = 130;
const FOOTER_H = 20;
const EQ_AREA_H = SH - HEADER_H - FOOTER_H;
const EQ_BOUNDS = { width: SW, height: EQ_AREA_H };

const SURVIVAL_START_TIME = 30;

function ScorePopup({ id, value, onComplete }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const x = useRef(SW * 0.25 + Math.random() * SW * 0.5).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -80, duration: 900, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(() => onComplete(id));
  }, []);

  const isPositive = value > 0;
  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 60,
        left: x,
        color: isPositive ? '#22c55e' : '#ef4444',
        fontSize: 22,
        fontWeight: '800',
        opacity,
        transform: [{ translateY }],
      }}
    >
      {isPositive ? `+${value}` : value}
    </Animated.Text>
  );
}

export default function GameScreen({ onGameEnd, onBack, totalScore, round, difficulty, mode }) {
  const config = DIFFICULTY[difficulty] ?? DIFFICULTY.medium;
  const isSurvival = mode === 'survival';
  const isFalling = mode === 'falling';

  const [targetNumber, setTargetNumber] = useState(0);
  const [equations, setEquations] = useState([]);
  const [roundScore, setRoundScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(isSurvival ? SURVIVAL_START_TIME : config.duration);
  const [done, setDone] = useState(false);
  const [equationsSolved, setEquationsSolved] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [scorePopups, setScorePopups] = useState([]);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const popupCounter = useRef(0);
  const equationsRef = useRef([]);
  const roundScoreRef = useRef(0);
  const targetNumberRef = useRef(0);
  const equationsSolvedRef = useRef(0);
  const wrongPenaltyRef = useRef(config.wrongPenalty);
  const correctPointsRef = useRef(config.correctPoints);
  const countdownScale = useRef(new Animated.Value(1)).current;
  const countdownOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { equationsRef.current = equations; }, [equations]);

  useEffect(() => {
    loadGame();
    startMusic();
  }, []);

  // Timer
  useEffect(() => {
    if (done || countdown !== null || showQuitModal || equations.length === 0) return;
    if (timeLeft === 0) {
      setDone(true);
      playSound('fail');
      stopMusic();
      onGameEnd({ ...buildResult(equationsRef.current, 0), allFound: false });
      return;
    }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, countdown, showQuitModal, equations.length]);

  // Countdown animation
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) playSound('tick');
    if (countdown === 0) playSound('go');
    countdownScale.setValue(0.4);
    countdownOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(countdownScale, { toValue: 1, useNativeDriver: true, bounciness: 8 }),
      Animated.timing(countdownOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    if (countdown === 0) {
      const t = setTimeout(() => setCountdown(null), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function buildResult(eqs = equationsRef.current, tl = null) {
    return {
      roundScore: roundScoreRef.current,
      targetNumber: targetNumberRef.current,
      correctFound: eqs.filter(e => e.isCorrect && e.tapped).length,
      totalCorrect: eqs.filter(e => e.isCorrect).length,
      wrongTaps: eqs.filter(e => !e.isCorrect && e.tapped).length,
      missedEquations: eqs.filter(e => e.isCorrect && !e.tapped).map(e => e.equation),
      foundEquations: eqs.filter(e => e.isCorrect && e.tapped).map(e => e.equation),
      equationsSolved: equationsSolvedRef.current,
      mode,
      timeLeft: tl ?? 0,
    };
  }

  function loadGame(withCountdown = true) {
    const target = generateTarget(config);
    const { correct, distractors } = buildEquationPool(target, config);

    setTargetNumber(target);
    targetNumberRef.current = target;

    const all = [
      ...correct.map((eq, i) => ({ id: `c-${i}-${target}`, equation: eq, isCorrect: true, tapped: false, correct: false })),
      ...distractors.map((eq, i) => ({ id: `d-${i}-${target}`, equation: eq, isCorrect: false, tapped: false, correct: false })),
    ].sort(() => Math.random() - 0.5);

    setEquations(all);
    if (withCountdown) setCountdown(3);
  }

  // Check if all correct equations are found
  useEffect(() => {
    if (done || equations.length === 0) return;
    const allFound = equations.filter(e => e.isCorrect).every(e => e.tapped);
    if (!allFound) return;

    if (isSurvival) {
      playSound('success');
      setTimeLeft(t => t + 20);
      setEquationsSolved(n => { const next = n + 1; equationsSolvedRef.current = next; return next; });
      roundScoreRef.current = 0;
      setRoundScore(0);
      loadGame(false);
    } else {
      setDone(true);
      playSound('success');
      onGameEnd({ ...buildResult(equationsRef.current, timeLeft), allFound: true });
    }
  }, [equations]);

  const handleTap = useCallback((eqId) => {
    const target = equationsRef.current.find(e => e.id === eqId);
    if (!target || target.tapped) return;

    const delta = target.isCorrect ? correctPointsRef.current : -wrongPenaltyRef.current;
    const next = Math.max(0, roundScoreRef.current + delta);
    roundScoreRef.current = next;
    setRoundScore(next);

    setEquations(prev => {
      const updated = prev.map(e =>
        e.id === eqId ? { ...e, tapped: true, correct: target.isCorrect } : e
      );
      equationsRef.current = updated;
      return updated;
    });

    if (isSurvival && !target.isCorrect) setTimeLeft(t => Math.max(0, t - 5));

    const pid = popupCounter.current++;
    setScorePopups(prev => [...prev, { id: pid, value: delta }]);
    playSound(target.isCorrect ? 'correct' : 'wrong');
  }, [isSurvival]);

  const removePopup = useCallback((id) => {
    setScorePopups(prev => prev.filter(p => p.id !== id));
  }, []);

  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 15 ? '#fb923c' : '#fff';
  const foundCount = equations.filter(e => e.isCorrect && e.tapped).length;
  const totalCount = equations.filter(e => e.isCorrect).length;

  if (equations.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statBox}>
          <TouchableOpacity onPress={() => setShowQuitModal(true)} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{roundScore}</Text>
        </View>

        <View style={styles.targetBox}>
          <Text style={[styles.roundLabel, { color: isSurvival ? '#f43f5e' : isFalling ? '#22d3ee' : config.color }]}>
            {isSurvival
              ? `Survival · ${equationsSolved} solved`
              : isFalling
                ? `Falling · Round ${round} · ${config.label}`
                : `Round ${round} · ${config.label}`}
          </Text>
          <Text style={styles.equalsLabel}>find equations equal to</Text>
          <Text style={styles.targetNum}>{targetNumber}</Text>
          <Text style={styles.foundCount}>{foundCount} / {totalCount} found</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={[styles.statValue, { color: timerColor }]}>{timeLeft}</Text>
        </View>
      </View>

      <View style={styles.eqArea} pointerEvents={countdown !== null ? 'none' : 'box-none'}>
        {equations.map(e => isFalling ? (
          <FallingEquation
            key={e.id}
            eqId={e.id}
            equation={e.equation}
            tapped={e.tapped}
            correct={e.correct}
            onTap={handleTap}
            screenWidth={SW}
            screenHeight={EQ_AREA_H}
            speedMultiplier={config.speedMultiplier}
          />
        ) : (
          <FloatingEquation
            key={e.id}
            eqId={e.id}
            equation={e.equation}
            tapped={e.tapped}
            correct={e.correct}
            onTap={handleTap}
            bounds={EQ_BOUNDS}
            speedMultiplier={config.speedMultiplier}
          />
        ))}

        {countdown !== null && (
          <View style={styles.countdownOverlay} pointerEvents="none">
            <Animated.Text
              style={[
                styles.countdownText,
                countdown === 0 && styles.countdownGo,
                { opacity: countdownOpacity, transform: [{ scale: countdownScale }] },
              ]}
            >
              {countdown === 0 ? 'Go!' : countdown}
            </Animated.Text>
          </View>
        )}
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {scorePopups.map(p => (
          <ScorePopup key={p.id} id={p.id} value={p.value} onComplete={removePopup} />
        ))}
      </View>

      <Modal visible={showQuitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Quit round?</Text>
            <Text style={styles.modalSub}>Your progress will be lost.</Text>
            <TouchableOpacity style={styles.modalQuitBtn} onPress={onBack} activeOpacity={0.85}>
              <Text style={styles.modalQuitText}>Quit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowQuitModal(false)} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>Keep Playing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f2e',
  },
  center: {
    flex: 1,
    backgroundColor: '#0f0f2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#a5b4fc',
    fontSize: 18,
  },
  header: {
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#1a1a40',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d6e',
  },
  statBox: {
    alignItems: 'center',
    minWidth: 60,
  },
  backBtn: {
    marginBottom: 4,
  },
  backBtnText: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
  },
  statLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  targetBox: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  roundLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  equalsLabel: {
    color: '#a5b4fc',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  targetNum: {
    color: '#fbbf24',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 1,
    lineHeight: 38,
  },
  foundCount: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  eqArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 15, 46, 0.6)',
  },
  countdownText: {
    fontSize: 100,
    fontWeight: '800',
    color: '#fff',
  },
  countdownGo: {
    fontSize: 72,
    color: '#22c55e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#1e1e4a',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '78%',
    gap: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  modalSub: {
    color: '#a5b4fc',
    fontSize: 14,
    marginBottom: 4,
  },
  modalQuitBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 50,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  modalQuitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  modalCancelText: {
    color: '#a5b4fc',
    fontSize: 15,
    fontWeight: '600',
  },
});
