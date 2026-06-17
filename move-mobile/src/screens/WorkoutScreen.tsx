import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseDemoModal } from '../components/ExerciseDemoModal';
import { professionals, weeklyWorkout } from '../data/mockData';
import { useTheme, ThemeTokens } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { Exercise } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const INTENSITY_LABELS: Record<string, string> = { low: 'منخفض', medium: 'متوسط', high: 'عالي' };
const INTENSITY_HEX:    Record<string, string> = { low: '#16A34A', medium: '#F59E0B', high: '#FF4500' };

// ─── XP Banner ───────────────────────────────────────────────────────────────
function XpBanner({ xp, t }: { xp: number; t: ThemeTokens }) {
  return (
    <View style={[xpb.wrap, { backgroundColor: t.card, borderColor: t.line }]}>
      <LinearGradient
        colors={[t.xpGradStart, t.xpGradEnd]}
        style={xpb.badge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={xpb.xpNum}>+{xp}</Text>
        <Text style={xpb.xpLabel}>XP</Text>
      </LinearGradient>
      <Text style={[xpb.msg, { color: t.muted }]}>ستكسب عند إكمال التمرين</Text>
    </View>
  );
}
const xpb = StyleSheet.create({
  wrap:    { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderRadius: 14, padding: spacing.sm, borderWidth: 1, marginBottom: spacing.sm },
  badge:   { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  xpNum:   { color: '#fff', fontSize: 18, fontWeight: '900' },
  xpLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700' },
  msg:     { fontSize: 13, fontWeight: '500' },
});

// ─── Fade + Slide Entrance ────────────────────────────────────────────────────
function FadeSlide({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const translateY = useSharedValue(22);
  const opacity    = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 110 }));
    opacity.value    = withDelay(delay, withTiming(1, { duration: 340 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

// ─── Weight Tracker per set ───────────────────────────────────────────────────
const CARDIO_GROUPS = ['كارديو', 'كور'];

function WeightTracker({ weight, onChange, loggedWeights, t }: {
  weight: number;
  onChange: (w: number) => void;
  loggedWeights: number[];
  t: ThemeTokens;
}) {
  const step = 2.5;
  const [inputVal, setInputVal] = useState(weight > 0 ? String(weight) : '');

  const dec = () => {
    const next = Math.max(0, parseFloat((weight - step).toFixed(1)));
    onChange(next);
    setInputVal(next === 0 ? '' : String(next));
  };
  const inc = () => {
    const next = parseFloat((weight + step).toFixed(1));
    onChange(next);
    setInputVal(String(next));
  };
  const handleTextChange = (txt: string) => {
    setInputVal(txt);
    const parsed = parseFloat(txt);
    if (!isNaN(parsed) && parsed >= 0) onChange(parsed);
    else if (txt === '' || txt === '0') onChange(0);
  };
  const handleBlur = () => {
    const parsed = parseFloat(inputVal);
    if (isNaN(parsed) || parsed < 0) {
      setInputVal(weight > 0 ? String(weight) : '');
    }
  };

  return (
    <View style={[wt.wrap, { backgroundColor: t.cardSoft, borderColor: t.primary + '40' }]}>
      <View style={wt.headerRow}>
        <Ionicons name="barbell-outline" size={14} color={t.primary} />
        <Text style={[wt.label, { color: t.primary }]}>الوزن (كغ)</Text>
      </View>
      <View style={wt.controls}>
        <Pressable onPress={dec} style={[wt.btn, { backgroundColor: t.card, borderColor: t.line }]}>
          <Ionicons name="remove" size={22} color={t.text} />
        </Pressable>

        <TextInput
          style={[wt.input, { color: t.text, borderColor: t.line, backgroundColor: t.card }]}
          value={inputVal}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={t.muted}
          textAlign="center"
          maxLength={6}
        />

        <Pressable onPress={inc} style={[wt.btn, { backgroundColor: t.card, borderColor: t.line }]}>
          <Ionicons name="add" size={22} color={t.text} />
        </Pressable>
      </View>

      {weight === 0 && (
        <Text style={[wt.bodyweightHint, { color: t.muted }]}>اتركه فارغاً لتسجيل وزن الجسم</Text>
      )}

      {loggedWeights.length > 0 && (
        <View style={wt.history}>
          <Text style={[wt.histLabel, { color: t.muted }]}>مجموعات سابقة:</Text>
          {loggedWeights.map((w, i) => (
            <View key={i} style={[wt.histPill, { backgroundColor: t.primary + '18', borderColor: t.primary + '40' }]}>
              <Text style={[wt.histVal, { color: t.primary }]}>
                {w === 0 ? 'جسم' : `${w} كغ`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
const wt = StyleSheet.create({
  wrap:          { marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: 14, padding: spacing.md, borderWidth: 1.5 },
  headerRow:     { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginBottom: spacing.sm },
  label:         { fontSize: 12, fontWeight: '800', textAlign: 'right' },
  controls:      { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  btn:           { width: 46, height: 46, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  input:         { flex: 1, height: 46, borderRadius: 13, borderWidth: 1, fontSize: 22, fontWeight: '900' },
  bodyweightHint:{ fontSize: 11, textAlign: 'center', marginTop: 6 },
  history:       { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: spacing.sm, flexWrap: 'wrap' },
  histLabel:     { fontSize: 11, fontWeight: '600' },
  histPill:      { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  histVal:       { fontSize: 11, fontWeight: '700' },
});

// ─── Set Done Button with spring bounce ───────────────────────────────────────
function SetDoneButton({ onPress, label }: { onPress: () => void; label: string }) {
  const { theme: t } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn  = () => { scale.value = withSpring(0.95, { damping: 12 }); };
  const handlePressOut = () => { scale.value = withSpring(1.0,  { damping: 12 }); };
  const handlePress    = () => {
    scale.value = withSequence(
      withSpring(0.92, { damping: 8 }),
      withSpring(1.06, { damping: 10 }),
      withSpring(1.0,  { damping: 14 }),
    );
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[st.setDoneBtn, animStyle]}>
      <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <LinearGradient
          colors={[t.gradientStart, t.gradientEnd]}
          style={st.setDoneBtnGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
          <Text style={st.setDoneBtnText}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({
  ex,
  index,
  isActive,
  isComplete,
  done,
  delay,
  onComplete,
  onDemoPress,
  t,
  cardShadow,
  coachInitials,
  coachColor,
  currentWeight,
  onWeightChange,
  loggedWeights,
}: {
  ex: Exercise;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  done: number;
  delay: number;
  onComplete: () => void;
  onDemoPress: () => void;
  t: ThemeTokens;
  cardShadow: any;
  coachInitials: string;
  coachColor: string;
  currentWeight: number;
  onWeightChange: (w: number) => void;
  loggedWeights: number[];
}) {
  const [expanded, setExpanded] = useState(isActive);
  const prevDone = useRef(done);

  // Scale bounce on set complete
  const cardScale = useSharedValue(1);
  useEffect(() => {
    if (done > prevDone.current) {
      cardScale.value = withSequence(
        withSpring(1.02, { damping: 8 }),
        withSpring(1.0,  { damping: 14 }),
      );
    }
    prevDone.current = done;
  }, [done]);

  // Auto-expand when exercise becomes active
  useEffect(() => {
    if (isActive) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(true);
    }
  }, [isActive]);

  const handlePress = () => {
    if (isActive) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));

  return (
    <FadeSlide delay={delay}>
      <Animated.View
        style={[
          st.exCard,
          { backgroundColor: t.card, borderColor: t.line },
          isActive   && { borderColor: t.primary, borderWidth: 1.5, backgroundColor: `${t.primary}06`,
                          shadowColor: t.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 20, elevation: 8 },
          isComplete && { opacity: 0.48, borderColor: t.success + '55' },
          cardShadow,
          cardAnimStyle,
        ]}
      >
        <Pressable onPress={handlePress}>

          {/* ── Exercise thumbnail image (shown when expanded) ── */}
          {expanded && (
            <Pressable onPress={onDemoPress} style={st.imgWrap}>
              <Image
                source={{ uri: ex.thumbnail }}
                style={st.img}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.72)']}
                style={st.imgGrad}
              >
                <View style={st.demoTag}>
                  <Ionicons name="play-circle" size={15} color="#fff" />
                  <Text style={st.demoTxt}>شاهد الأداء الصحيح</Text>
                </View>
              </LinearGradient>
            </Pressable>
          )}

          {/* ── Header: index circle + name + expand chevron ── */}
          <View style={st.exHeader}>
            <View style={[
              st.exLeft,
              { backgroundColor: t.cardSoft, borderColor: t.line },
              isActive   && { borderColor: t.primary, overflow: 'hidden' },
              isComplete && { backgroundColor: `${t.success}15`, borderColor: t.success },
            ]}>
              {isActive && !isComplete ? (
                <LinearGradient
                  colors={[t.gradientStart, t.gradientEnd]}
                  style={st.exLeftFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={st.exNumberActive}>{index + 1}</Text>
                </LinearGradient>
              ) : isComplete ? (
                <Ionicons name="checkmark" size={17} color={t.success} />
              ) : (
                <Text style={[st.exNumber, { color: t.text }]}>{index + 1}</Text>
              )}
            </View>

            <View style={st.exInfo}>
              <Text style={[st.exName, { color: t.text }]}>{ex.name}</Text>
              <Text style={[st.exMuscle, { color: t.primary }]}>{ex.muscleGroup}</Text>
            </View>

            {!isActive && (
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={t.muted}
              />
            )}
          </View>

          {/* ── Stat chips ── */}
          <View style={st.exStats}>
            {[
              { val: ex.sets,              label: 'مجموعات' },
              { val: ex.reps,              label: 'تكرارات' },
              { val: `${ex.restSec} ث`,    label: 'راحة' },
              { val: `${done}/${ex.sets}`, label: 'منجز', accent: isComplete ? t.success : t.primary },
            ].map((chip, ci) => (
              <View key={ci} style={[st.exStat, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
                <Text style={[st.exStatVal, { color: chip.accent ?? t.text }]}>{chip.val}</Text>
                <Text style={[st.exStatLabel, { color: t.muted }]}>{chip.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Coach note (shown when expanded) ── */}
          {expanded && ex.coachNote && (
            <View style={[st.coachNote, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
              <View style={st.coachNoteTop}>
                <View style={[st.coachAvatar, { backgroundColor: coachColor + '22' }]}>
                  <Text style={[st.coachAvatarTxt, { color: coachColor }]}>{coachInitials}</Text>
                </View>
                <Text style={[st.coachLabel, { color: t.muted }]}>نصيحة المدرب</Text>
                <View style={[st.coachBadge, { backgroundColor: t.primary + '15' }]}>
                  <Text style={[st.coachBadgeTxt, { color: t.primary }]}>متخصص</Text>
                </View>
              </View>
              <Text style={[st.coachText, { color: t.textSub }]}>{ex.coachNote}</Text>
            </View>
          )}

        </Pressable>

        {/* ── Weight Tracker (for non-cardio exercises, any expanded card) ── */}
        {expanded && !isComplete && !CARDIO_GROUPS.includes(ex.muscleGroup) && (
          <WeightTracker
            weight={currentWeight}
            onChange={onWeightChange}
            loggedWeights={loggedWeights}
            t={t}
          />
        )}

        {/* ── Set Done CTA (outside Pressable) ── */}
        {isActive && !isComplete && (
          <SetDoneButton
            label={`مجموعة ${done + 1} من ${ex.sets} منتهية`}
            onPress={onComplete}
          />
        )}
      </Animated.View>
    </FadeSlide>
  );
}

// ─── Share Achievement Card ───────────────────────────────────────────────────
function ShareAchievementCard({
  workoutTitle, exercises, totalSets, navigation, t,
}: {
  workoutTitle: string;
  exercises: Exercise[];
  totalSets: number;
  navigation: any;
  t: ThemeTokens;
}) {
  const [caption, setCaption] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const [posted, setPosted] = useState(false);
  const xp = exercises.reduce((s, e) => s + e.sets * 10, 0);

  if (posted) {
    return (
      <View style={[sh.postedWrap, { backgroundColor: t.card, borderColor: t.line }]}>
        <Text style={{ fontSize: 40 }}>🎉</Text>
        <Text style={[sh.postedTitle, { color: t.text }]}>تم نشر إنجازك!</Text>
        <Text style={[sh.postedSub, { color: t.muted }]}>سيراه متابعوك في الفيد</Text>
        <Pressable
          style={[sh.backBtn, { backgroundColor: t.cardSoft, borderColor: t.line }]}
          onPress={() => navigation?.goBack()}
        >
          <Text style={[sh.backBtnTxt, { color: t.muted }]}>العودة للرئيسية</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[sh.card, { backgroundColor: t.card, borderColor: t.line }]}>
      {/* Header */}
      <View style={sh.cardHeader}>
        <View style={[sh.trophyCircle, { backgroundColor: '#FFD700' + '22' }]}>
          <Ionicons name="trophy" size={26} color="#B8860B" />
        </View>
        <View style={sh.cardHeaderBody}>
          <Text style={[sh.cardTitle, { color: t.text }]}>شارك إنجازك! 💪</Text>
          <Text style={[sh.cardSub, { color: t.muted }]}>{workoutTitle}</Text>
        </View>
      </View>

      {/* Stats strip */}
      <View style={[sh.statsRow, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
        {[
          { val: String(exercises.length), label: 'تمرين' },
          { val: String(totalSets),        label: 'مجموعة' },
          { val: '350',                    label: 'سعرة'   },
          { val: `+${xp}`,                 label: 'XP'     },
        ].map((s) => (
          <View key={s.label} style={sh.statCell}>
            <Text style={[sh.statVal, { color: t.primary }]}>{s.val}</Text>
            <Text style={[sh.statLbl, { color: t.muted }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Photo option */}
      <Pressable
        style={[sh.photoBtn, { borderColor: photoAdded ? t.primary : t.line, backgroundColor: photoAdded ? t.primary + '10' : t.cardSoft }]}
        onPress={() => setPhotoAdded((v) => !v)}
      >
        <Ionicons name={photoAdded ? 'checkmark-circle' : 'camera-outline'} size={18} color={photoAdded ? t.primary : t.muted} />
        <Text style={[sh.photoBtnTxt, { color: photoAdded ? t.primary : t.muted }]}>
          {photoAdded ? 'تمت إضافة الصورة ✓' : 'إضافة صورة (اختياري)'}
        </Text>
      </Pressable>

      {/* Caption input */}
      <TextInput
        style={[sh.captionInput, { backgroundColor: t.cardSoft, borderColor: t.line, color: t.text }]}
        placeholder="اكتب وصفاً أو تعليقاً..."
        placeholderTextColor={t.muted}
        value={caption}
        onChangeText={setCaption}
        multiline
        textAlign="right"
        maxLength={280}
      />
      <Text style={[sh.charCount, { color: t.muted }]}>{caption.length}/280</Text>

      {/* Post button */}
      <Pressable onPress={() => setPosted(true)}>
        <LinearGradient
          colors={[t.gradientStart, t.gradientEnd]}
          style={sh.postBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="send" size={16} color="#fff" />
          <Text style={sh.postBtnTxt}>نشر في الفيد</Text>
        </LinearGradient>
      </Pressable>

      {/* Skip */}
      <Pressable style={sh.skipRow} onPress={() => navigation?.goBack()}>
        <Text style={[sh.skipTxt, { color: t.muted }]}>تخطي — حفظ بدون نشر</Text>
      </Pressable>
    </View>
  );
}

const sh = StyleSheet.create({
  card:          { borderRadius: 20, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  cardHeader:    { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  trophyCircle:  { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardHeaderBody:{ flex: 1, alignItems: 'flex-end' },
  cardTitle:     { fontSize: 18, fontWeight: '900' },
  cardSub:       { fontSize: 12, marginTop: 2 },
  statsRow:      { flexDirection: 'row-reverse', borderRadius: 12, borderWidth: 1, marginBottom: spacing.md, overflow: 'hidden' },
  statCell:      { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal:       { fontSize: 16, fontWeight: '900' },
  statLbl:       { fontSize: 10, marginTop: 2 },
  photoBtn:      { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', padding: spacing.md, marginBottom: spacing.sm },
  photoBtnTxt:   { fontSize: 14, fontWeight: '700' },
  captionInput:  { borderRadius: 12, borderWidth: 1, padding: spacing.md, fontSize: 14, lineHeight: 22, minHeight: 80, marginBottom: 4 },
  charCount:     { fontSize: 11, textAlign: 'left', marginBottom: spacing.md },
  postBtn:       { borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: spacing.sm },
  postBtnTxt:    { color: '#fff', fontSize: 16, fontWeight: '900' },
  skipRow:       { alignItems: 'center', paddingVertical: spacing.xs },
  skipTxt:       { fontSize: 13 },
  postedWrap:    { borderRadius: 20, borderWidth: 1, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  postedTitle:   { fontSize: 22, fontWeight: '900' },
  postedSub:     { fontSize: 14 },
  backBtn:       { borderRadius: 12, borderWidth: 1, paddingHorizontal: spacing.xl, paddingVertical: 12, marginTop: spacing.sm },
  backBtnTxt:    { fontSize: 14, fontWeight: '700' },
});

// ─── Workout Screen ───────────────────────────────────────────────────────────
export function WorkoutScreen({ navigation, route }: any) {
  const { theme: t } = useTheme();

  const workoutId = route?.params?.workoutId;
  const current = workoutId
    ? weeklyWorkout.find((w) => w.id === workoutId) || weeklyWorkout[0]
    : weeklyWorkout.find((w) => !w.completed) || weeklyWorkout[0];

  const exercises: Exercise[] = current.exercises || [];

  // Look up coach for initials + color
  const coach = professionals.find(p => p.id === current.coachId);
  const coachInitials = coach?.avatarInitials ?? 'م';
  const coachColor    = coach?.avatarColor    ?? '#FF7A18';

  const [completedSets,  setCompletedSets]  = useState<Record<string, number>>({});
  const [activeExIdx,    setActiveExIdx]    = useState(0);
  const [exerciseWeights, setExerciseWeights] = useState<Record<string, number>>({});
  const [setWeightLogs,   setSetWeightLogs]   = useState<Record<string, number[]>>({});
  const [restTimer,     setRestTimer]     = useState(0);
  const [restActive,    setRestActive]    = useState(false);
  const [workoutDone,   setWorkoutDone]   = useState(false);
  const [demoExercise,  setDemoExercise]  = useState<Exercise | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (restActive && restTimer > 0) {
      restRef.current = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) { clearInterval(restRef.current!); setRestActive(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restRef.current!);
  }, [restActive]);

  const totalSets   = exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets    = Object.values(completedSets).reduce((s, v) => s + v, 0);
  const progressPct = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  const progressWidth = useSharedValue(0);
  useEffect(() => {
    progressWidth.value = withTiming(progressPct, { duration: 550, easing: Easing.out(Easing.ease) });
  }, [progressPct]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` as any }));

  const handleCompleteSet = (ex: Exercise) => {
    const done = completedSets[ex.id] || 0;
    if (done >= ex.sets) return;
    const next = done + 1;
    setCompletedSets((prev) => ({ ...prev, [ex.id]: next }));
    // Log weight for this set
    const w = exerciseWeights[ex.id] ?? 0;
    setSetWeightLogs(prev => ({ ...prev, [ex.id]: [...(prev[ex.id] ?? []), w] }));
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
  };

  const handleWeightChange = (exId: string, w: number) =>
    setExerciseWeights(prev => ({ ...prev, [exId]: w }));

  const skipRest = () => { clearInterval(restRef.current!); setRestActive(false); setRestTimer(0); };

  const intensityColor = INTENSITY_HEX[current.intensity] ?? t.primary;

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.3 : 0.07,
    shadowRadius: 10,
    elevation: 3,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.container}>

        {/* ── TOP BAR ─────────────────────────────────────── */}
        <FadeSlide delay={0}>
          <View style={st.topBar}>
            <Pressable
              style={[st.backBtn, { backgroundColor: t.cardSoft }]}
              onPress={() => navigation?.goBack()}
            >
              <Ionicons name="chevron-forward" size={20} color={t.muted} />
            </Pressable>
          </View>
        </FadeSlide>

        {/* ── GRADIENT HEADER CARD ────────────────────────── */}
        <FadeSlide delay={60}>
          <LinearGradient
            colors={['#FF4500', '#FF6800', '#FF9A00']}
            style={st.headerCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[st.intensityBadge, { backgroundColor: `${intensityColor}30`, borderColor: `${intensityColor}80` }]}>
              <Text style={[st.intensityText, { color: '#fff' }]}>
                {INTENSITY_LABELS[current.intensity]}
              </Text>
            </View>

            <Text style={st.titleDark}>{current.title}</Text>
            <Text style={st.metaDark}>{current.durationMin} دقيقة · المدرب {current.coachName}</Text>

            <View style={st.kpisRow}>
              {[
                { val: exercises.length,    label: 'تمرين'  },
                { val: totalSets,           label: 'مجموعة' },
                { val: 350,                 label: 'سعرة'   },
                { val: current.durationMin, label: 'دقيقة'  },
              ].map((k, i) => (
                <View key={i} style={st.kpi}>
                  <Text style={st.kpiVal}>{k.val}</Text>
                  <Text style={st.kpiLabel}>{k.label}</Text>
                </View>
              ))}
            </View>

            <View style={st.progressLabelRow}>
              <Text style={st.progressLabelDark}>التقدم</Text>
              <Text style={st.progressValueDark}>{doneSets} / {totalSets}</Text>
            </View>
            <View style={st.progressTrack}>
              <Animated.View style={[st.progressFill, progressStyle]} />
            </View>
          </LinearGradient>
        </FadeSlide>

        {/* ── XP REWARD ───────────────────────────────────── */}
        <FadeSlide delay={120}>
          <XpBanner xp={exercises.reduce((s, e) => s + e.sets * 10, 0)} t={t} />
        </FadeSlide>

        {/* ── REST TIMER ──────────────────────────────────── */}
        {restActive && (
          <FadeSlide delay={0}>
            <View style={[st.restBanner, { borderColor: `${t.warning}50` }]}>
              <View style={[st.restBg, { backgroundColor: t.mode === 'dark' ? '#0A0A0A' : '#111111' }]}>
                <View style={st.restHeaderRow}>
                  <Ionicons name="timer-outline" size={16} color={t.warning} />
                  <Text style={[st.restTitle, { color: t.warning }]}>راحة</Text>
                </View>
                <Text style={[st.restTimer, { color: t.warning }]}>{formatSec(restTimer)}</Text>
                <Pressable onPress={skipRest} style={st.skipBtn}>
                  <Text style={st.skipBtnText}>تخطي الراحة</Text>
                </Pressable>
              </View>
            </View>
          </FadeSlide>
        )}

        {/* ── SHARE ACHIEVEMENT (replaces static done banner) ── */}
        {workoutDone && (
          <FadeSlide delay={0}>
            <ShareAchievementCard
              workoutTitle={current.title}
              exercises={exercises}
              totalSets={totalSets}
              navigation={navigation}
              t={t}
            />
          </FadeSlide>
        )}

        {/* ── EXERCISE LIST ────────────────────────────────── */}
        <FadeSlide delay={180}>
          <View style={st.listHeader}>
            <Text style={[st.listHint, { color: t.muted }]}>اضغط لعرض التفاصيل</Text>
            <Text style={[st.sectionTitle, { color: t.text }]}>قائمة التمارين</Text>
          </View>
        </FadeSlide>

        {exercises.map((ex, i) => {
          const done       = completedSets[ex.id] || 0;
          const isActive   = i === activeExIdx && !workoutDone;
          const isComplete = done >= ex.sets;

          return (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              index={i}
              isActive={isActive}
              isComplete={isComplete}
              done={done}
              delay={220 + i * 60}
              onComplete={() => handleCompleteSet(ex)}
              onDemoPress={() => setDemoExercise(ex)}
              t={t}
              cardShadow={cardShadow}
              coachInitials={coachInitials}
              coachColor={coachColor}
              currentWeight={exerciseWeights[ex.id] ?? 0}
              onWeightChange={(w) => handleWeightChange(ex.id, w)}
              loggedWeights={setWeightLogs[ex.id] ?? []}
            />
          );
        })}

      </ScrollView>

      <ExerciseDemoModal
        exercise={demoExercise}
        onClose={() => setDemoExercise(null)}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:      { flex: 1 },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 100 },

  topBar:   { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  backBtn:  { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerCard: {
    borderRadius: 28, padding: 24, marginBottom: spacing.sm,
    shadowColor: '#FF4500', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 28, elevation: 14,
  },
  intensityBadge:    { alignSelf: 'flex-end', borderRadius: 99, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 5, marginBottom: spacing.xs },
  intensityText:     { fontSize: 12, fontWeight: '700' },
  titleDark:         { textAlign: 'right', fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 4, letterSpacing: -0.5 },
  metaDark:          { textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: spacing.md },
  kpisRow:           { flexDirection: 'row-reverse', gap: 8, marginBottom: spacing.md },
  kpi:               { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: spacing.sm, alignItems: 'center' },
  kpiVal:            { fontSize: 22, fontWeight: '800', color: '#fff' },
  kpiLabel:          { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },
  progressLabelRow:  { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 },
  progressLabelDark: { fontWeight: '700', color: 'rgba(255,255,255,0.75)', textAlign: 'right' },
  progressValueDark: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
  progressTrack:     { height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'hidden' },
  progressFill:      { height: '100%', backgroundColor: '#fff', borderRadius: 5, opacity: 0.9 },

  restBanner:    { borderRadius: 22, overflow: 'hidden', borderWidth: 1, marginBottom: spacing.md },
  restBg:        { padding: 28, alignItems: 'center' },
  restHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  restTitle:     { fontWeight: '700', fontSize: 14 },
  restTimer:     { fontSize: 68, fontWeight: '900', letterSpacing: -2, marginVertical: 4 },
  skipBtn:       { paddingHorizontal: spacing.md, paddingVertical: 8 },
  skipBtnText:   { color: 'rgba(255,255,255,0.35)', fontWeight: '600', fontSize: 13 },

  doneBanner:  { borderRadius: 22, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md },
  doneTitle:   { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 10 },
  doneSub:     { color: 'rgba(255,255,255,0.82)', marginTop: 4, fontSize: 14 },
  doneXpRow:   { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  doneXpPill:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8 },
  doneXpTxt:   { fontWeight: '800', fontSize: 14 },

  listHeader:   { flexDirection: 'row-reverse', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: spacing.sm, marginTop: spacing.xs },
  sectionTitle: { textAlign: 'right', fontSize: 20, fontWeight: '800' },
  listHint:     { fontSize: 12 },

  // ── Exercise Card ──────────────────────────────────────────────────────────
  exCard:    { borderRadius: 20, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'transparent' },
  exHeader:  { flexDirection: 'row-reverse', gap: spacing.sm, alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs },
  exLeft:    { width: 38, height: 38, borderRadius: 19, borderWidth: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 },
  exLeftFill:{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  exNumber:       { fontWeight: '800', fontSize: 15 },
  exNumberActive: { fontWeight: '900', color: '#fff', fontSize: 15 },
  exInfo:    { flex: 1, alignItems: 'flex-end' },
  exName:    { fontWeight: '800', fontSize: 16, textAlign: 'right' },
  exMuscle:  { fontSize: 12, fontWeight: '600', marginTop: 2 },

  exStats:    { flexDirection: 'row-reverse', gap: 6, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  exStat:     { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: 9, borderWidth: 1 },
  exStatVal:  { fontWeight: '700', fontSize: 14 },
  exStatLabel:{ fontSize: 10, marginTop: 2 },

  // ── Thumbnail ──────────────────────────────────────────────────────────────
  imgWrap: {
    width: '100%', height: 190, overflow: 'hidden',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  img:     { width: '100%', height: '100%' },
  imgGrad: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    justifyContent: 'flex-end', paddingHorizontal: 14, paddingBottom: 10,
  },
  demoTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  demoTxt:   { color: '#fff', fontSize: 11, fontWeight: '700' },

  // ── Coach Note ─────────────────────────────────────────────────────────────
  coachNote:    {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 14,
    padding: spacing.sm,
    borderWidth: 1,
  },
  coachNoteTop: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 8,
  },
  coachAvatar:   { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  coachAvatarTxt:{ fontSize: 11, fontWeight: '800' },
  coachLabel:    { flex: 1, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  coachBadge:    { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  coachBadgeTxt: { fontSize: 10, fontWeight: '700' },
  coachText:     { fontSize: 13, lineHeight: 21, textAlign: 'right' },

  // ── Set Done Button ────────────────────────────────────────────────────────
  setDoneBtn:     { marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: 14, overflow: 'hidden' },
  setDoneBtnGrad: { paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  setDoneBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
});
