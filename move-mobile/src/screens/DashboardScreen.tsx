import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientHeaderCard } from '../components/GradientHeaderCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatPill } from '../components/StatPill';
import { chats, healthSnapshot, runHistory, todaySchedule, weeklyProgress, weeklyWorkout } from '../data/mockData';
import { useAdminConfig } from '../hooks/useAdminConfig';
import { screenStyles } from '../theme/screenStyles';
import { colors, spacing } from '../theme/tokens';

function StepsBars() {
  const maxSteps = Math.max(...weeklyProgress.map((day) => day.stepsGoal), ...weeklyProgress.map((day) => day.steps));

  return (
    <View style={barStyles.row}>
      {weeklyProgress.map((day) => {
        const pct = Math.max((day.steps / maxSteps) * 100, 8);
        const isGoalMet = day.steps >= day.stepsGoal;

        return (
          <View key={day.dayShort} style={barStyles.col}>
            <View style={barStyles.track}>
              <View
                style={[
                  barStyles.bar,
                  { height: `${pct}%` as any },
                  isGoalMet ? barStyles.barGoal : barStyles.barNormal
                ]}
              />
            </View>
            <Text style={barStyles.label}>{day.dayShort}</Text>
          </View>
        );
      })}
    </View>
  );
}

function SectionHeader({ title, actionLabel, onPress }: { title: string; actionLabel?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      {actionLabel ? (
        <Pressable onPress={onPress}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : (
        <View />
      )}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    height: 76,
    gap: 8
  },
  col: {
    flex: 1,
    alignItems: 'center'
  },
  track: {
    width: '100%',
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#F3ECE4',
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  bar: {
    width: '100%',
    borderRadius: 999
  },
  barNormal: {
    backgroundColor: '#D9EAFE'
  },
  barGoal: {
    backgroundColor: colors.primary
  },
  label: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 11
  }
});

export function DashboardScreen({ navigation }: any) {
  const config = useAdminConfig();
  const todayWorkout = weeklyWorkout.find((item) => !item.completed) || weeklyWorkout[0];
  const completedSessions = weeklyWorkout.filter((item) => item.completed).length;
  const lastRun = runHistory[0];
  const todaySteps = weeklyProgress[0];
  const nextSession = todaySchedule.find((item) => !item.isCompleted) || todaySchedule[0];
  const unreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  const stepsGoalPct = Math.min((todaySteps.steps / todaySteps.stepsGoal) * 100, 100);
  const stepsLeft = Math.max(todaySteps.stepsGoal - todaySteps.steps, 0);
  const readinessTone =
    healthSnapshot.readinessPercent >= 80
      ? 'جاهزية عالية'
      : healthSnapshot.readinessPercent >= 65
      ? 'جاهزية متوسطة'
      : 'جاهزية منخفضة';

  const quickActions = [
    { key: 'workout', title: 'التمرين', subtitle: `${todayWorkout.durationMin} دقيقة`, onPress: () => navigation.navigate('Workout', { workoutId: todayWorkout.id }) },
    { key: 'plan', title: 'الخطة', subtitle: 'جدول الأسبوع', onPress: () => navigation.navigate('MainTabs', { screen: 'Plan' }) },
    { key: 'chat', title: 'الدردشة', subtitle: unreadCount ? `${unreadCount} غير مقروءة` : 'بدون رسائل جديدة', onPress: () => navigation.navigate('Chat') },
    { key: 'recovery', title: 'الاستشفاء', subtitle: 'تحديث سريع', onPress: () => navigation.navigate('Recovery') }
  ];

  const alerts = [
    'أخصائي العلاج: تجنب الضغط العمودي للكتف لمدة 14 يوم',
    'المدرب: تم تحويل تمرين الصدر إلى بديل آمن اليوم'
  ];

  return (
    <SafeAreaView style={screenStyles.safe}>
      <ScrollView contentContainerStyle={screenStyles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable style={styles.chatShortcut} onPress={() => navigation.navigate('Chat')}>
            {unreadCount > 0 ? <Text style={styles.chatShortcutBadge}>{unreadCount}</Text> : null}
            <Text style={styles.chatShortcutText}>الدردشة</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('ar-SA')}</Text>
            <Text style={styles.greeting}>صباح الخير، امتنان</Text>
          </View>
        </View>

        <GradientHeaderCard
          title={`جاهزية اليوم ${healthSnapshot.readinessPercent}%`}
          subtitle="ملخص سريع لليوم بدون تفاصيل زائدة"
        >
          <View style={styles.readinessRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{readinessTone}</Text>
            </View>
            <View style={styles.heroBadgeMuted}>
              <Text style={styles.heroBadgeMutedText}>{config.workoutPlanVersion}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <StatPill title="نوم" value={`${healthSnapshot.sleepHours} س`} />
            <StatPill title="خطوات" value={healthSnapshot.steps.toLocaleString()} />
            <StatPill title="نبض" value={`${healthSnapshot.heartRate}`} />
          </View>
          <Text style={styles.reasonNote}>الحمل اليوم منخفض نسبيًا للحفاظ على الجودة والاستشفاء.</Text>
        </GradientHeaderCard>

        <View style={styles.overviewRow}>
          <Pressable style={[screenStyles.card, styles.overviewCard, styles.overviewAccent]} onPress={() => navigation.navigate('Workout', { workoutId: todayWorkout.id })}>
            <Text style={styles.cardEyebrow}>تمرين اليوم</Text>
            <Text style={styles.overviewValue}>{todayWorkout.title}</Text>
            <Text style={styles.overviewMeta}>
              {todayWorkout.durationMin} دقيقة • {todayWorkout.exercises?.length || 0} تمارين
            </Text>
          </Pressable>
          <View style={[screenStyles.card, styles.overviewCard]}>
            <Text style={styles.cardEyebrow}>خطوات اليوم</Text>
            <Text style={styles.metricNumber}>{todaySteps.steps.toLocaleString()}</Text>
            <Text style={styles.overviewMeta}>
              {stepsLeft > 0 ? `المتبقي ${stepsLeft.toLocaleString()} خطوة` : 'تم الوصول للهدف'}
            </Text>
          </View>
        </View>

        <SectionHeader title="اختصارات مهمة" />
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <Pressable key={action.key} style={styles.quickAction} onPress={action.onPress}>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionSub}>{action.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        <SectionHeader title="اليوم باختصار" actionLabel="عرض الجدول" onPress={() => navigation.navigate('MainTabs', { screen: 'Plan' })} />
        <View style={screenStyles.card}>
          <View style={styles.nextHeader}>
            <View style={[styles.nextDot, { backgroundColor: nextSession.color }]} />
            <Text style={styles.nextHeaderLabel}>المحطة القادمة</Text>
          </View>
          <Text style={styles.nextTitle}>{nextSession.title}</Text>
          <Text style={styles.nextMeta}>
            {nextSession.time} • {nextSession.durationMin} دقيقة
          </Text>
          <Text style={styles.nextSubtitle}>{nextSession.subtitle}</Text>

          <View style={styles.inlineMetrics}>
            <View style={styles.inlineMetric}>
              <Text style={styles.inlineMetricValue}>{completedSessions}/{weeklyWorkout.length}</Text>
              <Text style={styles.inlineMetricLabel}>جلسات مكتملة</Text>
            </View>
            <View style={styles.inlineMetric}>
              <Text style={styles.inlineMetricValue}>{stepsGoalPct.toFixed(0)}%</Text>
              <Text style={styles.inlineMetricLabel}>هدف الخطوات</Text>
            </View>
            <View style={styles.inlineMetric}>
              <Text style={styles.inlineMetricValue}>6 أيام</Text>
              <Text style={styles.inlineMetricLabel}>Streak</Text>
            </View>
          </View>

          <View style={styles.nextActions}>
            <Pressable
              style={styles.nextSecondaryBtn}
              onPress={() =>
                nextSession.type === 'workout'
                  ? navigation.navigate('Workout', { workoutId: nextSession.workoutId || todayWorkout.id })
                  : navigation.navigate('MainTabs', { screen: 'Plan' })
              }
            >
              <Text style={styles.nextSecondaryBtnText}>ابدأ الآن</Text>
            </Pressable>
            <Pressable style={styles.nextGhostBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Plan' })}>
              <Text style={styles.nextGhostBtnText}>كل اليوم</Text>
            </Pressable>
          </View>
        </View>

        <SectionHeader title="التقدم" />
        <View style={screenStyles.card}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTextWrap}>
              <Text style={styles.progressValue}>{todaySteps.steps.toLocaleString()}</Text>
              <Text style={styles.progressGoal}>من {todaySteps.stepsGoal.toLocaleString()} خطوة</Text>
            </View>
            <Text style={styles.cardEyebrow}>هذا الأسبوع</Text>
          </View>
          <View style={styles.stepsTrack}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={[styles.stepsFill, { width: `${stepsGoalPct}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.stepsRemain}>
            {stepsLeft > 0 ? `تبقى ${stepsLeft.toLocaleString()} خطوة للوصول للهدف` : 'أكملت هدف الخطوات اليوم'}
          </Text>
          <StepsBars />
        </View>

        <SectionHeader title="رسائل وتنبيهات" actionLabel="الدردشة" onPress={() => navigation.navigate('Chat')} />
        <View style={styles.messageStack}>
          <Pressable style={styles.messagesCard} onPress={() => navigation.navigate('Chat')}>
            <View style={styles.messagesHeader}>
              <Text style={styles.messagesCount}>{unreadCount}</Text>
              <Text style={styles.messagesTitle}>آخر الرسائل</Text>
            </View>
            {chats.slice(0, 2).map((chat) => (
              <View key={chat.id} style={styles.messagePreviewRow}>
                <Text style={styles.messagePreviewTime}>{chat.timeLabel}</Text>
                <View style={styles.messagePreviewBody}>
                  <Text style={styles.messagePreviewName}>{chat.name}</Text>
                  <Text style={styles.messagePreviewText} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                </View>
              </View>
            ))}
          </Pressable>

          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>تنبيهات الفريق</Text>
            {alerts.map((alert) => (
              <View key={alert} style={styles.alertRow}>
                <View style={styles.alertDot} />
                <Text style={styles.alertText}>{alert}</Text>
              </View>
            ))}
          </View>
        </View>

        {lastRun ? (
          <>
            <SectionHeader title="آخر جري" actionLabel="فتح" onPress={() => navigation.navigate('Run')} />
            <Pressable style={styles.runCard} onPress={() => navigation.navigate('Run')}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900' }}
                style={styles.runImage}
              />
              <View style={styles.runContent}>
                <View style={styles.runTopRow}>
                  <View style={styles.runBadge}>
                    <Text style={styles.runBadgeText}>{lastRun.dateLabel}</Text>
                  </View>
                  <Text style={styles.runDist}>{lastRun.distanceKm} كم</Text>
                </View>
                <View style={styles.runStats}>
                  <View style={styles.runStat}>
                    <Text style={styles.runStatVal}>
                      {Math.floor(lastRun.durationSec / 60)}:{String(lastRun.durationSec % 60).padStart(2, '0')}
                    </Text>
                    <Text style={styles.runStatLabel}>الوقت</Text>
                  </View>
                  <View style={styles.runStat}>
                    <Text style={styles.runStatVal}>{lastRun.calories}</Text>
                    <Text style={styles.runStatLabel}>سعرة</Text>
                  </View>
                  <View style={styles.runStat}>
                    <Text style={styles.runStatVal}>{lastRun.avgHeartRate}</Text>
                    <Text style={styles.runStatLabel}>نبض</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </>
        ) : null}

        <View style={styles.bottomCta}>
          <Text style={styles.bottomCtaTitle}>جاهز تبدأ تمرين اليوم؟</Text>
          <Text style={styles.bottomCtaSub}>واجهة أخف، وتركيز أعلى على الشيء المهم الآن.</Text>
          <PrimaryButton label="فتح التمرين" onPress={() => navigation.navigate('Workout', { workoutId: todayWorkout.id })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  headerCopy: {
    alignItems: 'flex-end',
    gap: 4
  },
  greeting: {
    textAlign: 'right',
    color: colors.text,
    fontWeight: '800',
    fontSize: 26
  },
  dateText: {
    textAlign: 'right',
    color: colors.muted,
    fontSize: 12
  },
  chatShortcut: {
    minWidth: 92,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: 12
  },
  chatShortcutBadge: {
    backgroundColor: colors.primary,
    color: '#fff',
    minWidth: 22,
    textAlign: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    fontWeight: '800',
    fontSize: 12
  },
  chatShortcutText: {
    color: colors.text,
    fontWeight: '700'
  },
  readinessRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8
  },
  heroBadgeText: {
    color: '#fff',
    fontWeight: '800'
  },
  heroBadgeMuted: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  heroBadgeMutedText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: 8
  },
  reasonNote: {
    marginTop: spacing.sm,
    color: '#fff',
    textAlign: 'right',
    fontSize: 13,
    opacity: 0.92
  },
  overviewRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: spacing.md
  },
  overviewCard: {
    flex: 1,
    minHeight: 122,
    marginBottom: 0,
    justifyContent: 'space-between'
  },
  overviewAccent: {
    backgroundColor: colors.cardSoft
  },
  cardEyebrow: {
    textAlign: 'right',
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700'
  },
  overviewValue: {
    textAlign: 'right',
    color: colors.text,
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 28
  },
  overviewMeta: {
    textAlign: 'right',
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  metricNumber: {
    textAlign: 'right',
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900'
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  sectionTitle: {
    textAlign: 'right',
    fontSize: 20,
    fontWeight: '800',
    color: colors.text
  },
  sectionAction: {
    color: colors.primary,
    fontWeight: '700'
  },
  quickActionsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.md
  },
  quickAction: {
    width: '48%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: spacing.md,
    minHeight: 94,
    justifyContent: 'space-between'
  },
  quickActionTitle: {
    textAlign: 'right',
    color: colors.text,
    fontWeight: '800',
    fontSize: 16
  },
  quickActionSub: {
    textAlign: 'right',
    color: colors.muted,
    marginTop: 6,
    fontSize: 12
  },
  nextHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  nextDot: {
    width: 10,
    height: 10,
    borderRadius: 999
  },
  nextHeaderLabel: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12
  },
  nextTitle: {
    textAlign: 'right',
    color: colors.text,
    fontSize: 22,
    fontWeight: '800'
  },
  nextMeta: {
    textAlign: 'right',
    color: colors.muted,
    marginTop: 4
  },
  nextSubtitle: {
    textAlign: 'right',
    color: colors.text,
    marginTop: 10,
    lineHeight: 22
  },
  inlineMetrics: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: spacing.md
  },
  inlineMetric: {
    flex: 1,
    backgroundColor: '#FAF7F3',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  inlineMetricValue: {
    textAlign: 'right',
    color: colors.text,
    fontWeight: '800',
    fontSize: 18
  },
  inlineMetricLabel: {
    textAlign: 'right',
    color: colors.muted,
    fontSize: 11,
    marginTop: 4
  },
  nextActions: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: spacing.md
  },
  nextSecondaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center'
  },
  nextSecondaryBtnText: {
    color: '#fff',
    fontWeight: '800'
  },
  nextGhostBtn: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center'
  },
  nextGhostBtnText: {
    color: colors.primary,
    fontWeight: '800'
  },
  progressHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm
  },
  progressTextWrap: {
    alignItems: 'flex-end'
  },
  progressValue: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '900'
  },
  progressGoal: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4
  },
  stepsTrack: {
    height: 10,
    backgroundColor: colors.line,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: spacing.xs
  },
  stepsFill: {
    height: '100%',
    borderRadius: 999
  },
  stepsRemain: {
    textAlign: 'right',
    color: colors.muted,
    fontSize: 13,
    marginBottom: spacing.md
  },
  messageStack: {
    gap: 10,
    marginBottom: spacing.sm
  },
  messagesCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md
  },
  messagesHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm
  },
  messagesCount: {
    minWidth: 28,
    backgroundColor: colors.primary,
    color: '#fff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '800',
    textAlign: 'center'
  },
  messagesTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 17
  },
  messagePreviewRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  messagePreviewTime: {
    color: colors.muted,
    fontSize: 11
  },
  messagePreviewBody: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: spacing.sm
  },
  messagePreviewName: {
    color: colors.text,
    fontWeight: '700'
  },
  messagePreviewText: {
    color: colors.muted,
    marginTop: 2,
    textAlign: 'right'
  },
  alertCard: {
    backgroundColor: '#FFF8F1',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F7DFC6',
    padding: spacing.md
  },
  alertTitle: {
    textAlign: 'right',
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.sm
  },
  alertRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.warning,
    marginTop: 7
  },
  alertText: {
    flex: 1,
    textAlign: 'right',
    color: colors.text,
    lineHeight: 21,
    marginBottom: spacing.sm
  },
  runCard: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md
  },
  runImage: {
    width: '100%',
    height: 136
  },
  runContent: {
    padding: spacing.md
  },
  runTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  runBadge: {
    backgroundColor: colors.cardSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  runBadgeText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12
  },
  runDist: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900'
  },
  runStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 10
  },
  runStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAF7F3',
    borderRadius: 16,
    paddingVertical: 12
  },
  runStatVal: {
    fontWeight: '800',
    color: colors.text,
    fontSize: 16
  },
  runStatLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },
  bottomCta: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg
  },
  bottomCtaTitle: {
    textAlign: 'right',
    color: colors.text,
    fontWeight: '800',
    fontSize: 22
  },
  bottomCtaSub: {
    textAlign: 'right',
    color: colors.muted,
    marginTop: spacing.xs,
    lineHeight: 21
  }
});
