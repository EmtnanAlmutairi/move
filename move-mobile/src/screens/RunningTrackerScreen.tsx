import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { runHistory } from '../data/mockData';
import { colors, spacing } from '../theme/tokens';
import { RunSession } from '../types';

type RunState = 'idle' | 'running' | 'paused' | 'finished';
type GoalKm = 3 | 5 | 10 | 0;

const GOALS: { km: GoalKm; label: string }[] = [
  { km: 3, label: '3 كم' },
  { km: 5, label: '5 كم' },
  { km: 10, label: '10 كم' },
  { km: 0, label: 'حر' }
];

function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatPace(secPerKm: number): string {
  if (!secPerKm || secPerKm === Infinity) return '--:--';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RunningTrackerScreen() {
  const [runState, setRunState] = useState<RunState>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [calories, setCalories] = useState(0);
  const [goalKm, setGoalKm] = useState<GoalKm>(5);
  const [history, setHistory] = useState<RunSession[]>(runHistory);
  const [finishedSession, setFinishedSession] = useState<RunSession | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const distanceRef = useRef(0);
  const elapsedRef = useRef(0);

  const pace = distanceKm > 0.05 ? elapsedSec / distanceKm : 0;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopGPS = useCallback(async () => {
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
  }, []);

  useEffect(() => {
    if (runState === 'running') {
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSec(elapsedRef.current);
        setCalories(Math.round(distanceRef.current * 70 * 1.1));
      }, 1000);
    } else {
      stopTimer();
    }
    return stopTimer;
  }, [runState, stopTimer]);

  const startGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'إذن الموقع مطلوب',
        'يحتاج MOVE إلى الوصول لموقعك لتتبع مسار الجري. سيتم استخدام البيانات المحاكاة الآن.',
        [{ text: 'حسنًا' }]
      );
      startSimulation();
      return;
    }

    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        if (lastCoordRef.current) {
          const delta = haversineKm(
            lastCoordRef.current.latitude,
            lastCoordRef.current.longitude,
            latitude,
            longitude
          );
          if (delta < 0.5) {
            distanceRef.current += delta;
            setDistanceKm(parseFloat(distanceRef.current.toFixed(2)));
          }
        }
        lastCoordRef.current = { latitude, longitude };
      }
    );
  };

  const startSimulation = () => {
    const simInterval = setInterval(() => {
      if (runState !== 'running') {
        clearInterval(simInterval);
        return;
      }
      distanceRef.current += 0.008;
      setDistanceKm(parseFloat(distanceRef.current.toFixed(2)));
    }, 1000);
  };

  const handleStart = async () => {
    distanceRef.current = 0;
    elapsedRef.current = 0;
    setDistanceKm(0);
    setElapsedSec(0);
    setCalories(0);
    lastCoordRef.current = null;
    setRunState('running');
    await startGPS();
  };

  const handlePause = () => {
    setRunState('paused');
    stopGPS();
  };

  const handleResume = async () => {
    setRunState('running');
    await startGPS();
  };

  const handleFinish = () => {
    stopTimer();
    stopGPS();
    const session: RunSession = {
      id: `r-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      dateLabel: 'الآن',
      durationSec: elapsedRef.current,
      distanceKm: parseFloat(distanceRef.current.toFixed(2)),
      avgPaceSecPerKm: distanceRef.current > 0.05 ? Math.round(elapsedRef.current / distanceRef.current) : 0,
      calories: Math.round(distanceRef.current * 70 * 1.1),
      avgHeartRate: 148,
      steps: Math.round(distanceRef.current * 1350)
    };
    setFinishedSession(session);
    setHistory([session, ...history]);
    setRunState('finished');
  };

  const handleReset = () => {
    setRunState('idle');
    setFinishedSession(null);
    setElapsedSec(0);
    setDistanceKm(0);
    setCalories(0);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>تتبع الجري</Text>

        {runState === 'idle' && (
          <>
            <View style={styles.statsPreviewRow}>
              <View style={styles.statsPreviewCard}>
                <Text style={styles.statsPreviewValue}>
                  {runHistory.reduce((s, r) => s + r.distanceKm, 0).toFixed(1)} كم
                </Text>
                <Text style={styles.statsPreviewLabel}>هذا الشهر</Text>
              </View>
              <View style={styles.statsPreviewCard}>
                <Text style={styles.statsPreviewValue}>
                  {formatPace(Math.round(
                    runHistory.reduce((s, r) => s + r.avgPaceSecPerKm, 0) / runHistory.length
                  ))}
                </Text>
                <Text style={styles.statsPreviewLabel}>متوسط الإيقاع</Text>
              </View>
              <View style={styles.statsPreviewCard}>
                <Text style={styles.statsPreviewValue}>{runHistory.length}</Text>
                <Text style={styles.statsPreviewLabel}>جلسات</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>اختر هدفك</Text>
            <View style={styles.goalRow}>
              {GOALS.map((g) => (
                <Pressable
                  key={g.km}
                  style={[styles.goalChip, goalKm === g.km && styles.goalChipActive]}
                  onPress={() => setGoalKm(g.km)}
                >
                  <Text style={[styles.goalChipText, goalKm === g.km && styles.goalChipTextActive]}>
                    {g.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={handleStart}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.startBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startBtnIcon}>▶</Text>
                <Text style={styles.startBtnText}>ابدأ الجري</Text>
              </LinearGradient>
            </Pressable>
          </>
        )}

        {(runState === 'running' || runState === 'paused') && (
          <View style={styles.liveCard}>
            <View style={styles.liveHeader}>
              <View style={[styles.liveDot, runState === 'running' ? styles.liveDotActive : styles.liveDotPaused]} />
              <Text style={styles.liveStatus}>
                {runState === 'running' ? 'يعمل الآن' : 'متوقف مؤقتاً'}
              </Text>
            </View>

            <Text style={styles.bigTimer}>{formatTime(elapsedSec)}</Text>

            <View style={styles.liveStatsRow}>
              <View style={styles.liveStat}>
                <Text style={styles.liveStatValue}>{distanceKm.toFixed(2)}</Text>
                <Text style={styles.liveStatLabel}>كم</Text>
              </View>
              <View style={styles.liveStatDivider} />
              <View style={styles.liveStat}>
                <Text style={styles.liveStatValue}>{formatPace(pace)}</Text>
                <Text style={styles.liveStatLabel}>إيقاع/كم</Text>
              </View>
              <View style={styles.liveStatDivider} />
              <View style={styles.liveStat}>
                <Text style={styles.liveStatValue}>{calories}</Text>
                <Text style={styles.liveStatLabel}>سعرة</Text>
              </View>
            </View>

            {goalKm > 0 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((distanceKm / goalKm) * 100, 100)}%` }
                  ]}
                />
                <Text style={styles.progressLabel}>
                  {distanceKm.toFixed(2)} / {goalKm} كم
                </Text>
              </View>
            )}

            <View style={styles.controlsRow}>
              {runState === 'running' ? (
                <Pressable style={styles.pauseBtn} onPress={handlePause}>
                  <Text style={styles.pauseBtnText}>⏸ إيقاف مؤقت</Text>
                </Pressable>
              ) : (
                <Pressable onPress={handleResume}>
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    style={styles.resumeBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.resumeBtnText}>▶ استمرار</Text>
                  </LinearGradient>
                </Pressable>
              )}
              <Pressable style={styles.stopBtn} onPress={handleFinish}>
                <Text style={styles.stopBtnText}>⏹ إنهاء</Text>
              </Pressable>
            </View>
          </View>
        )}

        {runState === 'finished' && finishedSession && (
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.summaryHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.summaryBravo}>أحسنت! 🎉</Text>
              <Text style={styles.summarySubtitle}>جلسة جري مكتملة</Text>
            </LinearGradient>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{finishedSession.distanceKm.toFixed(2)}</Text>
                <Text style={styles.summaryItemLabel}>كم</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{formatTime(finishedSession.durationSec)}</Text>
                <Text style={styles.summaryItemLabel}>الوقت</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{formatPace(finishedSession.avgPaceSecPerKm)}</Text>
                <Text style={styles.summaryItemLabel}>إيقاع/كم</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{finishedSession.calories}</Text>
                <Text style={styles.summaryItemLabel}>سعرة</Text>
              </View>
            </View>

            <Pressable onPress={handleReset}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.newRunBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.newRunBtnText}>جري جديد</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {runState === 'idle' && (
          <>
            <Text style={styles.sectionLabel}>آخر الجلسات</Text>
            {history.map((run) => (
              <View key={run.id} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyDate}>{run.dateLabel}</Text>
                  <Text style={styles.historyTime}>{formatTime(run.durationSec)}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyDist}>{run.distanceKm} كم</Text>
                  <Text style={styles.historyPace}>{formatPace(run.avgPaceSecPerKm)} /كم</Text>
                </View>
                <View style={styles.historyCalories}>
                  <Text style={styles.historyCaloriesVal}>{run.calories}</Text>
                  <Text style={styles.historyCaloriesLabel}>سعرة</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 100 },
  screenTitle: {
    textAlign: 'right',
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md
  },
  statsPreviewRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: spacing.lg
  },
  statsPreviewCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.md,
    alignItems: 'center'
  },
  statsPreviewValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary
  },
  statsPreviewLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  },
  sectionLabel: {
    textAlign: 'right',
    fontWeight: '800',
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm
  },
  goalRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: spacing.lg
  },
  goalChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center'
  },
  goalChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.cardSoft
  },
  goalChipText: {
    fontWeight: '700',
    color: colors.muted,
    fontSize: 13
  },
  goalChipTextActive: {
    color: colors.primary
  },
  startBtn: {
    borderRadius: 20,
    paddingVertical: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: spacing.xl
  },
  startBtnIcon: {
    color: '#fff',
    fontSize: 20
  },
  startBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800'
  },
  liveCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  liveHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  liveDotActive: {
    backgroundColor: colors.success
  },
  liveDotPaused: {
    backgroundColor: colors.warning
  },
  liveStatus: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 14
  },
  bigTimer: {
    textAlign: 'center',
    fontSize: 64,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -2,
    marginVertical: spacing.md
  },
  liveStatsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  liveStat: {
    flex: 1,
    alignItems: 'center'
  },
  liveStatValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary
  },
  liveStatLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  liveStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.line
  },
  progressBar: {
    backgroundColor: colors.line,
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative'
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8
  },
  progressLabel: {
    textAlign: 'right',
    fontSize: 11,
    color: colors.muted,
    marginTop: 4
  },
  controlsRow: {
    flexDirection: 'row-reverse',
    gap: 12
  },
  pauseBtn: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  pauseBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16
  },
  resumeBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  resumeBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16
  },
  stopBtn: {
    flex: 1,
    backgroundColor: '#FFF0EE',
    borderWidth: 2,
    borderColor: '#DA3D2A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  stopBtnText: {
    color: '#DA3D2A',
    fontWeight: '800',
    fontSize: 16
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    marginBottom: spacing.lg
  },
  summaryHeader: {
    paddingVertical: spacing.xl,
    alignItems: 'center'
  },
  summaryBravo: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900'
  },
  summarySubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 4
  },
  summaryGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: 1
  },
  summaryItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  summaryVal: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary
  },
  summaryItemLabel: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  newRunBtn: {
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center'
  },
  newRunBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17
  },
  historyRow: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
    gap: 12
  },
  historyLeft: {
    flex: 1,
    alignItems: 'flex-end'
  },
  historyDate: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 2
  },
  historyTime: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15
  },
  historyRight: {
    alignItems: 'center'
  },
  historyDist: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  historyPace: {
    color: colors.muted,
    fontSize: 12
  },
  historyCalories: {
    alignItems: 'center',
    minWidth: 52
  },
  historyCaloriesVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  historyCaloriesLabel: {
    color: colors.muted,
    fontSize: 11
  }
});
