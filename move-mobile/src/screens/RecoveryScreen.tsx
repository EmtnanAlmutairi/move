import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { injuries, professionals, userProfile } from '../data/mockData';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const SEVERITY_COLORS: Record<number, { bg: string; border: string; label: string }> = {
  1: { bg: '#FFF8E7', border: '#F79A3E', label: 'مراقبة' },
  2: { bg: '#FFF0EE', border: '#FF7A5C', label: 'متوسط' },
  3: { bg: '#FFECEC', border: '#E74424', label: 'شديد' }
};

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  monitoring: { text: 'تحت المراقبة', color: '#F79A3E' },
  recovering: { text: 'في التعافي', color: '#1A9ECC' },
  healed: { text: 'تعافى', color: '#30B36A' }
};

const BODY_AREAS = ['الكتف', 'الظهر', 'الركبة', 'الكاحل', 'الرقبة', 'الورك', 'الكوع', 'الرسغ'];

const RECOVERY_ROUTINES = [
  { id: 'r1', title: 'تمارين تمديد أسفل الظهر', durationMin: 15, category: 'علاج', icon: '🧘', description: 'روتين إطالة لتخفيف ضغط الفقرات القطنية', doneToday: true },
  { id: 'r2', title: 'إحماء المفاصل الصباحي', durationMin: 10, category: 'وقاية', icon: '🌅', description: 'تحريك دائري للمفاصل الرئيسية لتحسين التروية', doneToday: false },
  { id: 'r3', title: 'تمارين الكور التأهيلية', durationMin: 20, category: 'تقوية', icon: '💪', description: 'تقوية عضلات الكور لدعم العمود الفقري', doneToday: false },
  { id: 'r4', title: 'تنفس عميق وإسترخاء', durationMin: 8, category: 'استشفاء', icon: '🫁', description: 'تقنيات تنفس لخفض الكورتيزول وتسريع الاستشفاء', doneToday: true }
];

const PAIN_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function RecoveryScreen({ navigation }: any) {
  const [completedRoutines, setCompletedRoutines] = useState<Set<string>>(
    new Set(RECOVERY_ROUTINES.filter((r) => r.doneToday).map((r) => r.id))
  );
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [painLevel, setPainLevel] = useState(0);
  const [reportSent, setReportSent] = useState(false);

  const physio = professionals.find((p) => p.id === userProfile.selectedPhysioId);

  const toggleRoutine = (id: string) => {
    setCompletedRoutines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendReport = () => {
    if (!selectedArea) {
      Alert.alert('تنبيه', 'يرجى تحديد منطقة الألم أولاً');
      return;
    }
    setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
    Alert.alert('تم الإرسال ✓', `تم إرسال بلاغ الألم في ${selectedArea} (درجة ${painLevel}) إلى ${physio?.name ?? 'الفريق الطبي'}`);
  };

  const routinesDone = Array.from(completedRoutines).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation?.goBack?.()}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>الصحة</Text>
            <Text style={styles.title}>الاستشفاء</Text>
          </View>
        </View>

        {/* Progress hero */}
        <LinearGradient colors={['#7C5CBF', '#B39DDB']} style={styles.heroCard} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{routinesDone}/{RECOVERY_ROUTINES.length}</Text>
              <Text style={styles.heroStatLbl}>روتين منجز</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{injuries.length}</Text>
              <Text style={styles.heroStatLbl}>إصابة نشطة</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>87%</Text>
              <Text style={styles.heroStatLbl}>تعافي</Text>
            </View>
          </View>
          <View style={styles.heroProgress}>
            <View style={styles.heroProgressTrack}>
              <View style={[styles.heroProgressFill, { width: `${(routinesDone / RECOVERY_ROUTINES.length) * 100}%` }]} />
            </View>
            <Text style={styles.heroProgressLbl}>تقدم اليوم</Text>
          </View>
        </LinearGradient>

        {/* Physio card */}
        {physio && (
          <View style={styles.physioCard}>
            <View style={[styles.physioAvatar, { backgroundColor: physio.avatarColor + '22' }]}>
              <Text style={[styles.physioAvatarTxt, { color: physio.avatarColor }]}>{physio.avatarInitials}</Text>
            </View>
            <View style={styles.physioBody}>
              <Text style={styles.physioName}>{physio.name}</Text>
              <Text style={styles.physioSpec}>{physio.specialization}</Text>
              <Text style={styles.physioMsg}>روتين اليوم معدّل لأسفل الظهر — تجنب الضغط المحوري</Text>
            </View>
            <View style={[styles.physioAccent, { backgroundColor: physio.avatarColor }]} />
          </View>
        )}

        {/* Active injuries */}
        {injuries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>الإصابات النشطة</Text>
            {injuries.map((injury) => {
              const sev = SEVERITY_COLORS[injury.severity] ?? SEVERITY_COLORS[1];
              const st = STATUS_LABELS[injury.status] ?? STATUS_LABELS.monitoring;
              return (
                <View key={injury.id} style={[styles.injuryCard, { backgroundColor: sev.bg, borderColor: sev.border }]}>
                  <View style={styles.injuryTopRow}>
                    <View style={[styles.severityBadge, { backgroundColor: sev.border }]}>
                      <Text style={styles.severityText}>درجة {injury.severity}</Text>
                    </View>
                    <Text style={styles.injuryArea}>{injury.area}</Text>
                  </View>
                  <Text style={styles.injuryNote}>{injury.note}</Text>
                  <View style={styles.injuryStatusRow}>
                    <View style={[styles.statusDot, { backgroundColor: st.color }]} />
                    <Text style={[styles.statusText, { color: st.color }]}>{st.text}</Text>
                  </View>
                  {/* Severity bar */}
                  <View style={styles.sevBarTrack}>
                    <View style={[styles.sevBarFill, { width: `${(injury.severity / 3) * 100}%`, backgroundColor: sev.border }]} />
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Recovery routines */}
        <Text style={styles.sectionTitle}>روتين الاستشفاء اليوم</Text>
        {RECOVERY_ROUTINES.map((routine) => {
          const done = completedRoutines.has(routine.id);
          return (
            <Pressable key={routine.id} onPress={() => toggleRoutine(routine.id)}>
              <View style={[styles.routineCard, done && styles.routineCardDone]}>
                <View style={[styles.routineCheck, done && styles.routineCheckDone]}>
                  {done ? <Text style={styles.routineCheckIcon}>✓</Text> : <Text style={styles.routineIcon}>{routine.icon}</Text>}
                </View>
                <View style={styles.routineBody}>
                  <View style={styles.routineTopRow}>
                    <View style={[styles.routineCatTag, done && styles.routineCatTagDone]}>
                      <Text style={[styles.routineCatText, done && styles.routineCatTextDone]}>{routine.category}</Text>
                    </View>
                    <Text style={[styles.routineTitle, done && styles.routineTitleDone]}>{routine.title}</Text>
                  </View>
                  <Text style={styles.routineDesc}>{routine.description}</Text>
                  <Text style={styles.routineDur}>{routine.durationMin} دقيقة</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* Pain reporter */}
        <Text style={styles.sectionTitle}>تسجيل ألم جديد</Text>
        <View style={styles.reportCard}>
          <Text style={styles.reportLabel}>منطقة الألم</Text>
          <View style={styles.bodyAreaGrid}>
            {BODY_AREAS.map((area) => (
              <Pressable key={area} onPress={() => setSelectedArea(area === selectedArea ? null : area)}>
                <View style={[styles.areaChip, selectedArea === area && styles.areaChipActive]}>
                  <Text style={[styles.areaChipText, selectedArea === area && styles.areaChipTextActive]}>{area}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Text style={styles.reportLabel}>شدة الألم: {painLevel}/10</Text>
          <View style={styles.painRow}>
            {PAIN_LEVELS.map((lvl) => (
              <Pressable key={lvl} onPress={() => setPainLevel(lvl)}>
                <View style={[
                  styles.painDot,
                  { backgroundColor: lvl <= 3 ? '#30B36A' : lvl <= 6 ? '#F79A3E' : '#E74424' },
                  painLevel === lvl && styles.painDotActive
                ]}>
                  <Text style={styles.painDotText}>{lvl}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={sendReport}>
            <LinearGradient
              colors={reportSent ? ['#30B36A', '#27A05D'] : [colors.gradientStart, colors.gradientEnd]}
              style={styles.reportBtn}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
            >
              <Text style={styles.reportBtnText}>{reportSent ? '✓ تم الإرسال' : 'إرسال للفريق الطبي'}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 100 },

  headerRow: { flexDirection: 'row-reverse', alignItems: 'flex-end', marginBottom: spacing.md },
  back: { fontSize: 22, color: colors.primary, paddingLeft: spacing.sm },
  headerText: { flex: 1, alignItems: 'flex-end' },
  kicker: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  title: { ...typography.h1, color: colors.text },

  heroCard: { borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.md },
  heroStats: { flexDirection: 'row-reverse', justifyContent: 'space-around', marginBottom: spacing.md },
  heroStat: { alignItems: 'center' },
  heroStatVal: { color: '#fff', fontSize: 22, fontWeight: '900' },
  heroStatLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', height: 30, alignSelf: 'center' },
  heroProgress: { gap: 6 },
  heroProgressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  heroProgressFill: { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  heroProgressLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'right' },

  physioCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    ...shadows.sm,
    overflow: 'hidden'
  },
  physioAccent: { width: 4, borderRadius: 2, position: 'absolute', left: 0, top: 0, bottom: 0 },
  physioAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  physioAvatarTxt: { fontWeight: '800', fontSize: 15 },
  physioBody: { flex: 1, alignItems: 'flex-end' },
  physioName: { color: colors.text, fontWeight: '800', fontSize: 14 },
  physioSpec: { color: '#7C5CBF', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  physioMsg: { color: colors.muted, fontSize: 12, textAlign: 'right', lineHeight: 18 },

  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'right', marginBottom: spacing.sm, marginTop: spacing.md },

  injuryCard: {
    borderRadius: radius.xl,
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  injuryTopRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  injuryArea: { color: colors.text, fontSize: 17, fontWeight: '800' },
  severityBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  severityText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  injuryNote: { color: colors.text, fontSize: 13, textAlign: 'right', lineHeight: 19, marginBottom: spacing.xs },
  injuryStatusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  sevBarTrack: { height: 4, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' },
  sevBarFill: { height: 4, borderRadius: 2 },

  routineCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    ...shadows.sm
  },
  routineCardDone: { backgroundColor: '#F8F0FF', borderColor: '#C4A8F0' },
  routineCheck: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.line
  },
  routineCheckDone: { backgroundColor: '#7C5CBF', borderColor: '#7C5CBF' },
  routineCheckIcon: { color: '#fff', fontSize: 18, fontWeight: '900' },
  routineIcon: { fontSize: 20 },
  routineBody: { flex: 1, alignItems: 'flex-end' },
  routineTopRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 4 },
  routineTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  routineTitleDone: { color: colors.muted, textDecorationLine: 'line-through' },
  routineCatTag: { backgroundColor: colors.cardSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  routineCatTagDone: { backgroundColor: '#E8D5FF' },
  routineCatText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  routineCatTextDone: { color: '#7C5CBF' },
  routineDesc: { color: colors.muted, fontSize: 12, textAlign: 'right', lineHeight: 17, marginBottom: 4 },
  routineDur: { color: colors.muted, fontSize: 11 },

  reportCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, ...shadows.sm },
  reportLabel: { color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'right', marginBottom: spacing.sm },
  bodyAreaGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  areaChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.background
  },
  areaChipActive: { backgroundColor: '#FFF0EE', borderColor: colors.primary },
  areaChipText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  areaChipTextActive: { color: colors.primary },
  painRow: { flexDirection: 'row-reverse', gap: 6, flexWrap: 'wrap', marginBottom: spacing.md },
  painDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5
  },
  painDotActive: { opacity: 1, transform: [{ scale: 1.2 }] },
  painDotText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  reportBtn: { borderRadius: radius.pill, paddingVertical: 14, alignItems: 'center' },
  reportBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' }
});
