import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { Exercise } from '../types';

const { width: W, height: H } = Dimensions.get('window');
const IMG_H = H * 0.42;

// Split coachNote into discrete steps by ". " or "—"
function parseSteps(note: string): string[] {
  return note
    .split(/\. |— |\.(?=\s*[^\d])/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter((s) => s.length > 4);
}

const STEP_ICONS = [
  'body-outline',
  'eye-outline',
  'hand-left-outline',
  'fitness-outline',
  'checkmark-circle-outline',
] as const;

const MUSCLE_COLORS: Record<string, string> = {
  صدر: '#FF5C39', ظهر: '#1A9ECC', أرجل: '#30B36A',
  كتف: '#8E5CF5', بايسبس: '#FF7A18', ترايسبس: '#F59E0B',
  كور: '#5E81F4', كارديو: '#FF4500',
};

interface Props {
  exercise: Exercise | null;
  onClose: () => void;
}

export function ExerciseDemoModal({ exercise: ex, onClose }: Props) {
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeStep, setActiveStep] = useState(0);

  // Pulsing play ring
  const ringScale   = useSharedValue(1);
  const ringOpacity = useSharedValue(0.6);

  // Step slide-in
  const stepTranslate = useSharedValue(30);
  const stepOpacity   = useSharedValue(0);

  useEffect(() => {
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 900 }),
        withTiming(1.0, { duration: 0 }),
      ),
      -1,
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 900 }),
        withTiming(0.6, { duration: 0 }),
      ),
      -1,
    );
  }, []);

  useEffect(() => {
    stepTranslate.value = 30;
    stepOpacity.value   = 0;
    stepTranslate.value = withSpring(0, { damping: 18, stiffness: 160 });
    stepOpacity.value   = withTiming(1, { duration: 220 });
  }, [activeStep]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));
  const stepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: stepTranslate.value }],
    opacity: stepOpacity.value,
  }));

  if (!ex) return null;

  const steps   = parseSteps(ex.coachNote ?? '');
  const color   = MUSCLE_COLORS[ex.muscleGroup] ?? t.primary;
  const hasNext = activeStep < steps.length - 1;
  const hasPrev = activeStep > 0;

  return (
    <Modal visible={!!ex} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[st.root, { backgroundColor: t.mode === 'dark' ? '#000' : '#0a0a0a' }]}>

        {/* ── Image hero ── */}
        <View style={st.imgWrap}>
          <Image source={{ uri: ex.thumbnail }} style={st.img} resizeMode="cover" />

          {/* Pulsing ring behind play button */}
          <Animated.View style={[st.ring, { borderColor: '#fff' }, ringStyle]} />

          {/* Play icon */}
          <View style={st.playCircle}>
            <Ionicons name="play" size={28} color="#fff" style={{ marginLeft: 3 }} />
          </View>

          {/* Top gradient + close */}
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'transparent']}
            style={st.topGrad}
          >
            <Pressable
              onPress={onClose}
              style={[st.closeBtn, { paddingTop: insets.top + 4 }]}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
          </LinearGradient>

          {/* Bottom gradient + title */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={st.bottomGrad}
          >
            <View style={[st.musclePill, { backgroundColor: color + 'CC' }]}>
              <Text style={st.muscleTxt}>{ex.muscleGroup}</Text>
            </View>
            <Text style={st.exName}>{ex.name}</Text>
            <View style={st.statsRow}>
              {[
                { icon: 'layers-outline',    val: `${ex.sets} مجموعات` },
                { icon: 'repeat-outline',    val: `${ex.reps} تكرار`   },
                { icon: 'timer-outline',     val: `${ex.restSec}ث راحة` },
              ].map((s) => (
                <View key={s.val} style={st.statChip}>
                  <Ionicons name={s.icon as any} size={13} color="rgba(255,255,255,0.7)" />
                  <Text style={st.statTxt}>{s.val}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* ── Form cues ── */}
        <View style={[st.sheet, { backgroundColor: t.background }]}>
          {/* Step progress dots */}
          <View style={st.dots}>
            {steps.map((_, i) => (
              <Pressable key={i} onPress={() => setActiveStep(i)}>
                <View
                  style={[
                    st.dot,
                    { backgroundColor: i === activeStep ? color : t.line },
                    i === activeStep && st.dotActive,
                  ]}
                />
              </Pressable>
            ))}
          </View>

          <Text style={[st.sectionLabel, { color: t.muted }]}>نصائح الأداء الصحيح</Text>

          {/* Active step card */}
          <Animated.View style={[st.stepCard, { backgroundColor: t.card, borderColor: color + '35' }, stepStyle]}>
            <View style={[st.stepNumCircle, { backgroundColor: color + '20', borderColor: color + '60' }]}>
              <Text style={[st.stepNum, { color }]}>{activeStep + 1}</Text>
            </View>
            <View style={st.stepBody}>
              <Ionicons
                name={STEP_ICONS[activeStep % STEP_ICONS.length] as any}
                size={16}
                color={color}
                style={{ marginBottom: 4 }}
              />
              <Text style={[st.stepTxt, { color: t.text }]}>
                {steps[activeStep]}
              </Text>
            </View>
          </Animated.View>

          {/* Prev / Next */}
          <View style={st.navRow}>
            <Pressable
              disabled={!hasPrev}
              onPress={() => setActiveStep((v) => v - 1)}
              style={[st.navBtn, { borderColor: t.line, opacity: hasPrev ? 1 : 0.3 }]}
            >
              <Ionicons name="chevron-forward" size={18} color={t.text} />
              <Text style={[st.navTxt, { color: t.text }]}>السابق</Text>
            </Pressable>

            <Text style={[st.stepCounter, { color: t.muted }]}>
              {activeStep + 1} / {steps.length}
            </Text>

            {hasNext ? (
              <Pressable
                onPress={() => setActiveStep((v) => v + 1)}
                style={[st.navBtn, st.navBtnPrimary, { backgroundColor: color }]}
              >
                <Text style={st.navTxtPrimary}>التالي</Text>
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </Pressable>
            ) : (
              <Pressable
                onPress={onClose}
                style={[st.navBtn, st.navBtnPrimary, { backgroundColor: color }]}
              >
                <Text style={st.navTxtPrimary}>جاهز!</Text>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </Pressable>
            )}
          </View>

          {/* All steps scroll */}
          <Text style={[st.allLabel, { color: t.muted }]}>كل النقاط دفعة واحدة</Text>
          <ScrollView style={st.allScroll} showsVerticalScrollIndicator={false}>
            {steps.map((step, i) => (
              <Pressable key={i} onPress={() => setActiveStep(i)} style={st.allRow}>
                <View style={[st.allNumBadge, { backgroundColor: i === activeStep ? color : t.cardSoft }]}>
                  <Text style={[st.allNumTxt, { color: i === activeStep ? '#fff' : t.muted }]}>{i + 1}</Text>
                </View>
                <Text style={[st.allRowTxt, { color: i === activeStep ? t.text : t.muted }]} numberOfLines={2}>
                  {step}
                </Text>
              </Pressable>
            ))}
            <View style={{ height: insets.bottom + 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  root:    { flex: 1 },

  // Image
  imgWrap:    { height: IMG_H, width: W },
  img:        { width: '100%', height: '100%' },
  topGrad:    { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  closeBtn:   { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', margin: spacing.sm },
  bottomGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, paddingBottom: spacing.lg },
  musclePill: { alignSelf: 'flex-end', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  muscleTxt:  { color: '#fff', fontSize: 11, fontWeight: '800' },
  exName:     { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'right', marginBottom: 8 },
  statsRow:   { flexDirection: 'row-reverse', gap: 8 },
  statChip:   { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  statTxt:    { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700' },

  // Play ring
  ring:       { position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignSelf: 'center', top: IMG_H / 2 - 36 },
  playCircle: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', top: IMG_H / 2 - 28, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },

  // Sheet
  sheet:       { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: spacing.lg },
  sectionLabel:{ fontSize: 11, fontWeight: '700', textAlign: 'right', marginBottom: spacing.sm },
  allLabel:    { fontSize: 11, fontWeight: '700', textAlign: 'right', marginTop: spacing.lg, marginBottom: 8 },

  // Dots
  dots:     { flexDirection: 'row-reverse', gap: 6, justifyContent: 'center', marginBottom: spacing.sm },
  dot:      { width: 7, height: 7, borderRadius: 4 },
  dotActive:{ width: 20 },

  // Step card
  stepCard:    { borderRadius: 18, borderWidth: 1.5, padding: spacing.md, flexDirection: 'row-reverse', gap: spacing.md, alignItems: 'flex-start', marginBottom: spacing.md },
  stepNumCircle:{ width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNum:     { fontSize: 20, fontWeight: '900' },
  stepBody:    { flex: 1, alignItems: 'flex-end' },
  stepTxt:     { fontSize: 15, lineHeight: 24, textAlign: 'right', fontWeight: '500' },

  // Nav
  navRow:        { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  navBtn:        { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  navBtnPrimary: { borderWidth: 0 },
  navTxt:        { fontSize: 14, fontWeight: '700' },
  navTxtPrimary: { color: '#fff', fontSize: 14, fontWeight: '800' },
  stepCounter:   { fontSize: 13, fontWeight: '600' },

  // All steps list
  allScroll: { flex: 1 },
  allRow:    { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 8 },
  allNumBadge:{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  allNumTxt: { fontSize: 12, fontWeight: '800' },
  allRowTxt: { flex: 1, fontSize: 13, lineHeight: 20, textAlign: 'right' },
});
