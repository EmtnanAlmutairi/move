import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { communities } from '../data/mockData';
import { ThemeTokens, useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { Community } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'discover' | 'joined' | 'segments';
type SegSubTab = 'starred' | 'crs' | 'top10';

// ─── Category meta ────────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { lib: 'I' | 'MC'; icon: string; label: string }> = {
  strength:  { lib: 'MC', icon: 'dumbbell',           label: 'قوة'   },
  running:   { lib: 'MC', icon: 'run',                label: 'جري'   },
  cycle:     { lib: 'MC', icon: 'bike',               label: 'دراجة' },
  nutrition: { lib: 'I',  icon: 'restaurant-outline', label: 'تغذية' },
  wellness:  { lib: 'I',  icon: 'leaf-outline',       label: 'صحة'   },
  mixed:     { lib: 'I',  icon: 'flash-outline',      label: 'متنوع' },
};

// ─── Segments mock data ───────────────────────────────────────────────────────
const SEGMENTS = [
  { id: 'sg1', name: 'تلة الكورنيش',          sport: 'run',   distKm: 1.49, elevM: 36,  gradePct: 2.3, isStarred: true,  myTime: '5:42', crTime: '4:15', myRank: 45,  crHolder: 'أحمد العتيبي' },
  { id: 'sg2', name: 'شارع الأمير محمد',       sport: 'run',   distKm: 2.58, elevM: 8,   gradePct: 0.2, isStarred: true,  myTime: '8:10', crTime: '6:52', myRank: 12,  crHolder: 'محمد الغامدي' },
  { id: 'sg3', name: 'حديقة الملك فهد',        sport: 'cycle', distKm: 0.59, elevM: 23,  gradePct: 3.9, isStarred: true,  myTime: '2:18', crTime: '1:55', myRank: 7,   crHolder: 'أنت' },
  { id: 'sg4', name: 'طريق الواحة الدائري',    sport: 'run',   distKm: 7.39, elevM: 32,  gradePct: 0.2, isStarred: false, myTime: '34:12', crTime: '28:05', myRank: 23, crHolder: 'سعود الحارثي' },
  { id: 'sg5', name: 'ممشى بحيرة العليا',      sport: 'run',   distKm: 1.30, elevM: 28,  gradePct: 2.0, isStarred: true,  myTime: '5:10', crTime: '4:38', myRank: 3,   crHolder: 'أنت' },
  { id: 'sg6', name: 'تحدي المنحدر الشمالي',   sport: 'cycle', distKm: 1.29, elevM: 20,  gradePct: 0.3, isStarred: false, myTime: '4:55', crTime: '3:44', myRank: 18,  crHolder: 'خالد الدوسري' },
  { id: 'sg7', name: 'سباق شارع التحلية',      sport: 'run',   distKm: 2.45, elevM: 3,   gradePct: 0.6, isStarred: true,  myTime: '9:20', crTime: '7:58', myRank: 9,   crHolder: 'رشيد القحطاني' },
  { id: 'sg8', name: 'حلبة الدراجات الغربية', sport: 'cycle', distKm: 0.57, elevM: 4,   gradePct: 0.7, isStarred: false, myTime: '1:45', crTime: '1:28', myRank: 31,  crHolder: 'فهد الدوسري' },
];

const LEADERBOARD_FILTERS = [
  { id: 'year',    label: 'هذا العام'           },
  { id: 'year_m',  label: 'هذا العام (رجال)'    },
  { id: 'year_f',  label: 'هذا العام (نساء)'    },
  { id: 'today',   label: 'اليوم'               },
  { id: 'follow',  label: 'المتابَعون'           },
  { id: 'age',     label: 'حسب الفئة العمرية'   },
  { id: 'weight',  label: 'حسب الوزن'           },
];

// ─── Community Card ───────────────────────────────────────────────────────────
function CommunityCard({ community, onPress }: { community: Community; onPress: () => void }) {
  const { theme: t } = useTheme();
  const meta = CATEGORY_META[community.category];
  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: t.mode === 'dark' ? 0.18 : 0.04,
    shadowRadius: 5, elevation: 1,
  };
  return (
    <Pressable style={[cc.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]} onPress={onPress}>
      <LinearGradient colors={[t.primary, t.primary]} style={cc.cover} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <View style={cc.coverRow}>
          <View style={cc.coachAvt}><Text style={cc.coachAvtTxt}>{community.coachInitials}</Text></View>
          <View style={cc.catTag}>
            {meta?.lib === 'MC'
              ? <MaterialCommunityIcons name={meta.icon as any} size={11} color="#fff" />
              : <Ionicons name={meta?.icon as any} size={11} color="#fff" />}
            <Text style={cc.catTagTxt}>{meta?.label ?? community.category}</Text>
          </View>
        </View>
        <Text style={cc.name}>{community.name}</Text>
        {community.isJoined
          ? <View style={cc.joinedBadge}><Ionicons name="checkmark" size={11} color="#fff" /><Text style={cc.joinedTxt}>منضم</Text></View>
          : community.isFree
          ? <View style={cc.freeBadge}><Text style={cc.freeTxt}>مجاني</Text></View>
          : <View style={cc.priceBadge}><Text style={cc.priceTxt}>{community.priceMonthly} ر.س/شهر</Text></View>}
      </LinearGradient>
      <View style={cc.body}>
        <View style={cc.stats}>
          <View style={cc.statRow}><Ionicons name="people-outline" size={12} color={t.muted} /><Text style={[cc.stat, { color: t.muted }]}>{community.membersCount.toLocaleString()} عضو</Text></View>
          <View style={cc.statRow}><Ionicons name="chatbubble-outline" size={12} color={t.muted} /><Text style={[cc.stat, { color: t.muted }]}>{community.postsCount.toLocaleString()} منشور</Text></View>
        </View>
        <Text style={[cc.desc, { color: t.text }]} numberOfLines={2}>{community.description}</Text>
        <View style={[cc.latest, { borderTopColor: t.line }]}>
          <View style={cc.latestLeft}>
            <View style={[cc.liveDot, { backgroundColor: t.primary }]} />
            <Text style={[cc.latestTime, { color: t.primary }]}>{community.latestPostTime}</Text>
          </View>
          <Text style={[cc.latestText, { color: t.muted }]} numberOfLines={1}>{community.latestPost}</Text>
        </View>
      </View>
    </Pressable>
  );
}
const cc = StyleSheet.create({
  card:       { borderRadius: 14, borderWidth: 1, marginBottom: spacing.md, overflow: 'hidden' },
  cover:      { padding: spacing.md, minHeight: 110 },
  coverRow:   { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  coachAvt:   { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  coachAvtTxt:{ color: '#fff', fontWeight: '800', fontSize: 12 },
  catTag:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  catTagTxt:  { color: '#fff', fontSize: 12, fontWeight: '700' },
  name:       { color: '#fff', fontWeight: '800', fontSize: 18, textAlign: 'right', marginBottom: spacing.sm },
  joinedBadge:{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  joinedTxt:  { color: '#fff', fontWeight: '700', fontSize: 12 },
  freeBadge:  { alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  freeTxt:    { color: '#fff', fontWeight: '700', fontSize: 12 },
  priceBadge: { alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  priceTxt:   { color: '#fff', fontWeight: '700', fontSize: 12 },
  body:       { padding: spacing.md },
  stats:      { flexDirection: 'row-reverse', gap: spacing.md, marginBottom: spacing.xs },
  statRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stat:       { fontSize: 12 },
  desc:       { fontSize: 13, textAlign: 'right', lineHeight: 20, marginBottom: spacing.sm },
  latest:     { borderTopWidth: 1, paddingTop: spacing.xs },
  latestLeft: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginBottom: 2 },
  liveDot:    { width: 6, height: 6, borderRadius: 3 },
  latestText: { fontSize: 12, textAlign: 'right' },
  latestTime: { fontSize: 10, fontWeight: '700' },
});

// ─── Segment Row ──────────────────────────────────────────────────────────────
function SegmentRow({ seg, t, cardShadow, subTab }: { seg: typeof SEGMENTS[0]; t: ThemeTokens; cardShadow: object; subTab: SegSubTab }) {
  const [starred, setStarred] = useState(seg.isStarred);
  const sportColor = t.primary;
  const sportIcon  = seg.sport === 'run' ? 'run' : 'bike';
  const isMyRecord = seg.crHolder === 'أنت';

  return (
    <Pressable style={[sr.row, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
      <Pressable style={sr.starBtn} onPress={() => setStarred(v => !v)}>
        <Ionicons name={starred ? 'star' : 'star-outline'} size={20} color={starred ? t.primary : t.muted} />
      </Pressable>
      <View style={sr.info}>
        <View style={sr.nameRow}>
          <View style={[sr.sportPip, { backgroundColor: sportColor + '20' }]}>
            <MaterialCommunityIcons name={sportIcon as any} size={10} color={sportColor} />
          </View>
          <Text style={[sr.name, { color: t.text }]}>{seg.name}</Text>
        </View>
        <Text style={[sr.meta, { color: t.muted }]}>{seg.distKm} كم · {seg.elevM}م · {seg.gradePct}%</Text>
        <View style={[sr.track, { backgroundColor: t.line }]}>
          <View style={[sr.fill, { width: `${Math.min((parseFloat(seg.crTime) / parseFloat(seg.myTime)) * 100, 100)}%` as any, backgroundColor: isMyRecord ? '#22C55E' : t.primary }]} />
        </View>
      </View>
      <View style={sr.times}>
        {subTab === 'starred' && (
          <>
            <Text style={[sr.myTime, { color: t.text }]}>{seg.myTime}</Text>
            <Text style={[sr.crLabel, { color: t.muted }]}>CR {seg.crTime}</Text>
          </>
        )}
        {subTab === 'crs' && (
          <>
            <View style={[sr.crownWrap, { backgroundColor: isMyRecord ? '#FFD700' + '20' : t.cardSoft }]}>
              <Text style={sr.crown}>{isMyRecord ? '👑' : '—'}</Text>
            </View>
            <Text style={[sr.crLabel, { color: isMyRecord ? '#FFD700' : t.muted }]}>
              {isMyRecord ? 'إنجازك' : seg.crHolder}
            </Text>
          </>
        )}
        {subTab === 'top10' && (
          <>
            <Text style={[sr.rankNum, { color: seg.myRank <= 3 ? t.primary : t.text }]}>#{seg.myRank}</Text>
            <Text style={[sr.crLabel, { color: t.muted }]}>من {seg.myRank + 40}</Text>
          </>
        )}
      </View>
      <Ionicons name="chevron-back" size={16} color={t.line} />
    </Pressable>
  );
}
const sr = StyleSheet.create({
  row:      { flexDirection: 'row-reverse', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: spacing.md, marginBottom: spacing.xs, gap: spacing.sm },
  starBtn:  { padding: 4 },
  info:     { flex: 1 },
  nameRow:  { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: 3 },
  sportPip: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name:     { fontWeight: '700', fontSize: 14, textAlign: 'right', flex: 1 },
  meta:     { fontSize: 11, textAlign: 'right', marginBottom: 6 },
  track:    { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill:     { height: 4, borderRadius: 2 },
  times:    { alignItems: 'center', minWidth: 64 },
  myTime:   { fontWeight: '800', fontSize: 15, textAlign: 'center' },
  crLabel:  { fontSize: 10, textAlign: 'center', marginTop: 2 },
  crownWrap:{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  crown:    { fontSize: 18 },
  rankNum:  { fontWeight: '900', fontSize: 18, textAlign: 'center' },
});

// ─── Segment Leaderboard Filters ──────────────────────────────────────────────
function SegmentLeaderboardFilters({ t, cardShadow }: { t: ThemeTokens; cardShadow: object }) {
  return (
    <View style={[slb.card, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
      <LinearGradient
        colors={[t.gradientStart, t.gradientEnd]}
        style={slb.crownBanner}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
      >
        <View style={slb.crownLeft}>
          <Text style={slb.crownTitle}>منافسات المسار</Text>
          <Text style={slb.crownSub}>تنافس على التاج مع رياضيي المنطقة</Text>
        </View>
        <Text style={slb.crownEmoji}>👑</Text>
      </LinearGradient>
      {LEADERBOARD_FILTERS.map((f, i) => (
        <Pressable key={f.id} style={[slb.filterRow, i > 0 && { borderTopWidth: 1, borderTopColor: t.line }]}>
          <Ionicons name="chevron-back" size={16} color={t.primary} />
          <Text style={[slb.filterLabel, { color: t.text }]}>{f.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const slb = StyleSheet.create({
  card:        { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: spacing.md },
  crownBanner: { padding: spacing.md, flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  crownLeft:   { flex: 1 },
  crownTitle:  { color: '#fff', fontWeight: '900', fontSize: 15, textAlign: 'right' },
  crownSub:    { color: 'rgba(255,255,255,0.75)', fontSize: 12, textAlign: 'right', marginTop: 2 },
  crownEmoji:  { fontSize: 30 },
  filterRow:   { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, paddingVertical: 16, paddingHorizontal: spacing.md },
  filterLabel: { flex: 1, fontSize: 15, fontWeight: '600', textAlign: 'right' },
});

// ─── Communities Screen ───────────────────────────────────────────────────────
export function CommunitiesScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const [activeTab,  setActiveTab]  = useState<Tab>('discover');
  const [segSubTab,  setSegSubTab]  = useState<SegSubTab>('starred');

  const joinedList = communities.filter(c => c.isJoined);
  const list       = activeTab === 'joined' ? joinedList : communities;

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: t.mode === 'dark' ? 0.18 : 0.04,
    shadowRadius: 5,
    elevation: 1,
  };

  const visibleSegments =
    segSubTab === 'starred' ? SEGMENTS.filter(s => s.isStarred) :
    segSubTab === 'crs'     ? SEGMENTS.filter(s => s.crHolder === 'أنت') :
    SEGMENTS.filter(s => s.myRank <= 10);

  const TABS: { id: Tab; label?: string; icon?: string }[] = [
    { id: 'discover', label: 'اكتشف'                      },
    { id: 'joined',   label: `منضم (${joinedList.length})` },
    { id: 'segments', icon: 'map-marker-path'              },
  ];

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={st.header}>
          <Text style={[st.title, { color: t.text }]}>المجتمعات</Text>
        </View>

        {/* ── TABS ── */}
        <View style={st.tabRow}>
          {TABS.map(tab => {
            const on = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                style={[st.tab, { backgroundColor: on ? t.primary + '14' : t.card, borderColor: on ? t.primary : t.line }]}
                onPress={() => setActiveTab(tab.id)}
              >
                {tab.icon ? (
                  <MaterialCommunityIcons name={tab.icon as any} size={16} color={on ? t.primary : t.muted} />
                ) : (
                  <Text style={[st.tabTxt, { color: on ? t.primary : t.muted }]}>{tab.label}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ══════════════ DISCOVER ══════════════ */}
        {activeTab === 'discover' && (
          <>
            {/* Hint */}
            <View style={[st.hintBanner, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
              <Ionicons name="information-circle-outline" size={15} color={t.muted} />
              <Text style={[st.hintTxt, { color: t.muted }]}>انضم لمجتمع لترى تحدياته ولوحة ترتيبه</Text>
            </View>
            {communities.map(c => (
              <CommunityCard
                key={c.id}
                community={c}
                onPress={() => navigation.navigate('CommunityDetail', { communityId: c.id })}
              />
            ))}
          </>
        )}

        {/* ══════════════ JOINED ══════════════ */}
        {activeTab === 'joined' && (
          joinedList.length === 0
            ? <View style={[st.empty, { borderColor: t.line }]}>
                <Text style={[st.emptyTxt, { color: t.muted }]}>لم تنضم لأي مجتمع بعد</Text>
              </View>
            : <>
                <View style={[st.hintBanner, { backgroundColor: t.primary + '10', borderColor: t.primary + '30' }]}>
                  <Ionicons name="trophy-outline" size={15} color={t.primary} />
                  <Text style={[st.hintTxt, { color: t.primary }]}>اضغط على المجتمع لرؤية تحدياته ولوحة الترتيب</Text>
                </View>
                {joinedList.map(c => (
                  <CommunityCard
                    key={c.id}
                    community={c}
                    onPress={() => navigation.navigate('CommunityDetail', { communityId: c.id })}
                  />
                ))}
              </>
        )}

        {/* ══════════════ SEGMENTS ══════════════ */}
        {activeTab === 'segments' && (
          <>
            <View style={st.segTabRow}>
              {([
                { id: 'starred', icon: 'star',   label: 'المحفوظة' },
                { id: 'crs',     icon: 'crown',   label: 'أرقامي'   },
                { id: 'top10',   icon: 'podium',  label: 'أفضل 10'  },
              ] as { id: SegSubTab; icon: string; label: string }[]).map(s => {
                const on = segSubTab === s.id;
                return (
                  <Pressable
                    key={s.id}
                    style={[st.segTab, { borderBottomColor: on ? t.primary : 'transparent', borderBottomWidth: 2 }]}
                    onPress={() => setSegSubTab(s.id)}
                  >
                    <MaterialCommunityIcons name={s.icon as any} size={16} color={on ? t.primary : t.muted} />
                    <Text style={[st.segTabTxt, { color: on ? t.primary : t.muted }]}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[st.segInfo, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
              <Ionicons name="information-circle-outline" size={15} color={t.muted} />
              <Text style={[st.segInfoTxt, { color: t.muted }]}>
                {segSubTab === 'starred' ? 'المسارات التي حفظتها — تظهر على الخريطة أثناء النشاط' :
                 segSubTab === 'crs'     ? 'مساراتك التي تمتلك فيها الرقم القياسي' :
                 'أفضل مساراتك — ضمن العشرة الأوائل في المنطقة'}
              </Text>
            </View>

            {visibleSegments.length === 0 ? (
              <View style={[st.empty, { borderColor: t.line }]}>
                <MaterialCommunityIcons name="map-marker-off-outline" size={32} color={t.muted} />
                <Text style={[st.emptyTxt, { color: t.muted }]}>
                  {segSubTab === 'crs'   ? 'لا تمتلك أي رقم قياسي بعد' :
                   segSubTab === 'top10' ? 'لم تدخل أفضل 10 في أي مسار' :
                   'لم تحفظ أي مسار بعد'}
                </Text>
              </View>
            ) : (
              visibleSegments.map(seg => (
                <SegmentRow key={seg.id} seg={seg} t={t} cardShadow={cardShadow} subTab={segSubTab} />
              ))
            )}

            <View style={st.secHeader}>
              <Text style={[st.secHint, { color: t.muted }]}>اختر فئة</Text>
              <Text style={[st.secTitle, { color: t.text }]}>لوحات الترتيب</Text>
            </View>
            <SegmentLeaderboardFilters t={t} cardShadow={cardShadow} />
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 110 },

  header:    { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title:     { fontSize: 28, fontWeight: '800' },

  hintBanner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: spacing.sm, marginBottom: spacing.md },
  hintTxt:    { flex: 1, fontSize: 12, textAlign: 'right', lineHeight: 18 },

  tabRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: spacing.md },
  tab:    { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  tabTxt: { fontWeight: '700', fontSize: 13 },

  segTabRow: { flexDirection: 'row-reverse', marginBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  segTab:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12 },
  segTabTxt: { fontSize: 12, fontWeight: '700' },

  segInfo:    { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: spacing.sm, marginBottom: spacing.md },
  segInfoTxt: { flex: 1, fontSize: 12, textAlign: 'right', lineHeight: 18 },

  secHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.sm },
  secTitle:  { fontSize: 18, fontWeight: '800' },
  secHint:   { fontSize: 12 },

  empty:    { borderRadius: 16, borderWidth: 1, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  emptyTxt: { fontSize: 14, fontWeight: '600' },
});
