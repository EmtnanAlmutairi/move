import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { todaySchedule, weeklyWorkout } from '../data/mockData';
import { screenStyles } from '../theme/screenStyles';
import { colors, spacing } from '../theme/tokens';
import { ScheduledSession, WorkoutTask } from '../types';

const SESSION_LABELS: Record<ScheduledSession['type'], string> = {
  workout: 'تمرين',
  meal: 'تغذية',
  recovery: 'استشفاء',
  checkin: 'فحص',
  coaching: 'متابعة'
};

const SESSION_ICONS: Record<ScheduledSession['type'], string> = {
  workout: '🏋️',
  meal: '🥗',
  recovery: '🧘',
  checkin: '📝',
  coaching: '🎯'
};

const DAY_ORDER = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function intensityLabel(intensity: WorkoutTask['intensity']) {
  if (intensity === 'high') return 'شدة عالية';
  if (intensity === 'medium') return 'شدة متوسطة';
  return 'شدة خفيفة';
}

export function WeeklyPlanScreen({ navigation }: any) {
  const [completedIds, setCompletedIds] = useState<string[]>(
    todaySchedule.filter((session) => session.isCompleted).map((session) => session.id)
  );

  const completedCount = completedIds.length;
  const progressPct = Math.round((completedCount / todaySchedule.length) * 100);
  const upcomingSession = todaySchedule.find((session) => !completedIds.includes(session.id)) || todaySchedule[0];

  const weekPlan = useMemo(() => {
    const mapped = weeklyWorkout.map((task) => ({
      ...task,
      sortIndex: DAY_ORDER.indexOf(task.dayLabel)
    }));
    return mapped.sort((a, b) => a.sortIndex - b.sortIndex);
  }, []);

  const recommendedVideos = weeklyWorkout.filter((task) => !task.completed).slice(0, 3);

  function toggleSession(id: string) {
    setCompletedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  return (
    <SafeAreaView style={screenStyles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>الخطة</Text>
        <Text style={screenStyles.title}>جدول اليوم</Text>
        <Text style={screenStyles.subtitle}>كل شيء مرتب حسب جاهزيتك وتوقيت فريقك الصحي</Text>

        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroEyebrow}>جاهزية التنفيذ اليوم</Text>
          <Text style={styles.heroValue}>{progressPct}%</Text>
          <Text style={styles.heroText}>
            أنجزت {completedCount} من {todaySchedule.length} محطات، والمتبقي الآن: {upcomingSession.title}
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaCard}>
              <Text style={styles.heroMetaValue}>{upcomingSession.time}</Text>
              <Text style={styles.heroMetaLabel}>الموعد القادم</Text>
            </View>
            <View style={styles.heroMetaCard}>
              <Text style={styles.heroMetaValue}>{todaySchedule.length}</Text>
              <Text style={styles.heroMetaLabel}>محطات اليوم</Text>
            </View>
            <View style={styles.heroMetaCard}>
              <Text style={styles.heroMetaValue}>{recommendedVideos.length}</Text>
              <Text style={styles.heroMetaLabel}>فيديوهات مناسبة</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>اليوم بالتفصيل</Text>
          <Text style={styles.sectionHint}>اضغط لتحديث الإنجاز</Text>
        </View>

        {todaySchedule.map((session) => {
          const isDone = completedIds.includes(session.id);
          return (
            <Pressable
              key={session.id}
              style={[styles.scheduleCard, isDone && styles.scheduleCardDone]}
              onPress={() => toggleSession(session.id)}
            >
              <View style={styles.scheduleTimeCol}>
                <View style={[styles.statusDot, { backgroundColor: isDone ? colors.success : session.color }]} />
                <Text style={styles.scheduleTime}>{session.time}</Text>
                <Text style={styles.scheduleDuration}>{session.durationMin} د</Text>
              </View>
              <View style={styles.scheduleContent}>
                <View style={styles.scheduleTopRow}>
                  <Text style={styles.scheduleTag}>{SESSION_LABELS[session.type]}</Text>
                  <Text style={styles.scheduleIcon}>{SESSION_ICONS[session.type]}</Text>
                </View>
                <Text style={styles.scheduleTitle}>{session.title}</Text>
                <Text style={styles.scheduleSubtitle}>{session.subtitle}</Text>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>فيديوهات التمرين</Text>
          <Text style={styles.sectionHint}>مقترحة من خطتك الحالية</Text>
        </View>

        {recommendedVideos.map((task) => (
          <Pressable
            key={task.id}
            style={styles.videoCard}
            onPress={() => navigation.navigate('Workout', { workoutId: task.id })}
          >
            <Image source={{ uri: task.thumbnail }} style={styles.videoImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.82)']}
              style={styles.videoOverlay}
            >
              <View style={styles.playBadge}>
                <Text style={styles.playBadgeText}>▶</Text>
              </View>
              <Text style={styles.videoCoach}>{task.coachName}</Text>
              <Text style={styles.videoTitle}>{task.title}</Text>
              <Text style={styles.videoMeta}>
                {task.durationMin} دقيقة • {task.exercises?.length || 0} تمارين • {intensityLabel(task.intensity)}
              </Text>
            </LinearGradient>
          </Pressable>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>نظرة الأسبوع</Text>
          <Text style={styles.sectionHint}>توزيع الجلسات القادمة</Text>
        </View>

        <View style={styles.weekRow}>
          {weekPlan.map((task) => (
            <View key={task.id} style={[styles.weekCard, task.completed && styles.weekCardDone]}>
              <Text style={styles.weekDay}>{task.dayLabel}</Text>
              <Text style={styles.weekWorkout} numberOfLines={2}>
                {task.title}
              </Text>
              <Text style={styles.weekMeta}>{task.durationMin} د</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120
  },
  kicker: {
    textAlign: 'right',
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: '700'
  },
  heroCard: {
    borderRadius: 28,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.84)',
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700'
  },
  heroValue: {
    color: '#fff',
    textAlign: 'right',
    fontSize: 42,
    fontWeight: '900',
    marginTop: spacing.xs
  },
  heroText: {
    color: '#fff',
    textAlign: 'right',
    lineHeight: 21,
    marginTop: spacing.xs
  },
  heroMetaRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: spacing.md
  },
  heroMetaCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  heroMetaValue: {
    color: '#fff',
    textAlign: 'right',
    fontSize: 18,
    fontWeight: '800'
  },
  heroMetaLabel: {
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'right',
    fontSize: 11,
    marginTop: 3
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  sectionTitle: {
    textAlign: 'right',
    fontWeight: '800',
    fontSize: 20,
    color: colors.text
  },
  sectionHint: {
    color: colors.muted,
    fontSize: 12
  },
  scheduleCard: {
    flexDirection: 'row-reverse',
    alignItems: 'stretch',
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md
  },
  scheduleCardDone: {
    backgroundColor: '#F5FBF7',
    borderColor: '#BEE5CC'
  },
  scheduleTimeCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 62
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  scheduleTime: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15
  },
  scheduleDuration: {
    color: colors.muted,
    fontSize: 11
  },
  scheduleContent: {
    flex: 1,
    alignItems: 'flex-end'
  },
  scheduleTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  scheduleTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  scheduleIcon: {
    fontSize: 16
  },
  scheduleTitle: {
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '800',
    color: colors.text
  },
  scheduleSubtitle: {
    textAlign: 'right',
    color: colors.muted,
    lineHeight: 19,
    marginTop: 4
  },
  videoCard: {
    height: 212,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.card
  },
  videoImage: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  videoOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg
  },
  playBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playBadgeText: {
    color: colors.primary,
    fontWeight: '800'
  },
  videoCoach: {
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'right',
    fontSize: 12
  },
  videoTitle: {
    color: '#fff',
    textAlign: 'right',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4
  },
  videoMeta: {
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'right',
    marginTop: 4,
    lineHeight: 19
  },
  weekRow: {
    gap: spacing.sm
  },
  weekCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md
  },
  weekCardDone: {
    backgroundColor: colors.cardSoft
  },
  weekDay: {
    textAlign: 'right',
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4
  },
  weekWorkout: {
    textAlign: 'right',
    color: colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  weekMeta: {
    textAlign: 'right',
    color: colors.muted,
    marginTop: 6
  }
});
