import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Circle, LatLng, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nearbyUsers } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { LiveSession, NearbyUser, SportRoute, SportType } from '../types';

const SPORT_META: Record<SportType, { label: string; icon: string }> = {
  run:   { label: 'جري', icon: 'run' },
  lift:  { label: 'رفع أثقال', icon: 'dumbbell' },
  yoga:  { label: 'يوغا', icon: 'yoga' },
  cycle: { label: 'ركوب', icon: 'bike' },
};

const DEFAULT_CENTER = { latitude: 24.7136, longitude: 46.6753 };
const MAP_DELTA = 0.025;
const EARTH_RADIUS_M = 6371000;

// ─── Mock sport routes ────────────────────────────────────────────────────────
const SPORT_ROUTES: SportRoute[] = [
  {
    id: 'r1', name: 'مسار الكورنيش الشرقي', sport: 'run',
    distKm: 5.2, elevM: 28, color: '#FF7A18', isPopular: true,
    coordinates: [
      { latitude: 24.7136, longitude: 46.6753 },
      { latitude: 24.7162, longitude: 46.6782 },
      { latitude: 24.7190, longitude: 46.6808 },
      { latitude: 24.7218, longitude: 46.6825 },
      { latitude: 24.7240, longitude: 46.6800 },
      { latitude: 24.7220, longitude: 46.6768 },
      { latitude: 24.7195, longitude: 46.6742 },
      { latitude: 24.7165, longitude: 46.6730 },
      { latitude: 24.7136, longitude: 46.6753 },
    ],
  },
  {
    id: 'r2', name: 'دراجات مسار الواحة', sport: 'cycle',
    distKm: 12.4, elevM: 42, color: '#30B36A', isPopular: true,
    coordinates: [
      { latitude: 24.7136, longitude: 46.6753 },
      { latitude: 24.7100, longitude: 46.6700 },
      { latitude: 24.7058, longitude: 46.6660 },
      { latitude: 24.7020, longitude: 46.6720 },
      { latitude: 24.7000, longitude: 46.6800 },
      { latitude: 24.7030, longitude: 46.6880 },
      { latitude: 24.7080, longitude: 46.6930 },
      { latitude: 24.7140, longitude: 46.6940 },
      { latitude: 24.7200, longitude: 46.6900 },
      { latitude: 24.7240, longitude: 46.6840 },
      { latitude: 24.7220, longitude: 46.6780 },
      { latitude: 24.7180, longitude: 46.6760 },
      { latitude: 24.7136, longitude: 46.6753 },
    ],
  },
  {
    id: 'r3', name: 'جري حديقة الملك فهد', sport: 'run',
    distKm: 3.1, elevM: 15, color: '#5E81F4',
    coordinates: [
      { latitude: 24.7136, longitude: 46.6753 },
      { latitude: 24.7148, longitude: 46.6720 },
      { latitude: 24.7168, longitude: 46.6700 },
      { latitude: 24.7185, longitude: 46.6715 },
      { latitude: 24.7180, longitude: 46.6740 },
      { latitude: 24.7162, longitude: 46.6755 },
      { latitude: 24.7136, longitude: 46.6753 },
    ],
  },
];

// ─── Mock live sessions ───────────────────────────────────────────────────────
const INITIAL_SESSIONS: LiveSession[] = [
  { id: 'ls1', userName: 'أحمد العتيبي', userInitials: 'أع', userColor: '#FF7A18', sport: 'run',
    title: 'جري صباحي — مسار الكورنيش', durationMin: 24, pace: '5:20', distanceKm: 4.5,
    participantsCount: 2, maxParticipants: 5, isJoined: false },
  { id: 'ls2', userName: 'نور الرشيد', userInitials: 'نر', userColor: '#8E5CF5', sport: 'cycle',
    title: 'دراجة مسار الواحة', durationMin: 40, distanceKm: 12.1,
    participantsCount: 4, maxParticipants: 8, isJoined: false },
  { id: 'ls3', userName: 'فهد الدوسري', userInitials: 'فد', userColor: '#30B36A', sport: 'run',
    title: 'تحدي 10 كم سريع', durationMin: 35, pace: '4:55', distanceKm: 7.2,
    participantsCount: 1, maxParticipants: 3, isJoined: false },
];

type LocStatus = 'loading' | 'granted' | 'denied';
type MapView_ = 'users' | 'routes';

function posToBearing(posX: number, posY: number): number {
  return (Math.atan2(posX - 50, -(posY - 50)) * 180) / Math.PI;
}

function destinationPoint(origin: LatLng, distanceM: number, bearingDeg: number): LatLng {
  const angularDistance = distanceM / EARTH_RADIUS_M;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (origin.latitude * Math.PI) / 180;
  const lon1 = (origin.longitude * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
  );
  return { latitude: (lat2 * 180) / Math.PI, longitude: (lon2 * 180) / Math.PI };
}

function formatCoord(deg: number, isLat: boolean) {
  const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${Math.abs(deg).toFixed(4)}°${dir}`;
}

// ─── Map with users + routes ──────────────────────────────────────────────────
function RealMap({
  users, center, primaryColor, successColor, mapRef, onUserPress,
  showRoutes, activeRoute,
}: {
  users: NearbyUser[];
  center: LatLng;
  primaryColor: string;
  successColor: string;
  mapRef: React.RefObject<MapView | null>;
  onUserPress: (u: NearbyUser) => void;
  showRoutes: boolean;
  activeRoute: string | null;
}) {
  const userPins = useMemo(() => (
    users.map((u) => ({
      user: u,
      coordinate: destinationPoint(center, u.distanceM, posToBearing(u.posX, u.posY)),
    }))
  ), [center.latitude, center.longitude, users]);

  const visibleRoutes = activeRoute
    ? SPORT_ROUTES.filter(r => r.id === activeRoute)
    : SPORT_ROUTES;

  return (
    <View style={rd.mapShell}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...center, latitudeDelta: MAP_DELTA, longitudeDelta: MAP_DELTA }}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsScale
      >
        <Circle
          center={center}
          radius={500}
          strokeColor={primaryColor + '55'}
          fillColor={primaryColor + '10'}
          strokeWidth={2}
        />
        <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[rd.youMarker, { backgroundColor: primaryColor }]}>
            <Text style={rd.youText}>أنت</Text>
          </View>
        </Marker>

        {/* Sport routes as polylines */}
        {showRoutes && visibleRoutes.map(route => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeColor={route.color}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        ))}

        {/* Nearby users */}
        {userPins.map(({ user: u, coordinate }) => (
          <Marker key={u.id} coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} onPress={() => onUserPress(u)}>
            <View style={rd.markerWrap}>
              {u.isLive && <View style={[rd.userPulse, { borderColor: successColor + '80' }]} />}
              <View style={[rd.userAvatar, { backgroundColor: '#fff', borderColor: u.color }]}>
                <Text style={[rd.userInit, { color: u.color }]}>{u.initials}</Text>
              </View>
              <View style={[rd.sportPip, { backgroundColor: u.color }]}>
                <MaterialCommunityIcons name={SPORT_META[u.sport].icon as any} size={8} color="#fff" />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

// ─── Live Session Card ────────────────────────────────────────────────────────
function LiveSessionCard({ session, onJoin, t, cardShadow }: {
  session: LiveSession;
  onJoin: () => void;
  t: any;
  cardShadow: any;
}) {
  const meta = SPORT_META[session.sport];
  const isFull = session.participantsCount >= session.maxParticipants;

  return (
    <View style={[lsc.card, { backgroundColor: t.card, borderColor: session.isJoined ? t.primary : t.line }, cardShadow]}>
      <View style={lsc.top}>
        <View style={lsc.topLeft}>
          {session.isJoined && (
            <View style={[lsc.joinedBadge, { backgroundColor: t.primary + '18' }]}>
              <Ionicons name="checkmark-circle" size={12} color={t.primary} />
              <Text style={[lsc.joinedTxt, { color: t.primary }]}>منضم</Text>
            </View>
          )}
          <View style={[lsc.livePill, { backgroundColor: '#FF4500' + '18' }]}>
            <View style={[lsc.liveDot, { backgroundColor: '#FF4500' }]} />
            <Text style={[lsc.liveTxt, { color: '#FF4500' }]}>مباشر</Text>
          </View>
        </View>
        <View style={lsc.topRight}>
          <View style={[lsc.avatar, { backgroundColor: session.userColor + '22', borderColor: session.userColor }]}>
            <Text style={[lsc.avatarTxt, { color: session.userColor }]}>{session.userInitials}</Text>
          </View>
          <Text style={[lsc.name, { color: t.text }]}>{session.userName}</Text>
        </View>
      </View>

      <Text style={[lsc.title, { color: t.text }]}>{session.title}</Text>

      <View style={lsc.statsRow}>
        <View style={[lsc.statPill, { backgroundColor: t.cardSoft }]}>
          <MaterialCommunityIcons name={meta.icon as any} size={12} color={t.muted} />
          <Text style={[lsc.statTxt, { color: t.muted }]}>{meta.label}</Text>
        </View>
        {session.distanceKm && (
          <View style={[lsc.statPill, { backgroundColor: t.cardSoft }]}>
            <Ionicons name="map-outline" size={12} color={t.muted} />
            <Text style={[lsc.statTxt, { color: t.muted }]}>{session.distanceKm} كم</Text>
          </View>
        )}
        {session.pace && (
          <View style={[lsc.statPill, { backgroundColor: t.cardSoft }]}>
            <Ionicons name="speedometer-outline" size={12} color={t.muted} />
            <Text style={[lsc.statTxt, { color: t.muted }]}>{session.pace} /كم</Text>
          </View>
        )}
        <View style={[lsc.statPill, { backgroundColor: t.cardSoft }]}>
          <Ionicons name="time-outline" size={12} color={t.muted} />
          <Text style={[lsc.statTxt, { color: t.muted }]}>{session.durationMin} د</Text>
        </View>
      </View>

      <View style={lsc.bottom}>
        <View style={lsc.participants}>
          <Ionicons name="people-outline" size={14} color={t.muted} />
          <Text style={[lsc.participantsTxt, { color: t.muted }]}>
            {session.participantsCount}/{session.maxParticipants} منضم
          </Text>
        </View>
        <Pressable
          style={[lsc.joinBtn, {
            backgroundColor: session.isJoined ? t.cardSoft : isFull ? t.cardSoft : t.primary,
            borderColor: session.isJoined ? t.line : isFull ? t.line : t.primary,
          }]}
          onPress={!isFull || session.isJoined ? onJoin : undefined}
          disabled={isFull && !session.isJoined}
        >
          <Text style={[lsc.joinBtnTxt, {
            color: session.isJoined ? t.muted : isFull ? t.muted : '#fff',
          }]}>
            {session.isJoined ? 'إلغاء الانضمام' : isFull ? 'الجلسة ممتلئة' : 'انضم إلينا'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const lsc = StyleSheet.create({
  card:         { borderRadius: 16, borderWidth: 1.5, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  top:          { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  topRight:     { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  topLeft:      { alignItems: 'flex-start', gap: 5 },
  avatar:       { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:    { fontWeight: '800', fontSize: 12 },
  name:         { fontWeight: '700', fontSize: 14 },
  livePill:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  liveDot:      { width: 6, height: 6, borderRadius: 3 },
  liveTxt:      { fontSize: 10, fontWeight: '700' },
  joinedBadge:  { flexDirection: 'row-reverse', alignItems: 'center', gap: 3, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  joinedTxt:    { fontSize: 11, fontWeight: '700' },
  title:        { fontWeight: '800', fontSize: 15, textAlign: 'right', marginBottom: spacing.sm },
  statsRow:     { flexDirection: 'row-reverse', gap: 6, flexWrap: 'wrap', marginBottom: spacing.sm },
  statPill:     { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  statTxt:      { fontSize: 11, fontWeight: '600' },
  bottom:       { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  participants: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  participantsTxt: { fontSize: 12, fontWeight: '600' },
  joinBtn:      { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: spacing.md, paddingVertical: 9 },
  joinBtnTxt:   { fontSize: 13, fontWeight: '900' },
});

// ─── Route Card ───────────────────────────────────────────────────────────────
function RouteCard({ route, isActive, onPress, t, cardShadow }: {
  route: SportRoute; isActive: boolean; onPress: () => void; t: any; cardShadow: any;
}) {
  const meta = SPORT_META[route.sport];
  return (
    <Pressable
      style={[rc.card, { backgroundColor: t.card, borderColor: isActive ? route.color : t.line }, cardShadow]}
      onPress={onPress}
    >
      <View style={[rc.colorBar, { backgroundColor: route.color }]} />
      <View style={rc.body}>
        <View style={rc.top}>
          {route.isPopular && (
            <View style={[rc.popularBadge, { backgroundColor: route.color + '18' }]}>
              <Text style={[rc.popularTxt, { color: route.color }]}>مميز</Text>
            </View>
          )}
          <View style={[rc.iconWrap, { backgroundColor: route.color + '18' }]}>
            <MaterialCommunityIcons name={meta.icon as any} size={14} color={route.color} />
          </View>
        </View>
        <Text style={[rc.name, { color: t.text }]}>{route.name}</Text>
        <View style={rc.stats}>
          <View style={[rc.stat, { backgroundColor: t.cardSoft }]}>
            <Text style={[rc.statVal, { color: t.text }]}>{route.distKm}</Text>
            <Text style={[rc.statLbl, { color: t.muted }]}>كم</Text>
          </View>
          <View style={[rc.stat, { backgroundColor: t.cardSoft }]}>
            <Text style={[rc.statVal, { color: t.text }]}>{route.elevM}</Text>
            <Text style={[rc.statLbl, { color: t.muted }]}>م ارتفاع</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
const rc = StyleSheet.create({
  card:        { flexDirection: 'row', borderRadius: 14, borderWidth: 1.5, marginHorizontal: spacing.lg, marginBottom: spacing.sm, overflow: 'hidden' },
  colorBar:    { width: 5 },
  body:        { flex: 1, padding: spacing.sm },
  top:         { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  iconWrap:    { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  popularBadge:{ borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  popularTxt:  { fontSize: 10, fontWeight: '700' },
  name:        { fontWeight: '800', fontSize: 14, textAlign: 'right', marginBottom: 6 },
  stats:       { flexDirection: 'row-reverse', gap: 6 },
  stat:        { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center' },
  statVal:     { fontSize: 14, fontWeight: '900' },
  statLbl:     { fontSize: 9, fontWeight: '600' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function MapScreen({ navigation }: any) {
  const { theme: t } = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const [filter,      setFilter]      = useState<SportType | 'all'>('all');
  const [location,    setLocation]    = useState<Location.LocationObject | null>(null);
  const [locStatus,   setLocStatus]   = useState<LocStatus>('loading');
  const [mapView,     setMapView]     = useState<MapView_>('users');
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [sessions,    setSessions]    = useState(INITIAL_SESSIONS);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocStatus('denied'); return; }
      setLocStatus('granted');
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc);
    })();
  }, []);

  const center = location
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : DEFAULT_CENTER;

  const visible = filter === 'all' ? nearbyUsers : nearbyUsers.filter(u => u.sport === filter);
  const liveCount = nearbyUsers.filter(u => u.isLive).length;

  const visibleCoordinates = useMemo(() => (
    visible.map((u) => destinationPoint(center, u.distanceM, posToBearing(u.posX, u.posY)))
  ), [center.latitude, center.longitude, visible]);

  useEffect(() => {
    const coordinates = [center, ...visibleCoordinates];
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
      animated: true,
    });
  }, [center.latitude, center.longitude, visibleCoordinates]);

  const toggleSession = (id: string) =>
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isJoined: !s.isJoined, participantsCount: s.isJoined ? s.participantsCount - 1 : s.participantsCount + 1 } : s));

  const toggleRoute = (id: string) =>
    setActiveRoute(prev => prev === id ? null : id);

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#6A5A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: t.mode === 'dark' ? 0.2 : 0.04,
    shadowRadius: 5, elevation: 1,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={st.header}>
          <View style={st.headerMeta}>
            <View style={[st.livePill, { backgroundColor: t.success + '18' }]}>
              <View style={[st.liveDot, { backgroundColor: t.success }]} />
              <Text style={[st.liveText, { color: t.success }]}>{liveCount} نشط الآن</Text>
            </View>
            {locStatus === 'loading' && <Text style={[st.coord, { color: t.muted }]}>جاري تحديد الموقع...</Text>}
            {locStatus === 'denied' && <Text style={[st.coord, { color: '#FF4444' }]}>الموقع غير مفعل</Text>}
            {locStatus === 'granted' && location && (
              <Text style={[st.coord, { color: t.muted }]}>
                {formatCoord(location.coords.latitude, true)}{' '}
                {formatCoord(location.coords.longitude, false)}
              </Text>
            )}
          </View>
          <View>
            <Text style={[st.kicker, { color: t.primary }]}>استكشف</Text>
            <Text style={[st.title, { color: t.text }]}>قريب منك</Text>
          </View>
        </View>

        {/* ── MAP VIEW TOGGLE ── */}
        <View style={[st.viewToggle, { backgroundColor: t.cardSoft }]}>
          {([
            { id: 'users', label: 'الرياضيون', icon: 'people-outline' },
            { id: 'routes', label: 'المسارات', icon: 'map-outline' },
          ] as { id: MapView_; label: string; icon: string }[]).map(v => (
            <Pressable
              key={v.id}
              style={[st.viewBtn, mapView === v.id && { backgroundColor: t.card }]}
              onPress={() => setMapView(v.id)}
            >
              <Ionicons name={v.icon as any} size={16} color={mapView === v.id ? t.primary : t.muted} />
              <Text style={[st.viewBtnTxt, { color: mapView === v.id ? t.primary : t.muted }]}>{v.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── SPORT FILTER (users mode only) ── */}
        {mapView === 'users' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterRow}>
            <Pressable
              style={[st.pill, { backgroundColor: filter === 'all' ? t.primary + '14' : t.card, borderColor: filter === 'all' ? t.primary : t.line }]}
              onPress={() => setFilter('all')}
            >
              <Text style={[st.pillTxt, { color: filter === 'all' ? t.primary : t.muted }]}>
                الكل ({nearbyUsers.length})
              </Text>
            </Pressable>
            {(Object.keys(SPORT_META) as SportType[]).map(sport => {
              const active = filter === sport;
              const meta = SPORT_META[sport];
              const cnt = nearbyUsers.filter(u => u.sport === sport).length;
              return (
                <Pressable
                  key={sport}
                  style={[st.pill, { backgroundColor: active ? t.primary + '14' : t.card, borderColor: active ? t.primary : t.line }]}
                  onPress={() => setFilter(sport)}
                >
                  <MaterialCommunityIcons name={meta.icon as any} size={13} color={active ? t.primary : t.muted} />
                  <Text style={[st.pillTxt, { color: active ? t.primary : t.muted }]}>{meta.label} ({cnt})</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* ── MAP ── */}
        <View style={st.mapSection}>
          <RealMap
            users={mapView === 'users' ? visible : []}
            center={center}
            primaryColor={t.primary}
            successColor={t.success}
            mapRef={mapRef}
            onUserPress={(u) => navigation.navigate('UserProfile', { userId: u.id, userName: u.name })}
            showRoutes={mapView === 'routes'}
            activeRoute={activeRoute}
          />
          <View style={st.privacyBadge}>
            <Ionicons name="lock-closed" size={10} color="rgba(255,255,255,0.5)" />
            <Text style={st.privacyTxt}>المواقع مبهمة 200م للخصوصية</Text>
          </View>
        </View>

        {/* ══════ USERS MODE ══════ */}
        {mapView === 'users' && (
          <>
            {/* Live sessions — Join Us */}
            <View style={st.sectionHead}>
              <Text style={[st.sectionHint, { color: t.muted }]}>{sessions.filter(s => s.isJoined).length} منضم</Text>
              <View style={st.sectionTitleRow}>
                <LinearGradient colors={[t.gradientStart, t.gradientEnd]} style={st.liveTagGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={st.liveTagTxt}>مباشر</Text>
                </LinearGradient>
                <Text style={[st.sectionTitle, { color: t.text }]}>جلسات نشطة</Text>
              </View>
            </View>

            {sessions.map(s => (
              <LiveSessionCard key={s.id} session={s} onJoin={() => toggleSession(s.id)} t={t} cardShadow={cardShadow} />
            ))}

            {/* Nearby users list */}
            <View style={[st.sectionHead, { marginTop: spacing.md }]}>
              <Text style={[st.sectionHint, { color: t.muted }]}>{visible.length} شخص</Text>
              <Text style={[st.sectionTitle, { color: t.text }]}>القريبون منك</Text>
            </View>

            {visible.map(u => {
              const meta = SPORT_META[u.sport];
              return (
                <Pressable
                  key={u.id}
                  style={[st.row, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}
                  onPress={() => navigation.navigate('UserProfile', { userId: u.id, userName: u.name })}
                >
                  <View style={st.rowRight}>
                    {u.isLive && <View style={[st.rowLive, { backgroundColor: t.success }]} />}
                    <Text style={[st.rowDist, { color: t.muted }]}>
                      {u.distanceM < 1000 ? `${u.distanceM}م` : `${(u.distanceM / 1000).toFixed(1)}كم`}
                    </Text>
                  </View>
                  <View style={st.rowMid}>
                    <Text style={[st.rowName, { color: t.text }]}>{u.name}</Text>
                    <View style={[st.badge, { backgroundColor: t.primary + '14' }]}>
                      <MaterialCommunityIcons name={meta.icon as any} size={11} color={t.primary} />
                      <Text style={[st.badgeTxt, { color: t.primary }]}>{meta.label}</Text>
                      {u.isLive && <Text style={[st.badgeTxt, { color: t.success }]}>• مباشر</Text>}
                    </View>
                  </View>
                  <View style={[st.avatar, { backgroundColor: u.color + '22', borderColor: u.color }]}>
                    <Text style={[st.avatarInit, { color: u.color }]}>{u.initials}</Text>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}

        {/* ══════ ROUTES MODE ══════ */}
        {mapView === 'routes' && (
          <>
            <View style={st.sectionHead}>
              <Text style={[st.sectionHint, { color: t.muted }]}>{SPORT_ROUTES.length} مسار</Text>
              <Text style={[st.sectionTitle, { color: t.text }]}>المسارات الرياضية</Text>
            </View>
            <View style={[st.routesHint, { backgroundColor: t.cardSoft, borderColor: t.line }]}>
              <Ionicons name="information-circle-outline" size={15} color={t.muted} />
              <Text style={[st.routesHintTxt, { color: t.muted }]}>اضغط على المسار لتمييزه على الخريطة</Text>
            </View>
            {SPORT_ROUTES.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                isActive={activeRoute === route.id}
                onPress={() => toggleRoute(route.id)}
                t={t}
                cardShadow={cardShadow}
              />
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const rd = StyleSheet.create({
  mapShell: {
    height: 340, alignSelf: 'stretch', borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE5DD',
  },
  markerWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  userPulse:  { position: 'absolute', width: 42, height: 42, borderRadius: 21, borderWidth: 2 },
  userAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  userInit:   { fontSize: 9, fontWeight: '800' },
  sportPip:   { position: 'absolute', bottom: 5, right: 5, width: 13, height: 13, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  youMarker:  {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#111', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16, shadowRadius: 4, elevation: 2,
  },
  youText: { color: '#fff', fontSize: 8, fontWeight: '900' },
});

const st = StyleSheet.create({
  safe:  { flex: 1 },
  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  headerMeta: { alignItems: 'flex-start', gap: 6, marginTop: spacing.sm },
  livePill:   { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  liveDot:    { width: 7, height: 7, borderRadius: 4 },
  liveText:   { fontSize: 12, fontWeight: '700' },
  coord:      { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  kicker:     { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' },
  title:      { fontSize: 36, fontWeight: '900', lineHeight: 40, textAlign: 'right' },

  viewToggle:  { flexDirection: 'row-reverse', borderRadius: 12, padding: 3, gap: 2, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  viewBtn:     { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, paddingVertical: 10 },
  viewBtnTxt:  { fontSize: 13, fontWeight: '700' },

  filterRow:  { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.md },
  pill:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: 9, borderRadius: 99, borderWidth: 1 },
  pillTxt:    { fontSize: 12, fontWeight: '700' },

  mapSection:   { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  privacyBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, marginTop: -42 },
  privacyTxt:   { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },

  sectionHead:     { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  sectionTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  sectionTitle:    { fontSize: 20, fontWeight: '800' },
  sectionHint:     { fontSize: 13 },
  liveTagGrad:     { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  liveTagTxt:      { color: '#fff', fontSize: 10, fontWeight: '800' },

  routesHint:    { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  routesHintTxt: { flex: 1, fontSize: 12, textAlign: 'right' },

  row:        { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.xs, padding: spacing.md, borderRadius: 14, borderWidth: 1 },
  rowRight:   { alignItems: 'center', gap: 4 },
  rowLive:    { width: 7, height: 7, borderRadius: 4 },
  rowDist:    { fontSize: 11, fontWeight: '600' },
  rowMid:     { flex: 1, alignItems: 'flex-end' },
  rowName:    { fontWeight: '700', fontSize: 15 },
  badge:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt:   { fontSize: 11, fontWeight: '700' },
  avatar:     { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarInit: { fontWeight: '800', fontSize: 15 },
});
