import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function ResultsScreen({ result, onPlayAgain, onHome }) {
  const { roundScore, totalScore, targetNumber, correctFound, totalCorrect, wrongTaps, missedEquations, equationsSolved, mode } = result;
  const isSurvival = mode === 'survival';
  const accuracy = totalCorrect > 0 ? Math.round((correctFound / totalCorrect) * 100) : 0;

  let grade, gradeColor;
  if (isSurvival) {
    const solved = equationsSolved ?? 0;
    if (solved >= 10)     { grade = '🏆 Champion!';   gradeColor = '#F39C12'; }
    else if (solved >= 5) { grade = '⭐ Awesome!';    gradeColor = '#27AE60'; }
    else if (solved >= 2) { grade = '👍 Good try!';   gradeColor = '#3498DB'; }
    else                  { grade = '💪 Keep going!'; gradeColor = '#FF7043'; }
  } else {
    if (accuracy >= 80)      { grade = '🌟 Amazing!';     gradeColor = '#F39C12'; }
    else if (accuracy >= 60) { grade = '🎉 Great Job!';   gradeColor = '#27AE60'; }
    else if (accuracy >= 40) { grade = '👍 Nice Try!';    gradeColor = '#3498DB'; }
    else                     { grade = '💪 Keep Going!';  gradeColor = '#FF7043'; }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <Text style={styles.heading}>⏰ Time's Up!</Text>
          <Text style={[styles.grade, { color: gradeColor }]}>{grade}</Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>⭐ Total Score</Text>
          <Text style={styles.scoreValue}>{totalScore}</Text>
          {roundScore > 0 && (
            <Text style={styles.roundScoreNote}>+{roundScore} this round</Text>
          )}
        </View>

        <View style={styles.statsGrid}>
          {isSurvival && <StatTile label="Numbers Solved" value={equationsSolved ?? 0} wide />}
          <StatTile label="Last Number" value={targetNumber} wide={!isSurvival} />
          <StatTile label="Equations Found" value={`${correctFound} / ${totalCorrect}`} />
          <StatTile label="Accuracy" value={`${accuracy}%`} />
          <StatTile label="Wrong Taps" value={wrongTaps} />
        </View>

        {missedEquations.length > 0 && (
          <View style={styles.missedBox}>
            <Text style={styles.missedHeading}>❌ Equations you missed</Text>
            <View style={styles.missedList}>
              {missedEquations.map((eq, i) => (
                <View key={i} style={styles.missedChip}>
                  <Text style={styles.missedEq}>{eq}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.playBtn} onPress={onPlayAgain} activeOpacity={0.85}>
            <Text style={styles.playBtnText}>▶ Play Again!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={onHome} activeOpacity={0.7}>
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value, wide }) {
  return (
    <View style={[styles.tile, wide && styles.tileWide]}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6E3',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 20,
  },
  topSection: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 34,
    fontWeight: '800',
    color: '#2C2C2C',
    marginBottom: 6,
  },
  grade: {
    fontSize: 22,
    fontWeight: '800',
  },
  scoreBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#FF7043',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreLabel: {
    color: '#7B6B5A',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scoreValue: {
    color: '#FF7043',
    fontSize: 52,
    fontWeight: '800',
    marginTop: 2,
  },
  roundScoreNote: {
    color: '#27AE60',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  tile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tileWide: {
    width: '100%',
  },
  tileValue: {
    color: '#2C2C2C',
    fontSize: 22,
    fontWeight: '800',
  },
  tileLabel: {
    color: '#7B6B5A',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  missedBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
  missedHeading: {
    color: '#E74C3C',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  missedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  missedChip: {
    backgroundColor: '#FEF0EE',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  missedEq: {
    color: '#C0392B',
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  playBtn: {
    backgroundColor: '#FF7043',
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 50,
    shadowColor: '#FF7043',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  homeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  homeBtnText: {
    color: '#FF7043',
    fontSize: 16,
    fontWeight: '700',
  },
});
