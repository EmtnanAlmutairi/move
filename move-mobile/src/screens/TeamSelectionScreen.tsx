import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RatingStars } from '../components/RatingStars';
import { professionals, userProfile } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { Professional } from '../types';

type RoleGroup = Professional['role'];

const ROLE_TITLES: Record<RoleGroup, string> = {
  coach:        'المدرب',
  nutritionist: 'التغذية',
  physio:       'العلاج الطبيعي',
};

const GOAL_TEAM: Record<string, Record<RoleGroup, string>> = {
  'muscle-gain': { coach: 'p1', nutritionist: 'p3', physio: 'p5' },
  'weight-loss': { coach: 'p2', nutritionist: 'p3', physio: 'p5' },
  'fitness':     { coach: 'p2', nutritionist: 'p4', physio: 'p6' },
};

export function TeamSelectionScreen({ navigation, route }: any) {
  const { theme: t } = useTheme();
  const goalId     = route?.params?.goalId ?? userProfile.goal;
  const recommended = GOAL_TEAM[goalId] ?? GOAL_TEAM['muscle-gain'];

  const [activeRole, setActiveRole] = useState<RoleGroup>('coach');
  const [selectedIds, setSelectedIds] = useState<Record<RoleGroup, string>>(recommended);

  const grouped = useMemo(() => ({
    coach:        professionals.filter((p) => p.role === 'coach'),
    nutritionist: professionals.filter((p) => p.role === 'nutritionist'),
    physio:       professionals.filter((p) => p.role === 'physio'),
  }), []);

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.2 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.container} showsVerticalScrollIndicator={false}>

        <Pressable
          style={[st.backBtn, { backgroundColor: t.cardSoft }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-forward" size={20} color={t.muted} />
        </Pressable>

        <Text style={[st.kicker, { color: t.primary }]}>فريقك الصحي</Text>
        <Text style={[st.title, { color: t.text }]}>فريقك المقترح</Text>
        <Text style={[st.subtitle, { color: t.muted }]}>تم اختيار فريقك تلقائياً بناءً على هدفك · يمكنك تغيير أي عضو في أي وقت</Text>

        {/* Assigned team strip — always dark for contrast */}
        <View style={st.assignedStrip}>
          {(['coach', 'nutritionist', 'physio'] as RoleGroup[]).map((role) => {
            const pro = professionals.find((p) => p.id === selectedIds[role]);
            if (!pro) return null;
            return (
              <View key={role} style={st.assignedMember}>
                <View style={[st.assignedAvatar, { backgroundColor: pro.avatarColor + '20', borderColor: pro.avatarColor }]}>
                  <Text style={[st.assignedInitials, { color: pro.avatarColor }]}>{pro.avatarInitials}</Text>
                </View>
                <Text style={st.assignedRole}>{ROLE_TITLES[role]}</Text>
                <Text style={st.assignedName} numberOfLines={1}>{pro.name.split(' ')[0]}</Text>
              </View>
            );
          })}
        </View>

        <Text style={[st.browseHint, { color: t.muted }]}>استعرض واستبدل أعضاء الفريق</Text>

        {/* Role tabs */}
        <View style={st.roleTabs}>
          {(['coach', 'nutritionist', 'physio'] as RoleGroup[]).map((role) => (
            <Pressable
              key={role}
              style={[
                st.roleTab,
                { backgroundColor: activeRole === role ? t.cardSoft : t.card, borderColor: activeRole === role ? t.primary : t.line },
              ]}
              onPress={() => setActiveRole(role)}
            >
              <Text style={[st.roleTabTxt, { color: activeRole === role ? t.primary : t.muted }]}>
                {ROLE_TITLES[role]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Professional cards */}
        {grouped[activeRole].map((pro) => {
          const isSelected    = pro.id === selectedIds[activeRole];
          const isRecommended = pro.id === recommended[activeRole];
          return (
            <View
              key={pro.id}
              style={[
                st.card,
                { backgroundColor: isSelected ? t.primary + '08' : t.card, borderColor: isSelected ? t.primary : t.line },
                cardShadow,
              ]}
            >
              <View style={st.cardHeader}>
                <View style={[st.avatar, { backgroundColor: pro.avatarColor + '18', borderColor: pro.avatarColor }]}>
                  <Text style={[st.avatarTxt, { color: pro.avatarColor }]}>{pro.avatarInitials}</Text>
                </View>
                <View style={st.cardBody}>
                  <View style={st.nameRow}>
                    {isRecommended && (
                      <View style={[st.recBadge, { backgroundColor: t.success + '18', borderColor: t.success + '40' }]}>
                        <Text style={[st.recBadgeTxt, { color: t.success }]}>مقترح لهدفك ✓</Text>
                      </View>
                    )}
                    {!isRecommended && pro.badge ? (
                      <View style={[st.badge, { backgroundColor: t.cardSoft }]}>
                        <Text style={[st.badgeTxt, { color: t.primary }]}>{pro.badge}</Text>
                      </View>
                    ) : null}
                    <Text style={[st.name, { color: t.text }]}>{pro.name}</Text>
                  </View>
                  <Text style={[st.specialization, { color: t.primary }]}>{pro.specialization}</Text>
                  <Text style={[st.bio, { color: t.muted }]} numberOfLines={2}>{pro.bio}</Text>
                </View>
              </View>

              <View style={st.ratingRow}>
                <RatingStars rating={pro.rating} reviewsCount={pro.reviewsCount} size="sm" />
              </View>

              <View style={st.statsRow}>
                {[
                  { val: pro.yearsExp,        lbl: 'سنوات' },
                  { val: pro.videos.length,   lbl: 'فيديو'  },
                  { val: pro.pricePerMonth,   lbl: 'ر.س/شهر' },
                ].map((s, i) => (
                  <View key={i} style={[st.statCard, { backgroundColor: t.cardSoft }]}>
                    <Text style={[st.statVal, { color: t.text }]}>{s.val}</Text>
                    <Text style={[st.statLbl, { color: t.muted }]}>{s.lbl}</Text>
                  </View>
                ))}
              </View>

              <View style={st.actionsRow}>
                <Pressable
                  style={[
                    st.selectWrap,
                    isSelected && { backgroundColor: t.cardSoft, borderWidth: 1.5, borderColor: t.success, paddingVertical: 13 },
                  ]}
                  onPress={() => setSelectedIds((prev) => ({ ...prev, [activeRole]: pro.id }))}
                >
                  {isSelected ? (
                    <Text style={[st.selectTxtDone, { color: t.success }]}>✓ مختار</Text>
                  ) : (
                    <LinearGradient
                      colors={[t.gradientStart, t.gradientEnd]}
                      style={st.selectGrad}
                      start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}
                    >
                      <Text style={st.selectTxt}>اختيار</Text>
                    </LinearGradient>
                  )}
                </Pressable>
                <Pressable
                  style={[st.detailsBtn, { borderColor: t.line }]}
                  onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: pro.id })}
                >
                  <Text style={[st.detailsBtnTxt, { color: t.text }]}>عرض الملف</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:      { flex: 1 },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
  backBtn:   { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  kicker:    { textAlign: 'right', fontWeight: '700', marginBottom: spacing.xs },
  title:     { textAlign: 'right', fontSize: 30, fontWeight: '900' },
  subtitle:  { textAlign: 'right', lineHeight: 20, marginTop: spacing.xs, marginBottom: spacing.md },

  assignedStrip: {
    flexDirection: 'row-reverse', backgroundColor: '#111111',
    borderRadius: 20, padding: spacing.md, marginBottom: spacing.md, gap: 4,
  },
  assignedMember:   { flex: 1, alignItems: 'center', gap: 4 },
  assignedAvatar:   { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  assignedInitials: { fontWeight: '900', fontSize: 16 },
  assignedRole:     { color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: '600' },
  assignedName:     { color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center' },

  browseHint: { textAlign: 'right', fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },

  roleTabs:  { flexDirection: 'row-reverse', gap: 8, marginBottom: spacing.md },
  roleTab:   { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  roleTabTxt:{ fontWeight: '700', fontSize: 13 },

  card:       { borderRadius: 22, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row-reverse', gap: spacing.sm },
  avatar:     { width: 58, height: 58, borderRadius: 29, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:  { fontWeight: '800', fontSize: 18 },
  cardBody:   { flex: 1, alignItems: 'flex-end' },
  nameRow:    { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 4 },
  recBadge:   { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  recBadgeTxt:{ fontSize: 11, fontWeight: '700' },
  badge:      { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt:   { fontSize: 11, fontWeight: '700' },
  name:       { fontSize: 18, fontWeight: '800' },
  specialization: { fontSize: 13, fontWeight: '700' },
  bio:        { textAlign: 'right', lineHeight: 19, marginTop: 6 },

  statsRow:   { flexDirection: 'row-reverse', gap: 8, marginTop: spacing.md },
  statCard:   { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  statVal:    { fontSize: 18, fontWeight: '800' },
  statLbl:    { fontSize: 11, marginTop: 3 },
  ratingRow:  { marginTop: 6, alignItems: 'flex-end' },

  actionsRow: { flexDirection: 'row-reverse', gap: 10, marginTop: spacing.md },
  selectWrap: { flex: 1, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  selectGrad: { width: '100%', paddingVertical: 13, alignItems: 'center', borderRadius: 18 },
  selectTxt:  { color: '#fff', fontWeight: '800' },
  selectTxtDone: { fontWeight: '800' },
  detailsBtn: { flex: 1, borderRadius: 18, borderWidth: 1, paddingVertical: 13, alignItems: 'center' },
  detailsBtnTxt: { fontWeight: '700' },
});
