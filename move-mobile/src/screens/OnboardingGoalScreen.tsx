import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { UserGoal } from '../types';

// ─── Step data ────────────────────────────────────────────────────────────────
const GOALS: { id: UserGoal; title: string; sub: string; icon: string; lib: 'I' | 'MC'; colors: [string, string] }[] = [
  { id: 'muscle-gain', title: 'بناء العضلات',    sub: 'زيادة الكتلة والقوة',      icon: 'dumbbell',       lib: 'MC', colors: ['#FF4500', '#FF9A00'] },
  { id: 'weight-loss', title: 'خسارة الوزن',     sub: 'حرق الدهون والرشاقة',     icon: 'flame-outline',  lib: 'I',  colors: ['#5E81F4', '#8E5CF5'] },
  { id: 'fitness',     title: 'اللياقة العامة',   sub: 'صحة متكاملة وطاقة يومية', icon: 'flash-outline',  lib: 'I',  colors: ['#30B36A', '#1A9ECC'] },
];

const ACTIVITY_TYPES = [
  { id: 'run',   label: 'جري',       icon: 'run',            lib: 'MC', color: '#1A9ECC' },
  { id: 'lift',  label: 'رفع أثقال', icon: 'dumbbell',       lib: 'MC', color: '#FF5C39' },
  { id: 'cycle', label: 'دراجة',     icon: 'bike',           lib: 'MC', color: '#30B36A' },
  { id: 'yoga',  label: 'يوغا',      icon: 'meditation',     lib: 'MC', color: '#8E5CF5' },
  { id: 'mixed', label: 'متنوع',     icon: 'flash-outline',  lib: 'I',  color: '#FF7A18' },
] as const;

const SOCIAL_INTENTS = [
  { id: 'compete', icon: 'trophy',      lib: 'I',  title: 'أتنافس',     sub: 'أريد أن أكون الأفضل في القائمة' },
  { id: 'share',   icon: 'share',       lib: 'I',  title: 'أشارك',      sub: 'أحب أن أوثّق رحلتي وألهم غيري' },
  { id: 'both',    icon: 'people',      lib: 'I',  title: 'الاثنان',    sub: 'أريد المنافسة والمشاركة معاً'  },
  { id: 'solo',    icon: 'person',      lib: 'I',  title: 'بمفردي',     sub: 'أركز على تطوير نفسي فقط'       },
] as const;

const SUGGESTED_USERS = [
  { id: 'u1', initials: 'أح', color: '#FF6B35', name: 'أحمد العتيبي',    desc: '🔥 21 يوم ستريك · 1,840 نقطة' },
  { id: 'u2', initials: 'مح', color: '#5E81F4', name: 'محمد الغامدي',    desc: '🏃 جري · 89 كم هذا الشهر'      },
  { id: 'u3', initials: 'نو', color: '#FF69B4', name: 'نورة الشمري',     desc: '💪 رفع أثقال · 14 يوم ستريك'   },
  { id: 'u4', initials: 'رش', color: '#8E5CF5', name: 'رشيد القحطاني',   desc: '🧘 يوغا · 30 جلسة مكتملة'       },
];

const STARTER_CHALLENGES = [
  { id: 'ch1', icon: 'run',      label: 'تحدي أول 5 كم',          desc: '5 أيام · 142 مشترك',         color: '#1A9ECC', progress: 0 },
  { id: 'ch2', icon: 'dumbbell', label: 'تحدي أسبوع القوة',       desc: '7 أيام · 89 مشترك',          color: '#FF5C39', progress: 0 },
  { id: 'ch3', icon: 'fire',     label: '7 أيام نشاط متواصل',     desc: 'أسبوع واحد · 318 مشترك',     color: '#FF7A18', progress: 0 },
];

// ─── Progress Dots ────────────────────────────────────────────────────────────
function ProgressDots({ total, current, t }: { total: number; current: number; t: any }) {
  return (
    <View style={pd.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            pd.dot,
            { backgroundColor: i <= current ? t.primary : t.line },
            i === current && pd.dotActive,
          ]}
        />
      ))}
    </View>
  );
}
const pd = StyleSheet.create({
  row:       { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: spacing.xl },
  dot:       { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 20, height: 6, borderRadius: 3 },
});

// ─── Option Chip (reusable) ───────────────────────────────────────────────────
function OptionChip({ label, icon, lib, color, selected, onPress }: any) {
  const { theme: t } = useTheme();
  return (
    <Pressable
      style={[oc.chip, { borderColor: selected ? color : t.line, backgroundColor: selected ? color + '14' : t.card }]}
      onPress={onPress}
    >
      {lib === 'MC'
        ? <MaterialCommunityIcons name={icon} size={16} color={selected ? color : t.muted} />
        : <Ionicons name={icon} size={16} color={selected ? color : t.muted} />
      }
      <Text style={[oc.label, { color: selected ? color : t.muted }]}>{label}</Text>
      {selected && <View style={[oc.dot, { backgroundColor: color }]} />}
    </Pressable>
  );
}
const oc = StyleSheet.create({
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 12 },
  label: { fontSize: 14, fontWeight: '700' },
  dot:   { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
});

// ─── Main Onboarding Screen ───────────────────────────────────────────────────
export function OnboardingGoalScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const [step, setStep] = useState(0);

  // Step state
  const [goal,         setGoal]         = useState<UserGoal>('muscle-gain');
  const [activityType, setActivityType] = useState('lift');
  const [socialIntent, setSocialIntent] = useState('compete');
  const [followed,     setFollowed]     = useState<Record<string, boolean>>({});
  const [joinedChallenge, setJoinedChallenge] = useState<string | null>(null);

  const TOTAL_STEPS = 5;

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else navigation.replace('Welcome', { goalId: goal });
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  };

  // ── Step 0: Goal ─────────────────────────────────────────────────────────────
  const step0 = (
    <View>
      <View style={st.stepHeader}>
        <Text style={[st.eyebrow, { color: t.primary }]}>ما هدفك؟</Text>
        <Text style={[st.stepTitle, { color: t.text }]}>أخبرنا عن نفسك</Text>
        <Text style={[st.stepSub, { color: t.muted }]}>سنبني خطتك وفريقك الصحي تلقائياً</Text>
      </View>
      <View style={st.goalList}>
        {GOALS.map((g) => {
          const active = goal === g.id;
          return (
            <Pressable
              key={g.id}
              style={[st.goalCard, { borderColor: active ? g.colors[0] : t.line, backgroundColor: t.card }, active && cardShadow]}
              onPress={() => setGoal(g.id)}
            >
              <LinearGradient colors={active ? g.colors : [t.cardSoft, t.cardSoft]} style={st.goalIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {g.lib === 'MC'
                  ? <MaterialCommunityIcons name={g.icon as any} size={22} color={active ? '#fff' : t.muted} />
                  : <Ionicons name={g.icon as any} size={22} color={active ? '#fff' : t.muted} />
                }
              </LinearGradient>
              <View style={st.goalBody}>
                <Text style={[st.goalTitle, { color: active ? t.text : t.text }]}>{g.title}</Text>
                <Text style={[st.goalSub, { color: t.muted }]}>{g.sub}</Text>
              </View>
              <View style={[st.radio, { borderColor: active ? g.colors[0] : t.line }]}>
                {active && <View style={[st.radioDot, { backgroundColor: g.colors[0] }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // ── Step 1: Activity type ─────────────────────────────────────────────────────
  const step1 = (
    <View>
      <View style={st.stepHeader}>
        <Text style={[st.eyebrow, { color: t.primary }]}>نوع النشاط</Text>
        <Text style={[st.stepTitle, { color: t.text }]}>كيف تفضّل تمرينك؟</Text>
        <Text style={[st.stepSub, { color: t.muted }]}>اختر واحداً أو أكثر</Text>
      </View>
      <View style={st.chipGrid}>
        {ACTIVITY_TYPES.map((a) => (
          <OptionChip
            key={a.id}
            label={a.label}
            icon={a.icon}
            lib={a.lib}
            color={a.color}
            selected={activityType === a.id}
            onPress={() => setActivityType(a.id)}
          />
        ))}
      </View>
    </View>
  );

  // ── Step 2: Social intent ─────────────────────────────────────────────────────
  const step2 = (
    <View>
      <View style={st.stepHeader}>
        <Text style={[st.eyebrow, { color: t.primary }]}>الجانب الاجتماعي</Text>
        <Text style={[st.stepTitle, { color: t.text }]}>ما طبيعتك الرياضية؟</Text>
        <Text style={[st.stepSub, { color: t.muted }]}>سنضبط الفيد والتحديات حسب اختيارك</Text>
      </View>
      <View style={st.intentList}>
        {SOCIAL_INTENTS.map((s) => {
          const active = socialIntent === s.id;
          return (
            <Pressable
              key={s.id}
              style={[st.intentCard, { borderColor: active ? t.primary : t.line, backgroundColor: active ? t.primary + '10' : t.card }]}
              onPress={() => setSocialIntent(s.id)}
            >
              <View style={[st.intentIcon, { backgroundColor: active ? t.primary + '18' : t.cardSoft }]}>
                <Ionicons name={s.icon as any} size={20} color={active ? t.primary : t.muted} />
              </View>
              <View style={st.intentBody}>
                <Text style={[st.intentTitle, { color: active ? t.primary : t.text }]}>{s.title}</Text>
                <Text style={[st.intentSub, { color: t.muted }]}>{s.sub}</Text>
              </View>
              {active && <Ionicons name="checkmark-circle" size={20} color={t.primary} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // ── Step 3: Follow users ──────────────────────────────────────────────────────
  const step3 = (
    <View>
      <View style={st.stepHeader}>
        <Text style={[st.eyebrow, { color: t.primary }]}>ابدأ شبكتك</Text>
        <Text style={[st.stepTitle, { color: t.text }]}>تابع رياضيين نشطين</Text>
        <Text style={[st.stepSub, { color: t.muted }]}>سيظهر نشاطهم في فيدك مباشرة</Text>
      </View>
      <View style={st.userList}>
        {SUGGESTED_USERS.map((u) => {
          const isFollowing = followed[u.id];
          return (
            <View key={u.id} style={[st.userRow, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
              <Pressable
                style={[st.followBtn, { backgroundColor: isFollowing ? t.cardSoft : t.primary, borderColor: isFollowing ? t.line : t.primary }]}
                onPress={() => setFollowed((prev) => ({ ...prev, [u.id]: !prev[u.id] }))}
              >
                <Text style={[st.followBtnTxt, { color: isFollowing ? t.muted : '#fff' }]}>
                  {isFollowing ? 'تتابعه' : 'متابعة'}
                </Text>
              </Pressable>
              <View style={st.userInfo}>
                <Text style={[st.userName, { color: t.text }]}>{u.name}</Text>
                <Text style={[st.userDesc, { color: t.muted }]}>{u.desc}</Text>
              </View>
              <View style={[st.userAvatar, { backgroundColor: u.color + '22', borderColor: u.color }]}>
                <Text style={[st.userAvatarTxt, { color: u.color }]}>{u.initials}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <Pressable onPress={next} style={st.skipLink}>
        <Text style={[st.skipLinkTxt, { color: t.muted }]}>تخطي الآن</Text>
      </Pressable>
    </View>
  );

  // ── Step 4: Join challenge ────────────────────────────────────────────────────
  const step4 = (
    <View>
      <View style={st.stepHeader}>
        <Text style={[st.eyebrow, { color: t.primary }]}>أول تحدي</Text>
        <Text style={[st.stepTitle, { color: t.text }]}>انضم لتحدي وابدأ الآن</Text>
        <Text style={[st.stepSub, { color: t.muted }]}>التحديات تصنع العادات</Text>
      </View>
      <View style={st.challengeList}>
        {STARTER_CHALLENGES.map((ch) => {
          const joined = joinedChallenge === ch.id;
          return (
            <Pressable
              key={ch.id}
              style={[st.challengeCard, { borderColor: joined ? ch.color : t.line, backgroundColor: joined ? ch.color + '10' : t.card }, cardShadow]}
              onPress={() => setJoinedChallenge(joined ? null : ch.id)}
            >
              <View style={[st.challengeIconWrap, { backgroundColor: ch.color + '18' }]}>
                <MaterialCommunityIcons name={ch.icon as any} size={22} color={ch.color} />
              </View>
              <View style={st.challengeBody}>
                <Text style={[st.challengeLabel, { color: t.text }]}>{ch.label}</Text>
                <Text style={[st.challengeDesc, { color: t.muted }]}>{ch.desc}</Text>
              </View>
              <View style={[st.challengeRadio, { borderColor: joined ? ch.color : t.line }]}>
                {joined && <View style={[st.challengeRadioDot, { backgroundColor: ch.color }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={next} style={st.skipLink}>
        <Text style={[st.skipLinkTxt, { color: t.muted }]}>تخطي — دخول مباشر</Text>
      </Pressable>
    </View>
  );

  const STEPS = [step0, step1, step2, step3, step4];
  const isLastStep = step === TOTAL_STEPS - 1;
  const isFollowStep = step === 3;
  const isChallengeStep = step === 4;

  const ctaLabel =
    isLastStep && joinedChallenge ? 'ابدأ رحلتك 🚀' :
    isLastStep                    ? 'دخول التطبيق'  :
    isFollowStep                  ? 'التالي'        :
                                    'التالي';

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      {/* Top bar */}
      <View style={st.topBar}>
        {step > 0
          ? <Pressable style={[st.backBtn, { backgroundColor: t.cardSoft }]} onPress={back}>
              <Ionicons name="chevron-forward" size={18} color={t.muted} />
            </Pressable>
          : <View style={st.backBtn} />
        }
        <Text style={[st.stepCounter, { color: t.muted }]}>{step + 1} / {TOTAL_STEPS}</Text>
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <ProgressDots total={TOTAL_STEPS} current={step} t={t} />
        {STEPS[step]}
      </ScrollView>

      {/* CTA */}
      {!(isFollowStep || isChallengeStep) && (
        <View style={st.ctaWrap}>
          <Pressable onPress={next}>
            <LinearGradient
              colors={[t.gradientStart, t.gradientEnd]}
              style={st.ctaBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={st.ctaTxt}>{ctaLabel}</Text>
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {(isFollowStep || isChallengeStep) && (
        <View style={st.ctaWrap}>
          <Pressable onPress={next}>
            <LinearGradient
              colors={[t.gradientStart, t.gradientEnd]}
              style={st.ctaBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={st.ctaTxt}>{ctaLabel}</Text>
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:    { flex: 1 },
  scroll:  { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: 120 },
  topBar:  { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepCounter: { fontSize: 12, fontWeight: '700' },

  stepHeader: { alignItems: 'flex-end', marginBottom: spacing.xl },
  eyebrow:    { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.xs },
  stepTitle:  { fontSize: 30, fontWeight: '900', textAlign: 'right', marginBottom: spacing.xs },
  stepSub:    { fontSize: 14, textAlign: 'right', lineHeight: 21 },

  // Goal step
  goalList: { gap: spacing.sm },
  goalCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, borderRadius: 18, borderWidth: 2, padding: spacing.md },
  goalIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  goalBody: { flex: 1, alignItems: 'flex-end' },
  goalTitle:{ fontSize: 18, fontWeight: '900' },
  goalSub:  { fontSize: 12, marginTop: 2 },
  radio:    { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6 },

  // Activity type
  chipGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },

  // Social intent
  intentList: { gap: spacing.sm },
  intentCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderRadius: 16, borderWidth: 1.5, padding: spacing.md },
  intentIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  intentBody: { flex: 1, alignItems: 'flex-end' },
  intentTitle:{ fontSize: 16, fontWeight: '800' },
  intentSub:  { fontSize: 12, marginTop: 2 },

  // Follow users
  userList:      { gap: spacing.xs },
  userRow:       { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderRadius: 16, borderWidth: 1, padding: spacing.md },
  userAvatar:    { width: 44, height: 44, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userAvatarTxt: { fontSize: 14, fontWeight: '900' },
  userInfo:      { flex: 1, alignItems: 'flex-end' },
  userName:      { fontSize: 14, fontWeight: '800' },
  userDesc:      { fontSize: 11, marginTop: 2 },
  followBtn:     { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  followBtnTxt:  { fontSize: 13, fontWeight: '800' },

  // Challenge step
  challengeList:     { gap: spacing.sm },
  challengeCard:     { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, borderRadius: 18, borderWidth: 2, padding: spacing.md },
  challengeIconWrap: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  challengeBody:     { flex: 1, alignItems: 'flex-end' },
  challengeLabel:    { fontSize: 15, fontWeight: '900' },
  challengeDesc:     { fontSize: 12, marginTop: 2 },
  challengeRadio:    { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  challengeRadioDot: { width: 11, height: 11, borderRadius: 6 },

  skipLink:    { alignItems: 'center', marginTop: spacing.lg },
  skipLinkTxt: { fontSize: 13, fontWeight: '600' },

  // CTA
  ctaWrap: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  ctaBtn:  { borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
});
