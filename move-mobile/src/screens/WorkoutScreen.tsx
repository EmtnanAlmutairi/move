import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { weeklyWorkout } from '../data/mockData';
import { screenStyles } from '../theme/screenStyles';
import { colors, spacing } from '../theme/tokens';
import { Exercise } from '../types';

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const INTENSITY_LABELS: Record<string, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي'
};
const INTENSITY_COLORS: Record<string, string> = {
  low: colors.success,
  medium: colors.warning,
  high: colors.primary
};

export function WorkoutScreen({ navigation, route }: any) {
  const workoutId = route?.params?.workoutId;
  const current = workoutId
    ? weeklyWorkout.find((w) => w.id === workoutId) || weeklyWorkout[0]
    : weeklyWorkout.find((w) => !w.completed) || weeklyWorkout[0];

  const exercises: Exercise[] = current.exercises || [];

  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [workoutDone, setWorkoutDone] = useState(false);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (restActive && restTimer > 0) {
      restRef.current = setInterval(() => {
        setRestTimer((t) => {
          if (t <= 1) {
            clearInterval(restRef.current!);
            setRestActive(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restRef.current!);
  }, [restActive]);

  const totalSets = exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = Object.values(completedSets).reduce((s, v) => s + v, 0);
  const progressPct = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  const handleCompleteSet = (ex: Exercise) => {
    const done = completedSets[ex.id] || 0;
    if (done < ex.sets) {
      const next = done + 1;
      setCompletedSets((prev) => ({ ...prev, [ex.id]: next }));
      if (next < ex.sets) {
        setRestTimer(ex.restSec);
        setRestActive(true);
      } else if (activeExIdx < exercises.length - 1) {
        setActiveExIdx(activeExIdx + 1);
        setRestTimer(ex.restSec + 15);
        setRestActive(true);
      } else {
        setWorkoutDone(true);
      }
    }
  };

  const skipRest = () => {
    clearInterval(restRef.current!);
    setRestActive(false);
    setRestTimer(0);
  };

  return (
    <SafeAreaView style={screenStyles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.backText}>→ رجوع</Text>
        </Pressable>

        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=900' }}
          style={styles.hero}
        />

        <View style={styles.headerRow}>
          <View style={[styles.intensityBadge, { backgroundColor: INTENSITY_COLORS[current.intensity] + '22', borderColor: INTENSITY_COLORS[current.intensity] }]}>
            <Text style={[styles.intensityText, { color: INTENSITY_COLORS[current.intensity] }]}>
              {INTENSITY_LABELS[current.intensity]}
            </Text>
          </View>
          <Text style={styles.dayLabel}>{current.dayLabel}</Text>
        </View>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.meta}>
          {current.durationMin} دقيقة • المدرب {current.coachName}
        </Text>

        <View style={styles.kpisRow}>
          <View style={styles.kpi}>
            <Text style={styles.kpiVal}>{exercises.length}</Text>
            <Text style={styles.kpiLabel}>تمرين</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiVal}>{totalSets}</Text>
            <Text style={styles.kpiLabel}>مجموعة</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiVal}>350</Text>
            <Text style={styles.kpiLabel}>سعرة</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiVal}>{current.durationMin}</Text>
            <Text style={styles.kpiLabel}>دقيقة</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>التقدم</Text>
            <Text style={styles.progressValue}>{doneSets} / {totalSets} مجموعات</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={[styles.progressFill, { width: `${progressPct}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        {restActive && (
          <View style={styles.restBanner}>
            <Text style={styles.restTitle}>⏱ وقت الراحة</Text>
            <Text style={styles.restTimer}>{formatSec(restTimer)}</Text>
            <Pressable style={styles.skipBtn} onPress={skipRest}>
              <Text style={styles.skipBtnText}>تخطي الراحة</Text>
            </Pressable>
          </View>
        )}

        {workoutDone && (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.doneBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.doneEmoji}>🏆</Text>
            <Text style={styles.doneTitle}>أتممت التمرين!</Text>
            <Text style={styles.doneSub}>عمل رائع، واصل الزخم</Text>
          </LinearGradient>
        )}

        <Text style={styles.sectionTitle}>قائمة التمارين</Text>

        {exercises.map((ex, i) => {
          const done = completedSets[ex.id] || 0;
          const isActive = i === activeExIdx && !workoutDone;
          const isComplete = done >= ex.sets;

          return (
            <View
              key={ex.id}
              style={[
                styles.exCard,
                isActive && styles.exCardActive,
                isComplete && styles.exCardDone
              ]}
            >
              <View style={styles.exHeader}>
                <View style={styles.exLeft}>
                  <Text style={[styles.exNumber, isComplete && styles.exNumberDone]}>
                    {isComplete ? '✓' : `${i + 1}`}
                  </Text>
                </View>
                <View style={styles.exInfo}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exMuscle}>{ex.muscleGroup}</Text>
                  {ex.notes && <Text style={styles.exNotes}>{ex.notes}</Text>}
                </View>
              </View>

              <View style={styles.exStats}>
                <View style={styles.exStat}>
                  <Text style={styles.exStatVal}>{ex.sets}</Text>
                  <Text style={styles.exStatLabel}>مجموعات</Text>
                </View>
                <View style={styles.exStat}>
                  <Text style={styles.exStatVal}>{ex.reps}</Text>
                  <Text style={styles.exStatLabel}>تكرارات</Text>
                </View>
                <View style={styles.exStat}>
                  <Text style={styles.exStatVal}>{ex.restSec} ث</Text>
                  <Text style={styles.exStatLabel}>راحة</Text>
                </View>
                <View style={styles.exStat}>
                  <Text style={[styles.exStatVal, { color: isComplete ? colors.success : colors.primary }]}>
                    {done}/{ex.sets}
                  </Text>
                  <Text style={styles.exStatLabel}>منجز</Text>
                </View>
              </View>

              {isActive && !isComplete && (
                <Pressable
                  style={styles.setDoneBtn}
                  onPress={() => handleCompleteSet(ex)}
                >
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    style={styles.setDoneBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.setDoneBtnText}>
                      ✓ مجموعة {done + 1} من {ex.sets} منتهية
                    </Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 100
  },
  backBtn: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm
  },
  backText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15
  },
  hero: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    marginBottom: spacing.md
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  intensityBadge: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '700'
  },
  dayLabel: {
    color: colors.muted,
    fontWeight: '600'
  },
  title: {
    textAlign: 'right',
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4
  },
  meta: {
    textAlign: 'right',
    color: colors.muted,
    marginBottom: spacing.md
  },
  kpisRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: spacing.md
  },
  kpi: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.sm,
    alignItems: 'center'
  },
  kpiVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary
  },
  kpiLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },
  progressSection: {
    marginBottom: spacing.md
  },
  progressLabelRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  progressLabel: {
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right'
  },
  progressValue: {
    color: colors.muted,
    fontSize: 13
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.line,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  restBanner: {
    backgroundColor: '#FFF8EE',
    borderWidth: 2,
    borderColor: colors.warning,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md
  },
  restTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.warning
  },
  restTimer: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.text,
    marginVertical: spacing.xs
  },
  skipBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8
  },
  skipBtnText: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 13
  },
  doneBanner: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md
  },
  doneEmoji: {
    fontSize: 40
  },
  doneTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8
  },
  doneSub: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontSize: 14
  },
  sectionTitle: {
    textAlign: 'right',
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm
  },
  exCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  exCardActive: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  exCardDone: {
    opacity: 0.6
  },
  exHeader: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  exLeft: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center'
  },
  exNumber: {
    fontWeight: '800',
    color: colors.text,
    fontSize: 15
  },
  exNumberDone: {
    color: colors.success
  },
  exInfo: {
    flex: 1,
    alignItems: 'flex-end'
  },
  exName: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
    textAlign: 'right'
  },
  exMuscle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  exNotes: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right'
  },
  exStats: {
    flexDirection: 'row-reverse',
    gap: 10
  },
  exStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.cardSoft,
    borderRadius: 10,
    paddingVertical: 8
  },
  exStatVal: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 14
  },
  exStatLabel: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2
  },
  setDoneBtn: {
    marginTop: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden'
  },
  setDoneBtnGradient: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  setDoneBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15
  }
});
