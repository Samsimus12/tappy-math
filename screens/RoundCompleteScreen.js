import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function RoundCompleteScreen({ round, roundScore, totalScore, targetNumber, foundEquations, onContinue, onBack }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.badge}>🎉 Round {round} Complete!</Text>
        <Text style={styles.emoji}>⭐</Text>

        <View style={styles.numberBox}>
          <Text style={styles.numberLabel}>You found all equations equal to</Text>
          <Text style={styles.number}>{targetNumber}</Text>
        </View>

        <View style={styles.scoresRow}>
          <View style={styles.scoreTile}>
            <Text style={styles.scoreTileValue}>+{roundScore}</Text>
            <Text style={styles.scoreTileLabel}>This Round</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreTile}>
            <Text style={[styles.scoreTileValue, styles.totalValue]}>{totalScore}</Text>
            <Text style={styles.scoreTileLabel}>Total Score</Text>
          </View>
        </View>

        {foundEquations.length > 0 && (
          <View style={styles.foundBox}>
            <Text style={styles.foundHeading}>✅ Equations you found</Text>
            <View style={styles.foundList}>
              {foundEquations.map((eq, i) => (
                <View key={i} style={styles.foundChip}>
                  <Text style={styles.foundEq}>{eq}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onBack} activeOpacity={0.6} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6E3',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
  },
  badge: {
    color: '#FF7043',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  numberBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  numberLabel: {
    color: '#7B6B5A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  number: {
    color: '#FF7043',
    fontSize: 72,
    fontWeight: '800',
    lineHeight: 80,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#FF7043',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreTile: {
    flex: 1,
    alignItems: 'center',
  },
  scoreTileValue: {
    color: '#27AE60',
    fontSize: 40,
    fontWeight: '800',
  },
  totalValue: {
    color: '#FF7043',
  },
  scoreTileLabel: {
    color: '#7B6B5A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  divider: {
    width: 2,
    height: 48,
    backgroundColor: '#F0E8DE',
    marginHorizontal: 8,
  },
  foundBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
  foundHeading: {
    color: '#27AE60',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  foundList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foundChip: {
    backgroundColor: '#E8F8EF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  foundEq: {
    color: '#1E8449',
    fontSize: 15,
    fontWeight: '700',
  },
  continueBtn: {
    backgroundColor: '#FF7043',
    paddingVertical: 20,
    paddingHorizontal: 56,
    borderRadius: 50,
    shadowColor: '#FF7043',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backLinkText: {
    color: '#FF7043',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
