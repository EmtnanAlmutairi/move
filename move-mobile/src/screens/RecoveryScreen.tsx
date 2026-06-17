import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { injuries, professionals, userProfile } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { radius, shadows, spacing, typography } from '../theme/tokens';

const SEVERITY: Record<number, { bg: string; border: string; label: string }> = {
  1: { bg: '#FFF8E7', border: '#F79A3E', label: 'مراقبة' },
  2: { bg: '#FFF0EE', border: '#FF7A5C', label: 'متوسط' },
  3: { bg: '#FFECEC', border: '#E74424', label: 'شديد' },
};

const STATUS_TEXT: Record<string, string> = {
  new:        'حالة جديدة',
  monitoring: 'تحت المراقبة',
  resolved:   'تعافى',
};

const BODY_AREAS = ['الكتف', 'الظهر', 'الركبة', 'الكاحل', 'الرقبة', 'الورك', 'الكوع', 'الرسغ'];

const ROUTINES = [
  { id: 'r1', title: 'تمارين تمديد أسفل الظهر', durationMin: 15, category: 'علاج',     desc: 'روتين إطالة لتخفيف ضغط الفقرات القطنية',    doneToday: true  },
  { id: 'r2', title: 'إحماء المفاصل الصباحي',   durationMin: 10, category: 'وقاية',    desc: 'تحريك دائري للمفاصل لتحسين التروية الدموية', doneToday: false },
  { id: 'r3', title: 'تمارين الكور التأهيلية',  durationMin: 20, category: 'تقوية',    desc: 'تقوية عضلات الكور لدعم العمود الفقري',       doneToday: false },
  { id: 'r4', title: 'تنفس عميق وإسترخاء',      durationMin: 8,  category: 'استشفاء', desc: 'تقنيات تنفس لخفض الكورتيزول وتسريع التعافي', doneToday: true  },
];

const CAT_ICON: Record<string, { name: string; lib: 'ion' | 'mci' }> = {
  'علاج':     { name: 'body-outline',  lib: 'ion' },
  'وقاية':    { name: 'sunny-outline', lib: 'ion' },
  'تقوية':    { name: 'dumbbell',      lib: 'mci' },
  'استشفاء':  { name: 'leaf-outline',  lib: 'ion' },
};

function CatIcon({ category, color }: { category: string; color: string }) {
  const ic = CAT_ICON[category] ?? { name: 'fitness-outline', lib: 'ion' };
  if (ic.lib === 'mci') return <MaterialCommunityIcons name={ic.name as any} size={20} color={color} />;
  return <Ionicons name={ic.name as any} size={20} color={color} />;
}

export function RecoveryScreen({ navigation }: any) {
  const { theme: t } = useTheme();

  const [done, setDone] = useState<Set<string>>(
    new Set(ROUTINES.filter((r) => r.doneToday).map((r) => r.id))
  );
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [pain, setPain]   = useState(0);
  const [sent, setSent]   = useState(false);

  const physio     = professionals.find((p) => p.id === userProfile.selectedPhysioId);
  const doneCount  = done.size;
  const donePct    = Math.round((doneCount / ROUTINES.length) * 100);

  const toggleDone = (id: string) =>
    setDone((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const sendReport = () => {
    if (!selectedArea) { Alert.alert('تنبيه', 'يرجى تحديد منطقة الألم أولاً'); return; }
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    Alert.alert('تم الإرسال ✓', `تم إرسال بلاغ الألم في ${selectedArea} (درجة ${pain}) إلى ${physio?.name ?? 'الفريق الطبي'}`);
  };

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#5A4A38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.3 : 0.07,
    shadowRadius: 10,
    elevation: 3,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ────────────────────────────────── */}
        <View style={st.header}>
          <Pressable
            style={[st.backBtn, { backgroundColor: t.cardSoft }]}
            onPress={() => navigation?.goBack?.()}
          >
            <Ionicons name="chevron-forward" size={20} color={t.muted} />
          </Pressable>
          <Text style={[st.pageTitle, { color: t.text }]}>الاستشفاء</Text>
        </View>

        {/* ── HERO GRADIENT ─────────────────────────── */}
        <LinearGradient
          colors={[t.gradientStart, t.gradientEnd]}
          style={st.hero}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* KPIs */}
          <View style={st.heroKpis}>
            <View style={st.heroKpi}>
              <Text style={st.heroKpiVal}>{doneCount}/{ROUTINES.length}</Text>
              <Text style={st.heroKpiLbl}>روتين منجز</Text>
            </View>
            <View style={st.heroKpiDiv} />
            <View style={st.heroKpi}>
              <Text style={st.heroKpiVal}>{injuries.length}</Text>
              <Text style={st.heroKpiLbl}>إصابة نشطة</Text>
            </View>
            <View style={st.heroKpiDiv} />
            <View style={st.heroKpi}>
              <Text style={st.heroKpiVal}>87%</Text>
              <Text style={st.heroKpiLbl}>نسبة التعافي</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={st.heroBar}>
            <View style={st.heroBarTrack}>
              <View style={[st.heroBarFill, { width: `${donePct}%` as any }]} />
            </View>
            <Text style={st.heroBarLbl}>تقدم اليوم · {donePct}%</Text>
          </View>
        </LinearGradient>

        {/* ── PHYSIO CARD ───────────────────────────── */}
        {physio && (
          <View style={[st.physioCard, { backgroundColor: t.card }, cardShadow]}>
            <View style={[st.physioAccent, { backgroundColor: physio.avatarColor }]} />
            <View style={[st.physioAvt, { backgroundColor: physio.avatarColor + '22' }]}>
              <Text style={[st.physioAvtTxt, { color: physio.avatarColor }]}>{physio.avatarInitials}</Text>
            </View>
            <View style={st.physioBody}>
              <Text style={[st.physioName, { color: t.text }]}>{physio.name}</Text>
              <Text style={[st.physioSpec, { color: t.primary }]}>{physio.specialization}</Text>
              <Text style={[st.physioMsg, { color: t.muted }]}>
                روتين اليوم معدّل لأسفل الظهر — تجنب الضغط المحوري
              </Text>
            </View>
          </View>
        )}

        {/* ── ACTIVE INJURIES ───────────────────────── */}
        {injuries.length > 0 && (
          <>
            <Text style={[st.sectionTitle, { color: t.text }]}>الإصابات النشطة</Text>
            {injuries.map((inj) => {
              const sev = SEVERITY[inj.severity] ?? SEVERITY[1];
              const stsText  = STATUS_TEXT[inj.status] ?? STATUS_TEXT.monitoring;
              const stsColor = inj.status === 'resolved' ? t.success : t.primary;
              const isLight = t.mode === 'light';
              return (
                <View
                  key={inj.id}
                  style={[
                    st.injuryCard,
                    {
                      backgroundColor: isLight ? sev.bg : t.cardSoft,
                      borderColor: sev.border,
                    },
                  ]}
                >
                  <View style={st.injuryTop}>
                    <View style={[st.sevBadge, { backgroundColor: sev.border }]}>
                      <Text style={st.sevBadgeTxt}>درجة {inj.severity}</Text>
                    </View>
                    <Text style={[st.injuryArea, { color: t.text }]}>{inj.area}</Text>
                  </View>
                  <Text style={[st.injuryNote, { color: t.mode === 'light' ? '#444' : t.textSub }]}>
                    {inj.note}
                  </Text>
                  <View style={st.injuryStatus}>
                    <View style={[st.statusDot, { backgroundColor: stsColor }]} />
                    <Text style={[st.statusTxt, { color: stsColor }]}>{stsText}</Text>
                  </View>
                  <View style={[st.sevBarTrack, { backgroundColor: t.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }]}>
                    <View style={[st.sevBarFill, { width: `${(inj.severity / 3) * 100}%` as any, backgroundColor: sev.border }]} />
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ── RECOVERY ROUTINES ─────────────────────── */}
        <Text style={[st.sectionTitle, { color: t.text }]}>روتين الاستشفاء اليوم</Text>
        {ROUTINES.map((r) => {
          const isDone = done.has(r.id);
          return (
            <Pressable key={r.id} onPress={() => toggleDone(r.id)}>
              <View
                style={[
                  st.routineCard,
                  {
                    backgroundColor: isDone ? (t.mode === 'light' ? '#FFF5EE' : t.cardSoft) : t.card,
                    borderColor: isDone ? t.primary + '55' : t.line,
                  },
                  cardShadow,
                ]}
              >
                {/* Check circle */}
                <View style={st.routineLeft}>
                  {isDone ? (
                    <LinearGradient
                      colors={[t.gradientStart, t.gradientEnd]}
                      style={st.routineCheck}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="checkmark" size={22} color="#fff" />
                    </LinearGradient>
                  ) : (
                    <View style={[st.routineCheck, { backgroundColor: t.cardSoft, borderWidth: 2, borderColor: t.line }]}>
                      <CatIcon category={r.category} color={t.primary} />
                    </View>
                  )}
                </View>

                <View style={st.routineBody}>
                  <View style={st.routineTop}>
                    <View style={[st.catTag, { backgroundColor: isDone ? t.primary + '18' : t.cardSoft }]}>
                      <Text style={[st.catTagTxt, { color: isDone ? t.primary : t.muted }]}>{r.category}</Text>
                    </View>
                    <Text style={[st.routineTitle, { color: isDone ? t.muted : t.text, textDecorationLine: isDone ? 'line-through' : 'none' }]}>
                      {r.title}
                    </Text>
                  </View>
                  <Text style={[st.routineDesc, { color: t.muted }]}>{r.desc}</Text>
                  <Text style={[st.routineDur, { color: t.muted }]}>{r.durationMin} دقيقة</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* ── PAIN REPORTER ─────────────────────────── */}
        <Text style={[st.sectionTitle, { color: t.text }]}>تسجيل ألم جديد</Text>
        <View style={[st.reportCard, { backgroundColor: t.card }, cardShadow]}>

          {/* Body area chips */}
          <Text style={[st.reportLbl, { color: t.text }]}>منطقة الألم</Text>
          <View style={st.areaGrid}>
            {BODY_AREAS.map((area) => {
              const active = selectedArea === area;
              return (
                <Pressable key={area} onPress={() => setSelectedArea(active ? null : area)}>
                  <View
                    style={[
                      st.areaChip,
                      {
                        backgroundColor: active ? t.primary + '18' : t.cardSoft,
                        borderColor: active ? t.primary : t.line,
                      },
                    ]}
                  >
                    <Text style={[st.areaChipTxt, { color: active ? t.primary : t.muted }]}>{area}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Pain scale */}
          <Text style={[st.reportLbl, { color: t.text }]}>
            شدة الألم: <Text style={{ color: pain <= 3 ? '#30B36A' : pain <= 6 ? '#F79A3E' : '#E74424', fontWeight: '900' }}>{pain}/10</Text>
          </Text>
          <View style={st.painRow}>
            {[0,1,2,3,4,5,6,7,8,9,10].map((lvl) => {
              const lvlColor = lvl <= 3 ? '#30B36A' : lvl <= 6 ? '#F79A3E' : '#E74424';
              const isActive = pain === lvl;
              return (
                <Pressable key={lvl} onPress={() => setPain(lvl)}>
                  <View
                    style={[
                      st.painDot,
                      {
                        backgroundColor: lvlColor,
                        opacity: isActive ? 1 : 0.35,
                        transform: [{ scale: isActive ? 1.2 : 1 }],
                        borderWidth: isActive ? 2.5 : 0,
                        borderColor: '#fff',
                      },
                    ]}
                  >
                    <Text style={st.painDotTxt}>{lvl}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Send button */}
          <Pressable onPress={sendReport}>
            <LinearGradient
              colors={sent ? ['#30B36A', '#27A05D'] : [t.gradientStart, t.gradientEnd]}
              style={st.sendBtn}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
            >
              <Ionicons name={sent ? 'checkmark-circle' : 'send'} size={18} color="#fff" style={{ marginLeft: 8 }} />
              <Text style={st.sendBtnTxt}>{sent ? 'تم الإرسال للفريق الطبي' : 'إرسال للفريق الطبي'}</Text>
            </LinearGradient>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 110 },

  // Header
  header:     { flexDirection: 'row-reverse', alignItems: 'flex-end', marginBottom: spacing.md },
  backBtn:    { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, alignItems: 'flex-end' },
  kicker:     { fontWeight: '700', fontSize: 13, letterSpacing: 1 },
  pageTitle:  { ...typography.h1 },

  // Hero
  hero:       { borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.md },
  heroKpis:   { flexDirection: 'row-reverse', justifyContent: 'space-around', marginBottom: spacing.md },
  heroKpi:    { alignItems: 'center' },
  heroKpiVal: { color: '#fff', fontSize: 22, fontWeight: '900' },
  heroKpiLbl: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  heroKpiDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', height: 32, alignSelf: 'center' },
  heroBar:    { gap: 6 },
  heroBarTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  heroBarFill:  { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  heroBarLbl:   { color: 'rgba(255,255,255,0.75)', fontSize: 11, textAlign: 'right' },

  // Physio
  physioCard: { borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row-reverse', gap: spacing.sm, overflow: 'hidden' },
  physioAccent: { width: 4, borderRadius: 2, position: 'absolute', left: 0, top: 0, bottom: 0 },
  physioAvt:    { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  physioAvtTxt: { fontWeight: '800', fontSize: 15 },
  physioBody:   { flex: 1, alignItems: 'flex-end' },
  physioName:   { fontWeight: '800', fontSize: 14 },
  physioSpec:   { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  physioMsg:    { fontSize: 12, textAlign: 'right', lineHeight: 18 },

  sectionTitle: { fontSize: 18, fontWeight: '800', textAlign: 'right', marginBottom: spacing.sm, marginTop: spacing.md },

  // Injuries
  injuryCard:   { borderRadius: radius.xl, borderWidth: 1.5, padding: spacing.md, marginBottom: spacing.sm },
  injuryTop:    { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  injuryArea:   { fontSize: 17, fontWeight: '800' },
  sevBadge:     { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  sevBadgeTxt:  { color: '#fff', fontSize: 11, fontWeight: '800' },
  injuryNote:   { fontSize: 13, textAlign: 'right', lineHeight: 19, marginBottom: spacing.xs },
  injuryStatus: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  statusDot:    { width: 8, height: 8, borderRadius: 4 },
  statusTxt:    { fontSize: 12, fontWeight: '700' },
  sevBarTrack:  { height: 4, borderRadius: 2, overflow: 'hidden' },
  sevBarFill:   { height: 4, borderRadius: 2 },

  // Routines
  routineCard: { borderRadius: radius.xl, borderWidth: 1.5, padding: spacing.sm, marginBottom: spacing.sm, flexDirection: 'row-reverse', gap: spacing.sm },
  routineLeft: { paddingTop: 2 },
  routineCheck: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  routineBody: { flex: 1, alignItems: 'flex-end' },
  routineTop:  { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 4 },
  routineTitle: { fontSize: 15, fontWeight: '800' },
  catTag:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  catTagTxt:   { fontSize: 10, fontWeight: '700' },
  routineDesc: { fontSize: 12, textAlign: 'right', lineHeight: 17, marginBottom: 4 },
  routineDur:  { fontSize: 11 },

  // Pain reporter
  reportCard:  { borderRadius: radius.xl, padding: spacing.md },
  reportLbl:   { fontSize: 15, fontWeight: '700', textAlign: 'right', marginBottom: spacing.sm },
  areaGrid:    { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  areaChip:    { paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.5 },
  areaChipTxt: { fontSize: 13, fontWeight: '700' },
  painRow:     { flexDirection: 'row-reverse', gap: 5, flexWrap: 'wrap', marginBottom: spacing.md },
  painDot:     { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  painDotTxt:  { color: '#fff', fontSize: 11, fontWeight: '800' },
  sendBtn:     { borderRadius: radius.pill, paddingVertical: 14, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  sendBtnTxt:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});
