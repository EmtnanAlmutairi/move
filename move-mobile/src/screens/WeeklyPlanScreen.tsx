import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseDemoModal } from '../components/ExerciseDemoModal';
import { todaySchedule, weeklyWorkout } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { Exercise, ScheduledSession, WorkoutTask } from '../types';

const SESSION_LABELS: Record<ScheduledSession['type'], string> = {
  workout:  'تمرين',
  meal:     'تغذية',
  recovery: 'استشفاء',
  checkin:  'فحص',
  coaching: 'متابعة',
};

function SessionIcon({ type, color }: { type: ScheduledSession['type']; color: string }) {
  const s = 16;
  switch (type) {
    case 'workout':  return <MaterialCommunityIcons name="dumbbell" size={s} color={color} />;
    case 'meal':     return <Ionicons name="restaurant-outline" size={s} color={color} />;
    case 'recovery': return <Ionicons name="leaf-outline" size={s} color={color} />;
    case 'checkin':  return <Ionicons name="document-text-outline" size={s} color={color} />;
    case 'coaching': return <MaterialCommunityIcons name="bullseye-arrow" size={s} color={color} />;
    default:         return null;
  }
}

const DAY_ORDER = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function intensityLabel(intensity: WorkoutTask['intensity']) {
  if (intensity === 'high')   return 'شدة عالية';
  if (intensity === 'medium') return 'شدة متوسطة';
  return 'شدة خفيفة';
}

export function WeeklyPlanScreen({ navigation }: any) {
  const { theme: t } = useTheme();

  const [completedIds, setCompletedIds] = useState<string[]>(
    todaySchedule.filter((s) => s.isCompleted).map((s) => s.id)
  );
  const [demoExercise, setDemoExercise] = useState<Exercise | null>(null);

  const completedCount  = completedIds.length;
  const progressPct     = Math.round((completedCount / todaySchedule.length) * 100);
  const upcomingSession = todaySchedule.find((s) => !completedIds.includes(s.id)) ?? todaySchedule[0];

  const weekPlan = useMemo(
    () => weeklyWorkout
      .map((task) => ({ ...task, sortIndex: DAY_ORDER.indexOf(task.dayLabel) }))
      .sort((a, b) => a.sortIndex - b.sortIndex),
    []
  );

  const recommendedVideos = weeklyWorkout.filter((t) => !t.completed).slice(0, 3);

  const todayWorkoutSession = todaySchedule.find((s) => s.type === 'workout' && s.workoutId);
  const todayExercises: Exercise[] = todayWorkoutSession
    ? (weeklyWorkout.find((w) => w.id === todayWorkoutSession.workoutId)?.exercises ?? [])
    : [];

  const toggleSession = (id: string) =>
    setCompletedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#8A7060',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.3 : 0.07,
    shadowRadius: 10,
    elevation: 3,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TITLE ────────────────────────────────── */}
        <Text style={[st.pageTitle, { color: t.text }]}>جدول اليوم</Text>

        {/* ── HERO GRADIENT ─────────────────────────── */}
        <LinearGradient
          colors={[t.gradientStart, '#FF6800', t.gradientEnd]}
          style={st.hero}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={st.heroEyebrow}>اكتمال الأسبوع</Text>
          <Text style={st.heroValue}>{progressPct}%</Text>
          <Text style={st.heroText}>
            {completedCount} من {todaySchedule.length} محطات · القادم: {upcomingSession.title}
          </Text>
        </LinearGradient>

        {/* ── TODAY'S SCHEDULE ──────────────────────── */}
        <View style={st.sectionHeader}>
          <Text style={[st.sectionTitle, { color: t.text }]}>اليوم بالتفصيل</Text>
          <Text style={[st.sectionHint, { color: t.muted }]}>اضغط لتحديث الإنجاز</Text>
        </View>

        {todaySchedule.map((session) => {
          const isDone = completedIds.includes(session.id);
          return (
            <Pressable
              key={session.id}
              style={[
                st.scheduleCard,
                {
                  backgroundColor: isDone ? t.success + '0D' : t.card,
                  borderColor:     isDone ? t.success + '40' : t.line,
                },
                cardShadow,
              ]}
              onPress={() => toggleSession(session.id)}
            >
              <View style={st.scheduleTimeCol}>
                <View style={[st.statusDot, { backgroundColor: isDone ? t.success : t.primary }]} />
                <Text style={[st.scheduleTime, { color: t.text }]}>{session.time}</Text>
                <Text style={[st.scheduleDur, { color: t.muted }]}>{session.durationMin} د</Text>
              </View>
              <View style={st.scheduleContent}>
                <View style={st.scheduleTopRow}>
                  <Text style={[st.scheduleTag, { color: t.primary }]}>{SESSION_LABELS[session.type]}</Text>
                  <SessionIcon type={session.type} color={isDone ? t.muted : t.primary} />
                </View>
                <Text style={[st.scheduleTitle, { color: t.text }]}>{session.title}</Text>
                <Text style={[st.scheduleSub, { color: t.muted }]}>{session.subtitle}</Text>
              </View>
            </Pressable>
          );
        })}

        {/* ── TODAY'S EXERCISES ────────────────────── */}
        {todayExercises.length > 0 && (
          <>
            <View style={st.sectionHeader}>
              <Text style={[st.sectionTitle, { color: t.text }]}>تمارين اليوم</Text>
              <Text style={[st.sectionHint, { color: t.muted }]}>اضغط على الصورة للشرح</Text>
            </View>

            {todayExercises.map((ex, i) => (
              <View
                key={ex.id}
                style={[st.exCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}
              >
                {/* Thumbnail with demo tap */}
                <Pressable onPress={() => setDemoExercise(ex)} style={st.exImgWrap}>
                  <Image source={{ uri: ex.thumbnail }} style={st.exImg} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.75)']}
                    style={st.exImgGrad}
                  >
                    <View style={st.demoTag}>
                      <Ionicons name="play-circle" size={14} color="#fff" />
                      <Text style={st.demoTagTxt}>شرح التمرين</Text>
                    </View>
                  </LinearGradient>
                </Pressable>

                {/* Info */}
                <View style={st.exInfo}>
                  <View style={st.exTopRow}>
                    <View style={[st.exNumBadge, { backgroundColor: t.primary + '18' }]}>
                      <Text style={[st.exNum, { color: t.primary }]}>{i + 1}</Text>
                    </View>
                    <View style={[st.musclePill, { backgroundColor: t.cardSoft }]}>
                      <Text style={[st.muscleTxt, { color: t.muted }]}>{ex.muscleGroup}</Text>
                    </View>
                  </View>
                  <Text style={[st.exName, { color: t.text }]}>{ex.name}</Text>
                  <View style={st.exChips}>
                    {[
                      { icon: 'layers-outline', val: `${ex.sets} مج` },
                      { icon: 'repeat-outline',  val: ex.reps         },
                      { icon: 'timer-outline',   val: `${ex.restSec}ث`},
                    ].map((c) => (
                      <View key={c.val} style={[st.chip, { backgroundColor: t.cardSoft }]}>
                        <Ionicons name={c.icon as any} size={11} color={t.muted} />
                        <Text style={[st.chipTxt, { color: t.muted }]}>{c.val}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── VIDEO RECOMMENDATIONS ─────────────────── */}
        <View style={st.sectionHeader}>
          <Text style={[st.sectionTitle, { color: t.text }]}>فيديوهات التمرين</Text>
          <Text style={[st.sectionHint, { color: t.muted }]}>مقترحة من خطتك الحالية</Text>
        </View>

        {recommendedVideos.map((task) => (
          <Pressable
            key={task.id}
            style={st.videoCard}
            onPress={() => navigation.navigate('Workout', { workoutId: task.id })}
          >
            <Image source={{ uri: task.thumbnail }} style={st.videoImg} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={st.videoOverlay}>
              <View style={[st.playBadge, { backgroundColor: 'rgba(255,255,255,0.88)' }]}>
                <Ionicons name="play" size={14} color={t.primary} />
              </View>
              <Text style={st.videoCoach}>{task.coachName}</Text>
              <Text style={st.videoTitle}>{task.title}</Text>
              <Text style={st.videoMeta}>
                {task.durationMin} دقيقة · {task.exercises?.length ?? 0} تمارين · {intensityLabel(task.intensity)}
              </Text>
            </LinearGradient>
          </Pressable>
        ))}

        {/* ── WEEKLY OVERVIEW ───────────────────────── */}
        <View style={st.sectionHeader}>
          <Text style={[st.sectionTitle, { color: t.text }]}>نظرة الأسبوع</Text>
          <Text style={[st.sectionHint, { color: t.muted }]}>توزيع الجلسات القادمة</Text>
        </View>

        <View style={st.weekRow}>
          {weekPlan.map((task) => (
            <View
              key={task.id}
              style={[
                st.weekCard,
                {
                  backgroundColor: task.completed ? t.cardSoft : t.card,
                  borderColor:     t.line,
                },
                cardShadow,
              ]}
            >
              <Text style={[st.weekDay, { color: t.primary }]}>{task.dayLabel}</Text>
              <Text style={[st.weekWorkout, { color: t.text }]} numberOfLines={2}>{task.title}</Text>
              <Text style={[st.weekMeta, { color: t.muted }]}>{task.durationMin} د</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      <ExerciseDemoModal
        exercise={demoExercise}
        onClose={() => setDemoExercise(null)}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },

  pageTitle: { textAlign: 'right', fontSize: 32, fontWeight: '900', lineHeight: 36, marginBottom: spacing.md },

  hero:       { borderRadius: 24, padding: spacing.lg, marginBottom: spacing.lg },
  heroEyebrow:{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', textAlign: 'right', marginBottom: 4 },
  heroValue:  { color: '#fff', textAlign: 'right', fontSize: 42, fontWeight: '900', marginTop: spacing.xs },
  heroText:   { color: 'rgba(255,255,255,0.88)', textAlign: 'right', lineHeight: 21, marginTop: spacing.xs },

  sectionHeader:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle:   { fontWeight: '800', fontSize: 20, textAlign: 'right' },
  sectionHint:    { fontSize: 12 },

  scheduleCard:    { flexDirection: 'row-reverse', alignItems: 'stretch', borderRadius: 20, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  scheduleTimeCol: { alignItems: 'center', justifyContent: 'space-between', minWidth: 62 },
  statusDot:       { width: 14, height: 14, borderRadius: 7 },
  scheduleTime:    { fontWeight: '800', fontSize: 15 },
  scheduleDur:     { fontSize: 11 },
  scheduleContent: { flex: 1, alignItems: 'flex-end' },
  scheduleTopRow:  { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 4 },
  scheduleTag:     { fontSize: 12, fontWeight: '700' },
  scheduleTitle:   { textAlign: 'right', fontSize: 17, fontWeight: '800' },
  scheduleSub:     { textAlign: 'right', lineHeight: 19, marginTop: 4 },

  videoCard:    { height: 212, borderRadius: 24, overflow: 'hidden', marginBottom: spacing.md },
  videoImg:     { width: '100%', height: '100%', position: 'absolute' },
  videoOverlay: { flex: 1, justifyContent: 'flex-end', padding: spacing.lg },
  playBadge:    { position: 'absolute', top: spacing.md, left: spacing.md, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  videoCoach:   { color: 'rgba(255,255,255,0.82)', textAlign: 'right', fontSize: 12 },
  videoTitle:   { color: '#fff', textAlign: 'right', fontSize: 20, fontWeight: '800', marginTop: 4 },
  videoMeta:    { color: 'rgba(255,255,255,0.88)', textAlign: 'right', marginTop: 4, lineHeight: 19 },

  weekRow:    { gap: spacing.sm },
  weekCard:   { borderRadius: 18, borderWidth: 1, padding: spacing.md },
  weekDay:    { textAlign: 'right', fontWeight: '700', marginBottom: 4 },
  weekWorkout:{ textAlign: 'right', fontSize: 16, fontWeight: '800' },
  weekMeta:   { textAlign: 'right', marginTop: 6 },

  // Exercise cards
  exCard:      { flexDirection: 'row-reverse', borderRadius: 18, borderWidth: 1, marginBottom: spacing.sm, overflow: 'hidden' },
  exImgWrap:   { width: 110, height: 100, flexShrink: 0 },
  exImg:       { width: '100%', height: '100%' },
  exImgGrad:   { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, justifyContent: 'flex-end', padding: 6 },
  demoTag:     { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start' },
  demoTagTxt:  { color: '#fff', fontSize: 10, fontWeight: '700' },
  exInfo:      { flex: 1, padding: spacing.sm, alignItems: 'flex-end', justifyContent: 'space-between' },
  exTopRow:    { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, width: '100%' },
  exNumBadge:  { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exNum:       { fontSize: 12, fontWeight: '900' },
  musclePill:  { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  muscleTxt:   { fontSize: 11, fontWeight: '700' },
  exName:      { textAlign: 'right', fontSize: 14, fontWeight: '800', marginVertical: 4 },
  exChips:     { flexDirection: 'row-reverse', gap: 5 },
  chip:        { flexDirection: 'row-reverse', alignItems: 'center', gap: 3, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  chipTxt:     { fontSize: 10, fontWeight: '700' },
});
