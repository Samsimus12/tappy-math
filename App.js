import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import RoundCompleteScreen from './screens/RoundCompleteScreen';
import ResultsScreen from './screens/ResultsScreen';
import { loadSettings, saveSettings } from './utils/settingsStorage';
import { initAudio, setSfxEnabled, setMusicEnabled, startMenuMusic, stopMenuMusic, startMusic, stopMusic } from './utils/audio';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [sfxEnabled, setSfx] = useState(true);
  const [musicEnabled, setMusic] = useState(true);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [result, setResult] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [mode, setMode] = useState('normal');

  useEffect(() => {
    initAudio().then(() => {
      loadSettings().then(s => {
        setSfx(s.sfxEnabled);
        setMusic(s.musicEnabled);
        setSfxEnabled(s.sfxEnabled);
        setMusicEnabled(s.musicEnabled);
        if (s.musicEnabled) startMenuMusic();
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (screen === 'home') {
      stopMusic().then(() => startMenuMusic());
    } else if (screen === 'game') {
      stopMenuMusic();
    } else if (screen === 'results') {
      stopMusic();
    }
  }, [screen]);

  function handleToggleSfx() {
    const next = !sfxEnabled;
    setSfx(next);
    setSfxEnabled(next);
    saveSettings({ sfxEnabled: next, musicEnabled }).catch(() => {});
  }

  function handleToggleMusic() {
    const next = !musicEnabled;
    setMusic(next);
    setMusicEnabled(next);
    if (!next) {
      stopMusic();
      stopMenuMusic();
    } else {
      if (screen === 'home') startMenuMusic();
      else if (screen === 'game') startMusic();
    }
    saveSettings({ sfxEnabled, musicEnabled: next }).catch(() => {});
  }

  function handlePlay(selectedDifficulty, selectedMode = 'normal') {
    setDifficulty(selectedDifficulty);
    setMode(selectedMode);
    setScreen('game');
  }

  function handleGameEnd(gameResult) {
    const finalScore = totalScore + gameResult.roundScore;

    if (gameResult.allFound) {
      setLastResult(gameResult);
      setTotalScore(prev => prev + gameResult.roundScore);
      setScreen('round-complete');
    } else {
      setResult({ ...gameResult, totalScore: finalScore });
      setScreen('results');
    }
  }

  function handleContinue() {
    setRound(prev => prev + 1);
    setScreen('game');
  }

  function handleBack() {
    setRound(1);
    setTotalScore(0);
    setLastResult(null);
    setResult(null);
    setScreen('home');
  }

  function handlePlayAgain() {
    setRound(1);
    setTotalScore(0);
    setLastResult(null);
    setResult(null);
    setScreen('game');
  }

  return (
    <>
      <StatusBar style="light" />
      {screen === 'home' && (
        <HomeScreen
          onPlay={handlePlay}
          sfxEnabled={sfxEnabled}
          musicEnabled={musicEnabled}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          key={`round-${round}`}
          onGameEnd={handleGameEnd}
          onBack={handleBack}
          totalScore={totalScore}
          round={round}
          difficulty={difficulty}
          mode={mode}
        />
      )}
      {screen === 'round-complete' && (
        <RoundCompleteScreen
          round={round}
          roundScore={lastResult?.roundScore ?? 0}
          totalScore={totalScore}
          targetNumber={lastResult?.targetNumber ?? 0}
          foundEquations={lastResult?.foundEquations ?? []}
          onContinue={handleContinue}
          onBack={handleBack}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          result={result}
          onPlayAgain={handlePlayAgain}
          onHome={handleBack}
        />
      )}
    </>
  );
}
