import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RatingStars } from '../components/RatingStars';
import { professionals, userProfile } from '../data/mockData';
import { colors, radius, shadows, spacing } from '../theme/tokens';
import { Professional } from '../types';

type RoleGroup = Professional['role'];

const ROLE_TITLES: Record<RoleGroup, string> = {
  coach: 'المدرب',
  nutritionist: 'أخصائي التغذية',
  physio: 'العلاج الطبيعي'
};

export function TeamSelectionScreen({ navigation }: any) {
  const [activeRole, setActiveRole] = useState<RoleGroup>('coach');
  const [selectedIds, setSelectedIds] = useState<Record<RoleGroup, string>>({
    coach: userProfile.selectedCoachId,
    nutritionist: userProfile.selectedNutritionistId,
    physio: userProfile.selectedPhysioId
  });

  const grouped = useMemo(
    () => ({
      coach: professionals.filter((item) => item.role === 'coach'),
      nutritionist: professionals.filter((item) => item.role === 'nutritionist'),
      physio: professionals.filter((item) => item.role === 'physio')
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>→ رجوع</Text>
        </Pressable>

        <Text style={styles.kicker}>فريقك الصحي</Text>
        <Text style={styles.title}>اختر المختص المناسب</Text>
        <Text style={styles.subtitle}>بدل أعضاء فريقك حسب هدفك، ميزانيتك، وأسلوب المتابعة الذي تفضله.</Text>

        <View style={styles.roleTabs}>
          {(['coach', 'nutritionist', 'physio'] as RoleGroup[]).map((role) => (
            <Pressable
              key={role}
              style={[styles.roleTab, activeRole === role && styles.roleTabActive]}
              onPress={() => setActiveRole(role)}
            >
              <Text style={[styles.roleTabText, activeRole === role && styles.roleTabTextActive]}>
                {ROLE_TITLES[role]}
              </Text>
            </Pressable>
          ))}
        </View>

        {grouped[activeRole].map((professional) => {
          const isSelected = professional.id === selectedIds[activeRole];
          return (
            <View key={professional.id} style={[styles.card, isSelected && styles.cardSelected]}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: `${professional.avatarColor}18`, borderColor: professional.avatarColor }]}>
                  <Text style={[styles.avatarText, { color: professional.avatarColor }]}>{professional.avatarInitials}</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.nameRow}>
                    {professional.badge ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{professional.badge}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.name}>{professional.name}</Text>
                  </View>
                  <Text style={styles.specialization}>{professional.specialization}</Text>
                  <Text style={styles.bio} numberOfLines={2}>
                    {professional.bio}
                  </Text>
                </View>
              </View>

              <View style={styles.ratingRow}>
                <RatingStars rating={professional.rating} reviewsCount={professional.reviewsCount} size="sm" />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{professional.yearsExp}</Text>
                  <Text style={styles.statLabel}>سنوات</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{professional.videos.length}</Text>
                  <Text style={styles.statLabel}>فيديو</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{professional.pricePerMonth}</Text>
                  <Text style={styles.statLabel}>ر.س/شهر</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  style={[styles.selectBtnWrap, isSelected && styles.selectBtnWrapSelected]}
                  onPress={() =>
                    setSelectedIds((prev) => ({
                      ...prev,
                      [activeRole]: professional.id
                    }))
                  }
                >
                  {isSelected ? (
                    <Text style={styles.selectBtnTextSelected}>✓ مختار</Text>
                  ) : (
                    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.selectGrad} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
                      <Text style={styles.selectBtnText}>اختيار</Text>
                    </LinearGradient>
                  )}
                </Pressable>
                <Pressable
                  style={styles.detailsBtn}
                  onPress={() => navigation.navigate('ProfessionalProfile', { professionalId: professional.id })}
                >
                  <Text style={styles.detailsBtnText}>عرض الملف</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
  backBtn: { alignItems: 'flex-end', marginBottom: spacing.sm },
  backText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  kicker: { textAlign: 'right', color: colors.primary, fontWeight: '700', marginBottom: spacing.xs },
  title: { textAlign: 'right', fontSize: 30, fontWeight: '900', color: colors.text },
  subtitle: { textAlign: 'right', color: colors.muted, lineHeight: 20, marginTop: spacing.xs, marginBottom: spacing.md },
  roleTabs: { flexDirection: 'row-reverse', gap: 8, marginBottom: spacing.md },
  roleTab: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center'
  },
  roleTabActive: { backgroundColor: colors.cardSoft, borderColor: colors.primary },
  roleTabText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  roleTabTextActive: { color: colors.primary },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF9F6'
  },
  cardHeader: { flexDirection: 'row-reverse', gap: spacing.sm },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: { fontWeight: '800', fontSize: 18 },
  cardBody: { flex: 1, alignItems: 'flex-end' },
  nameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 4 },
  badge: { backgroundColor: colors.cardSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  name: { color: colors.text, fontSize: 18, fontWeight: '800' },
  specialization: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  bio: { color: colors.muted, textAlign: 'right', lineHeight: 19, marginTop: 6 },
  statsRow: { flexDirection: 'row-reverse', gap: 8, marginTop: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center'
  },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 3 },
  ratingRow: { marginTop: 6, alignItems: 'flex-end' },
  actionsRow: { flexDirection: 'row-reverse', gap: 10, marginTop: spacing.md },
  selectBtnWrap: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectBtnWrapSelected: {
    backgroundColor: colors.cardSoft,
    borderWidth: 1.5,
    borderColor: colors.success,
    paddingVertical: 13
  },
  selectGrad: { width: '100%', paddingVertical: 13, alignItems: 'center', borderRadius: radius.lg },
  selectBtnText: { color: '#fff', fontWeight: '800' },
  selectBtnTextSelected: { color: colors.success, fontWeight: '800' },
  detailsBtn: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 13,
    alignItems: 'center'
  },
  detailsBtnText: { color: colors.text, fontWeight: '700' }
});
