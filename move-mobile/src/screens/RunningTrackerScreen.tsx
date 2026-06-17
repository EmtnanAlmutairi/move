import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import MapView, { LatLng, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { runHistory } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { RunSession } from '../types';

type RunState = 'idle' | 'running' | 'paused' | 'finished';
type GoalKm = 3 | 5 | 10 | 0;
type LatLon = { lat: number; lon: number };
type Point = { x: number; y: number };

const GOALS: { km: GoalKm; label: string; icon: string }[] = [
  { km: 3,  label: '3 كم',  icon: 'walk-outline'     },
  { km: 5,  label: '5 كم',  icon: 'body-outline'     },
  { km: 10, label: '10 كم', icon: 'flame-outline'    },
  { km: 0,  label: 'حر',    icon: 'infinite-outline' },
];
const MAP_BG      = '#080C16';
const GRID_COLOR  = 'rgba(255,255,255,0.035)';
const ROUTE_COLOR = '#FF4500';
const DEFAULT_CENTER = { latitude: 24.7136, longitude: 46.6753 };
const MAP_DELTA = 0.012;

function haversineKm(la1: number, lo1: number, la2: number, lo2: number): number {
  const R = 6371;
  const dLat = ((la2 - la1) * Math.PI) / 180;
  const dLon = ((lo2 - lo1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatPace(spk: number): string {
  if (!spk || spk === Infinity || spk > 9999) return '--:--';
  const m = Math.floor(spk / 60);
  const s = Math.round(spk % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function normalizePoints(coords: LatLon[], pad = 0.14): Point[] {
  if (coords.length === 0) return [];
  if (coords.length === 1) return [{ x: 0.5, y: 0.5 }];
  const lats = coords.map(c => c.lat);
  const lons = coords.map(c => c.lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const latR = maxLat - minLat || 0.0001;
  const lonR = maxLon - minLon || 0.0001;
  const scale = 1 - pad * 2;
  return coords.map(c => ({
    x: ((c.lon - minLon) / lonR) * scale + pad,
    y: 1 - (((c.lat - minLat) / latR) * scale + pad),
  }));
}

function generateMockRoute(seed: number, loops = 1): Point[] {
  const pts: Point[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * loops;
    const r = 0.28 + Math.sin(t * 2.3 + seed * 0.4) * 0.06;
    pts.push({
      x: 0.5 + r * Math.cos(t + seed * 0.2) * 0.9,
      y: 0.5 + r * Math.sin(t + seed * 0.2) * (seed % 3 === 0 ? -0.7 : 0.7),
    });
  }
  return pts;
}

function toLatLng(coord: LatLon): LatLng {
  return { latitude: coord.lat, longitude: coord.lon };
}

function MapGrid() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <View key={`h${i}`} style={[gc.line, {
          top: `${Math.round((i / 7) * 100)}%` as any,
          left: 0, right: 0, height: StyleSheet.hairlineWidth,
        }]} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={`v${i}`} style={[gc.line, {
          left: `${Math.round((i / 6) * 100)}%` as any,
          top: 0, bottom: 0, width: StyleSheet.hairlineWidth,
        }]} />
      ))}
    </>
  );
}
const gc = StyleSheet.create({ line: { position: 'absolute', backgroundColor: GRID_COLOR } });

function RoutePolyline({ pts, cw, ch, sw = 3 }: { pts: Point[]; cw: number; ch: number; sw?: number }) {
  if (pts.length < 2) return null;
  return (
    <>
      {pts.slice(0, -1).map((p, i) => {
        const n = pts[i + 1];
        const x1 = p.x * cw, y1 = p.y * ch;
        const x2 = n.x * cw, y2 = n.y * ch;
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.5) return null;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const alpha = 0.25 + (i / pts.length) * 0.75;
        const isLast = i === pts.length - 2;
        return (
          <View key={i} style={{
            position: 'absolute',
            left: (x1 + x2) / 2 - len / 2,
            top: (y1 + y2) / 2 - sw / 2,
            width: len,
            height: isLast ? sw + 1 : sw,
            borderRadius: sw,
            backgroundColor: isLast ? '#FF7A18' : ROUTE_COLOR,
            opacity: alpha,
            transform: [{ rotate: `${angle}deg` }],
          }} />
        );
      })}
    </>
  );
}

function StartDot({ pts, cw, ch }: { pts: Point[]; cw: number; ch: number }) {
  if (!pts.length) return null;
  const p = pts[0];
  return (
    <View style={{
      position: 'absolute', left: p.x * cw - 5, top: p.y * ch - 5,
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: '#00C060', borderWidth: 2, borderColor: '#fff',
    }} />
  );
}

function CurrentDot({ pts, cw, ch, pulse }: { pts: Point[]; cw: number; ch: number; pulse: boolean }) {
  if (!pts.length) return null;
  const p = pts[pts.length - 1];
  const cx = p.x * cw, cy = p.y * ch;
  return (
    <>
      {pulse && (
        <View style={{
          position: 'absolute', left: cx - 20, top: cy - 20,
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: ROUTE_COLOR + '28',
          borderWidth: 1, borderColor: ROUTE_COLOR + '50',
        }} />
      )}
      <View style={{
        position: 'absolute', left: cx - 8, top: cy - 8,
        width: 16, height: 16, borderRadius: 8,
        backgroundColor: ROUTE_COLOR, borderWidth: 3, borderColor: '#fff',
        shadowColor: ROUTE_COLOR, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9, shadowRadius: 8, elevation: 8,
      }} />
    </>
  );
}

function MiniRouteMap({ pts, size = 76 }: { pts: Point[]; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 14, overflow: 'hidden', backgroundColor: MAP_BG }}>
      <MapGrid />
      <RoutePolyline pts={pts} cw={size} ch={size} sw={2} />
      {pts.length > 0 && (
        <View style={{
          position: 'absolute',
          left: pts[0].x * size - 3, top: pts[0].y * size - 3,
          width: 6, height: 6, borderRadius: 3, backgroundColor: '#00C060',
        }} />
      )}
      {pts.length > 1 && (
        <View style={{
          position: 'absolute',
          left: pts[pts.length - 1].x * size - 4, top: pts[pts.length - 1].y * size - 4,
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: ROUTE_COLOR, borderWidth: 1.5, borderColor: '#fff',
        }} />
      )}
    </View>
  );
}

function RouteMap({
  route, height, runState, distanceKm, primaryColor, showFinish = false,
}: {
  route: LatLon[];
  height: number;
  runState: RunState;
  distanceKm: number;
  primaryColor: string;
  showFinish?: boolean;
}) {
  const mapRef = useRef<MapView | null>(null);
  const coordinates = route.map(toLatLng);
  const center = coordinates[coordinates.length - 1] ?? DEFAULT_CENTER;

  useEffect(() => {
    if (coordinates.length >= 2) {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 42, right: 42, bottom: showFinish ? 120 : 42, left: 42 },
        animated: true,
      });
    }
  }, [coordinates.length, showFinish]);

  return (
    <View style={[st.canvas, st.routeMapCanvas, { height }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          ...center,
          latitudeDelta: MAP_DELTA,
          longitudeDelta: MAP_DELTA,
        }}
        region={coordinates.length <= 1 ? {
          ...center,
          latitudeDelta: MAP_DELTA,
          longitudeDelta: MAP_DELTA,
        } : undefined}
        showsUserLocation={!showFinish}
        showsMyLocationButton={!showFinish}
        showsCompass
        showsScale
      >
        {coordinates.length >= 2 && (
          <Polyline
            coordinates={coordinates}
            strokeColor={ROUTE_COLOR}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}
        {coordinates[0] && (
          <Marker coordinate={coordinates[0]} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={st.startMapDot} />
          </Marker>
        )}
        {center && (
          <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[st.currentMapDot, runState === 'running' && { borderColor: primaryColor }]} />
          </Marker>
        )}
      </MapView>

      <View style={st.distOverlay}>
        <Text style={st.distVal}>{distanceKm.toFixed(2)}</Text>
        <Text style={st.distUnit}>ÙƒÙ…</Text>
      </View>

      {!showFinish && (
        <View style={st.gpsBadge}>
          <View style={[st.gpsDot, runState === 'running' && st.gpsDotOn]} />
          <Text style={st.gpsText}>GPS</Text>
        </View>
      )}
    </View>
  );
}

export function RunningTrackerScreen() {
  const { theme: t } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const canvasW = screenW - spacing.lg * 2;
  const mapH = Math.round(screenW * 0.62);

  const [runState, setRunState]       = useState<RunState>('idle');
  const [elapsedSec, setElapsedSec]   = useState(0);
  const [distanceKm, setDistanceKm]   = useState(0);
  const [calories, setCalories]       = useState(0);
  const [goalKm, setGoalKm]           = useState<GoalKm>(5);
  const [history, setHistory]         = useState<RunSession[]>(runHistory);
  const [finished, setFinished]       = useState<RunSession | null>(null);
  const [routeLatLon, setRouteLatLon] = useState<LatLon[]>([]);
  const [finishedRoute, setFinishedRoute] = useState<LatLon[]>([]);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const simRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const distRef     = useRef(0);
  const elapsedRef  = useRef(0);
  const simStepRef  = useRef(0);

  const pace = distanceKm > 0.05 ? elapsedSec / distanceKm : 0;
  const normalizedRoute = normalizePoints(routeLatLon);
  const finishedRoutePoints = normalizePoints(finishedRoute);
  const progressPct = goalKm > 0 ? Math.min((distanceKm / goalKm) * 100, 100) : 0;

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const stopTracking = useCallback(async () => {
    locationSub.current?.remove();
    locationSub.current = null;
    if (simRef.current) { clearInterval(simRef.current); simRef.current = null; }
  }, []);

  useEffect(() => {
    if (runState === 'running') {
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSec(elapsedRef.current);
        setCalories(Math.round(distRef.current * 70 * 1.1));
      }, 1000);
    } else stopTimer();
    return stopTimer;
  }, [runState, stopTimer]);

  const startSim = () => {
    simStepRef.current = 0;
    simRef.current = setInterval(() => {
      simStepRef.current += 1;
      const step = simStepRef.current;
      const tt = step * 0.12;
      const lat = 24.7136 + Math.sin(tt * 0.55) * 0.0018 + Math.cos(tt * 0.28) * 0.0009;
      const lon = 46.6753 + Math.cos(tt * 0.45) * 0.0025 + Math.sin(tt * 0.35) * 0.0012;
      const coord: LatLon = { lat, lon };
      setRouteLatLon(prev => {
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          const delta = haversineKm(last.lat, last.lon, lat, lon);
          if (delta > 0 && delta < 0.5) {
            distRef.current += delta;
            setDistanceKm(parseFloat(distRef.current.toFixed(3)));
          }
        }
        return [...prev, coord];
      });
    }, 800);
  };

  const startGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { startSim(); return; }
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
      (loc) => {
        const { latitude: lat, longitude: lon } = loc.coords;
        setRouteLatLon(prev => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const delta = haversineKm(last.lat, last.lon, lat, lon);
            if (delta < 0.5) {
              distRef.current += delta;
              setDistanceKm(parseFloat(distRef.current.toFixed(3)));
            }
          }
          return [...prev, { lat, lon }];
        });
      }
    );
  };

  const handleStart = async () => {
    distRef.current = 0; elapsedRef.current = 0;
    setDistanceKm(0); setElapsedSec(0); setCalories(0);
    setRouteLatLon([]); setFinishedRoute([]);
    setRunState('running');
    await startGPS();
  };

  const handlePause = () => { setRunState('paused'); stopTracking(); };
  const handleResume = async () => { setRunState('running'); await startGPS(); };

  const handleFinish = () => {
    stopTimer(); stopTracking();
    setFinishedRoute(routeLatLon);
    const session: RunSession = {
      id: `r-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      dateLabel: 'الآن',
      durationSec: elapsedRef.current,
      distanceKm: parseFloat(distRef.current.toFixed(2)),
      avgPaceSecPerKm: distRef.current > 0.05 ? Math.round(elapsedRef.current / distRef.current) : 0,
      calories: Math.round(distRef.current * 70 * 1.1),
      avgHeartRate: 148,
      steps: Math.round(distRef.current * 1350),
    };
    setFinished(session);
    setHistory(prev => [session, ...prev]);
    setRunState('finished');
  };

  const handleReset = () => {
    setRunState('idle'); setFinished(null);
    setElapsedSec(0); setDistanceKm(0); setCalories(0);
    setRouteLatLon([]); setFinishedRoute([]);
  };

  const isLive = runState === 'running' || runState === 'paused';

  const cardShadow = {
    shadowColor: t.mode === 'dark' ? '#000' : '#8A7060',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.mode === 'dark' ? 0.25 : 0.07,
    shadowRadius: 10,
    elevation: 3,
  };

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: isLive ? MAP_BG : t.background }]}>
      <ScrollView
        contentContainerStyle={[st.scroll, isLive && st.scrollDark]}
        showsVerticalScrollIndicator={false}
      >

        {/* ════════════ IDLE ══════════════════════ */}
        {runState === 'idle' && (
          <>
            <View style={st.header}>
              <Text style={[st.title, { color: t.text }]}>الجري</Text>
            </View>

            {/* Monthly summary strip */}
            <View style={[st.monthCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
              {[
                { val: runHistory.reduce((s, r) => s + r.distanceKm, 0).toFixed(1), unit: 'كم',   lbl: 'المسافة' },
                { val: formatPace(Math.round(runHistory.reduce((s, r) => s + r.avgPaceSecPerKm, 0) / (runHistory.length || 1))), unit: 'د/كم', lbl: 'الإيقاع' },
                { val: `${runHistory.reduce((s, r) => s + r.calories, 0)}`, unit: 'سعرة', lbl: 'محروقة' },
                { val: `${runHistory.length}`,  unit: '',      lbl: 'جلسة' },
              ].map((s, i) => (
                <React.Fragment key={s.lbl}>
                  {i > 0 && <View style={[st.monthDiv, { backgroundColor: t.line }]} />}
                  <View style={st.monthStat}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                      <Text style={[st.monthVal, { color: t.text }]}>{s.val}</Text>
                      {s.unit ? <Text style={[st.monthUnit, { color: t.muted }]}>{s.unit}</Text> : null}
                    </View>
                    <Text style={[st.monthLbl, { color: t.muted }]}>{s.lbl}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* Goal chips */}
            <Text style={[st.sectionLabel, { color: t.muted }]}>هدف الجري</Text>
            <View style={st.goalRow}>
              {GOALS.map((g) => (
                <Pressable
                  key={g.km}
                  style={[
                    st.goalChip,
                    { borderColor: goalKm === g.km ? t.primary : t.line, backgroundColor: goalKm === g.km ? t.primary + '10' : t.card },
                  ]}
                  onPress={() => setGoalKm(g.km)}
                >
                  <Ionicons name={g.icon as any} size={17} color={goalKm === g.km ? t.primary : t.muted} />
                  <Text style={[st.goalChipTxt, { color: goalKm === g.km ? t.primary : t.muted }]}>{g.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Start button */}
            <Pressable onPress={handleStart} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
              <LinearGradient
                colors={[t.gradientStart, t.gradientEnd]}
                style={st.startBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <View style={st.startIcon}>
                  <Ionicons name="play" size={22} color={t.primary} />
                </View>
                <Text style={st.startBtnTxt}>ابدأ الجري</Text>
              </LinearGradient>
            </Pressable>

            {/* History */}
            {history.length > 0 && (
              <>
                <View style={st.histHeader}>
                  <Text style={[st.histCount, { color: t.muted }]}>{history.length} جلسة</Text>
                  <Text style={[st.sectionLabel, { color: t.muted }]}>السجل</Text>
                </View>

                {history.map((run, idx) => {
                  const mockPts = generateMockRoute(idx + 1, run.distanceKm > 6 ? 2 : 1);
                  const bestPace = Math.min(...history.map(r => r.avgPaceSecPerKm).filter(Boolean));
                  const isPR = run.avgPaceSecPerKm === bestPace;
                  return (
                    <View key={run.id} style={[st.histCard, { backgroundColor: t.card, borderColor: t.line }, cardShadow]}>
                      <MiniRouteMap pts={mockPts} size={80} />
                      <View style={st.histInfo}>
                        <View style={st.histTopRow}>
                          <View style={st.histStat}>
                            <Text style={[st.histStatVal, { color: t.primary }]}>{run.distanceKm}</Text>
                            <Text style={[st.histStatLbl, { color: t.muted }]}>كم</Text>
                          </View>
                          <View style={st.histStat}>
                            <Text style={[st.histStatVal, { color: t.text }]}>{formatPace(run.avgPaceSecPerKm)}</Text>
                            <Text style={[st.histStatLbl, { color: t.muted }]}>إيقاع</Text>
                          </View>
                          <View style={st.histStat}>
                            <Text style={[st.histStatVal, { color: t.text }]}>{run.calories}</Text>
                            <Text style={[st.histStatLbl, { color: t.muted }]}>سعرة</Text>
                          </View>
                        </View>
                        <View style={st.histBottomRow}>
                          {isPR && (
                            <View style={[st.prTag, { backgroundColor: t.primary + '18' }]}>
                              <Ionicons name="trophy" size={10} color={t.primary} />
                              <Text style={[st.prTagTxt, { color: t.primary }]}>رقم قياسي</Text>
                            </View>
                          )}
                          <Text style={[st.histDate, { color: t.muted }]}>{run.dateLabel} · {formatTime(run.durationSec)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* ════════════ RUNNING / PAUSED ══════════ */}
        {isLive && (
          <>
            <View style={st.runBar}>
              <Pressable style={st.runBarStop} onPress={handleFinish}>
                <Ionicons name="stop" size={18} color="#DA3D2A" />
              </Pressable>
              <View style={st.runBarCenter}>
                <View style={[st.livePip, runState === 'running' ? st.livePipOn : st.livePipPause]} />
                <Text style={st.runBarTxt}>
                  {runState === 'running' ? 'يجري الآن' : 'متوقف مؤقتاً'}
                </Text>
              </View>
              <View style={{ width: 44 }} />
            </View>

            <RouteMap
              route={routeLatLon}
              height={mapH}
              runState={runState}
              distanceKm={distanceKm}
              primaryColor={t.primary}
            />

            <View style={st.hiddenCanvas}>
              <MapGrid />
              {normalizedRoute.length >= 2 && (
                <RoutePolyline pts={normalizedRoute} cw={canvasW} ch={mapH} />
              )}
              <StartDot pts={normalizedRoute} cw={canvasW} ch={mapH} />
              <CurrentDot pts={normalizedRoute} cw={canvasW} ch={mapH} pulse={runState === 'running'} />

              <View style={st.distOverlay}>
                <Text style={st.distVal}>{distanceKm.toFixed(2)}</Text>
                <Text style={st.distUnit}>كم</Text>
              </View>

              <View style={st.compass}>
                <Text style={[st.compassN, { color: t.primary }]}>N</Text>
              </View>

              <View style={st.gpsBadge}>
                <View style={[st.gpsDot, runState === 'running' && st.gpsDotOn]} />
                <Text style={st.gpsText}>GPS</Text>
              </View>
            </View>

            <Text style={st.bigTimer}>{formatTime(elapsedSec)}</Text>

            <View style={st.statsStrip}>
              {[
                { val: formatPace(pace), lbl: 'إيقاع/كم', icon: 'speedometer-outline' },
                { val: `${calories}`,   lbl: 'سعرة',      icon: 'flame-outline'       },
                { val: `${Math.round(distanceKm * 1350).toLocaleString()}`, lbl: 'خطوة', icon: 'walk-outline' },
              ].map((s, i) => (
                <React.Fragment key={s.lbl}>
                  {i > 0 && <View style={st.stripDiv} />}
                  <View style={st.stripStat}>
                    <Ionicons name={s.icon as any} size={13} color="rgba(255,255,255,0.4)" />
                    <Text style={st.stripVal}>{s.val}</Text>
                    <Text style={st.stripLbl}>{s.lbl}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {goalKm > 0 && (
              <View style={st.progWrap}>
                <View style={st.progTrack}>
                  <LinearGradient
                    colors={[t.gradientStart, t.gradientEnd]}
                    style={[st.progFill, { width: `${progressPct}%` as any }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  />
                </View>
                <View style={st.progLabels}>
                  <Text style={[st.progPct, { color: t.primary }]}>{Math.round(progressPct)}%</Text>
                  <Text style={st.progGoal}>{distanceKm.toFixed(2)} / {goalKm} كم</Text>
                </View>
              </View>
            )}

            <View style={st.controls}>
              {runState === 'running' ? (
                <Pressable style={[st.pauseCircle, { borderColor: t.primary }]} onPress={handlePause}>
                  <Ionicons name="pause" size={34} color={t.primary} />
                </Pressable>
              ) : (
                <Pressable style={st.playWrap} onPress={handleResume}>
                  <LinearGradient
                    colors={[t.gradientStart, t.gradientEnd]}
                    style={st.playCircle}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="play" size={34} color="#fff" />
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          </>
        )}

        {/* ════════════ FINISHED ══════════════════ */}
        {runState === 'finished' && finished && (
          <>
            <View style={st.finishMapWrap}>
              <RouteMap
                route={finishedRoute}
                height={mapH + 60}
                runState={runState}
                distanceKm={finished.distanceKm}
                primaryColor={t.primary}
                showFinish
              />
            </View>

            <View style={st.hiddenCanvas}>
              <MapGrid />
              {finishedRoutePoints.length >= 2 && (
                <RoutePolyline pts={finishedRoutePoints} cw={canvasW} ch={mapH + 60} sw={4} />
              )}
              <StartDot pts={finishedRoutePoints} cw={canvasW} ch={mapH + 60} />
              <CurrentDot pts={finishedRoutePoints} cw={canvasW} ch={mapH + 60} pulse={false} />

              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.92)']}
                style={st.mapBottomGrad}
              >
                <Text style={st.mapFinDist}>
                  {finished.distanceKm.toFixed(2)}
                  <Text style={st.mapFinUnit}> كم</Text>
                </Text>
              </LinearGradient>

              <View style={st.trophyWrap}>
                <LinearGradient colors={[t.gradientStart, t.gradientEnd]} style={st.trophyGrad}>
                  <Ionicons name="trophy" size={14} color="#fff" />
                  <Text style={st.trophyTxt}>أحسنت!</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={[st.summGrid, { backgroundColor: t.card, borderColor: t.line }]}>
              {[
                { val: formatTime(finished.durationSec),         lbl: 'المدة',   icon: 'timer-outline'       },
                { val: formatPace(finished.avgPaceSecPerKm),      lbl: 'الإيقاع', icon: 'speedometer-outline' },
                { val: `${finished.calories}`,                    lbl: 'سعرة',   icon: 'flame-outline'       },
                { val: `${finished.steps.toLocaleString()}`,      lbl: 'خطوة',   icon: 'walk-outline'        },
              ].map((s) => (
                <View key={s.lbl} style={[st.summCell, { borderBottomColor: t.line }]}>
                  <Ionicons name={s.icon as any} size={18} color={t.primary} />
                  <Text style={[st.summCellVal, { color: t.text }]}>{s.val}</Text>
                  <Text style={[st.summCellLbl, { color: t.muted }]}>{s.lbl}</Text>
                </View>
              ))}
            </View>

            <Pressable onPress={handleReset} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
              <LinearGradient
                colors={[t.gradientStart, t.gradientEnd]}
                style={st.newRunBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={st.newRunBtnTxt}>جري جديد</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={[st.saveBtn, { borderColor: t.primary, backgroundColor: t.primary + '0C' }]}
              onPress={() => Alert.alert('تم الحفظ ✓', 'تم حفظ جلستك في السجل')}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={t.primary} />
              <Text style={[st.saveBtnTxt, { color: t.primary }]}>حفظ الجلسة</Text>
            </Pressable>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:       { flex: 1 },
  scroll:     { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 },
  scrollDark: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: 60 },

  header: { alignItems: 'flex-end', marginBottom: spacing.md },
  title:  { fontSize: 32, fontWeight: '900', lineHeight: 36 },

  monthCard: {
    borderRadius: 22, flexDirection: 'row-reverse',
    paddingVertical: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1,
  },
  monthStat: { flex: 1, alignItems: 'center' },
  monthDiv:  { width: 1 },
  monthVal:  { fontSize: 20, fontWeight: '900' },
  monthUnit: { fontSize: 11, fontWeight: '600' },
  monthLbl:  { fontSize: 10, marginTop: 2 },

  sectionLabel: {
    fontSize: 10, fontWeight: '800',
    letterSpacing: 2, textAlign: 'right', marginBottom: spacing.sm,
  },

  goalRow:     { flexDirection: 'row-reverse', gap: 8, marginBottom: spacing.lg },
  goalChip:    {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, gap: 5,
  },
  goalChipTxt: { fontWeight: '700', fontSize: 11 },

  startBtn: {
    borderRadius: 18, paddingVertical: 20,
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'center', gap: 14, marginBottom: spacing.xl,
  },
  startIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  startBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },

  histHeader: {
    flexDirection: 'row-reverse', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  histCount: { fontSize: 12 },
  histCard: {
    borderRadius: 20, borderWidth: 1,
    flexDirection: 'row-reverse', alignItems: 'center',
    padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md,
  },
  histInfo:      { flex: 1 },
  histTopRow:    { flexDirection: 'row-reverse', gap: spacing.md, marginBottom: spacing.xs },
  histStat:      { alignItems: 'center' },
  histStatVal:   { fontSize: 17, fontWeight: '900' },
  histStatLbl:   { fontSize: 10, marginTop: 1 },
  histBottomRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  histDate:      { fontSize: 11 },
  prTag:         { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  prTagTxt:      { fontSize: 9, fontWeight: '800' },

  // ── Run mode (always dark)
  runBar: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: spacing.sm,
  },
  runBarStop: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(218,61,42,0.15)',
    borderWidth: 1.5, borderColor: '#DA3D2A',
    alignItems: 'center', justifyContent: 'center',
  },
  runBarCenter: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  runBarTxt:    { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700' },
  livePip:      { width: 8, height: 8, borderRadius: 4 },
  livePipOn:    { backgroundColor: '#00E676' },
  livePipPause: { backgroundColor: '#FF9500' },

  canvas: {
    alignSelf: 'center', borderRadius: 22,
    backgroundColor: MAP_BG, overflow: 'hidden',
    position: 'relative', marginBottom: spacing.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  routeMapCanvas: { alignSelf: 'stretch', width: '100%' },
  finishMapWrap: { marginBottom: spacing.md },
  hiddenCanvas: { display: 'none' },
  startMapDot: {
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#00C060', borderWidth: 3, borderColor: '#fff',
  },
  currentMapDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: ROUTE_COLOR, borderWidth: 3, borderColor: '#fff',
    shadowColor: ROUTE_COLOR, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 8, elevation: 8,
  },
  distOverlay: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
    flexDirection: 'row', alignItems: 'baseline', gap: 3,
    borderWidth: 1, borderColor: 'rgba(255,69,0,0.4)',
  },
  distVal:  { color: ROUTE_COLOR, fontSize: 22, fontWeight: '900' },
  distUnit: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700' },
  compass: {
    position: 'absolute', bottom: 12, right: 12,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  compassN: { fontSize: 9, fontWeight: '900' },
  gpsBadge: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  gpsDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  gpsDotOn: { backgroundColor: '#00E676' },
  gpsText:  { color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: '700', letterSpacing: 1 },

  bigTimer: {
    textAlign: 'center', color: '#fff',
    fontSize: 68, fontWeight: '900', letterSpacing: -2,
    marginVertical: spacing.sm,
  },

  statsStrip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row-reverse',
    marginBottom: spacing.md, paddingVertical: spacing.md,
  },
  stripStat: { flex: 1, alignItems: 'center', gap: 3 },
  stripDiv:  { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  stripVal:  { color: '#fff', fontSize: 20, fontWeight: '800' },
  stripLbl:  { color: 'rgba(255,255,255,0.4)', fontSize: 10 },

  progWrap:   { marginBottom: spacing.lg },
  progTrack:  { height: 7, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progFill:   { height: '100%', borderRadius: 4 },
  progLabels: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  progPct:    { fontSize: 11, fontWeight: '800' },
  progGoal:   { color: 'rgba(255,255,255,0.35)', fontSize: 11 },

  controls:    { alignItems: 'center', marginBottom: spacing.lg },
  pauseCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  playWrap:   { width: 84, height: 84, borderRadius: 42, overflow: 'hidden' },
  playCircle: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },

  mapBottomGrad: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop: 60, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg,
    alignItems: 'flex-end',
  },
  mapFinDist: { color: '#fff', fontSize: 52, fontWeight: '900', lineHeight: 56 },
  mapFinUnit: { fontSize: 22, fontWeight: '700' },
  trophyWrap: { position: 'absolute', top: 12, right: 12 },
  trophyGrad: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  trophyTxt:  { color: '#fff', fontSize: 12, fontWeight: '800' },

  summGrid: {
    flexDirection: 'row-reverse', flexWrap: 'wrap',
    borderRadius: 22, borderWidth: 1,
    marginBottom: spacing.md, overflow: 'hidden',
  },
  summCell: {
    width: '50%', alignItems: 'center', paddingVertical: spacing.lg,
    borderBottomWidth: 1, gap: 4,
  },
  summCellVal: { fontSize: 24, fontWeight: '900' },
  summCellLbl: { fontSize: 12 },

  newRunBtn: {
    borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: spacing.sm,
  },
  newRunBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 17 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 16, paddingVertical: 14,
  },
  saveBtnTxt: { fontWeight: '800', fontSize: 15 },
});
