import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from 'react-native-svg';
import {
  Activity,
  Zap,
  Flame,
  Carrot,
  Calendar,
  Camera,
  ClipboardList,
  TrendingUp,
  Menu,
} from 'lucide-react-native';
import { lightTheme as theme } from '../../constants/theme';
import { GlassCard } from '../GlassCard';
import { CrescentIcon } from '../icons/AzukaIcons';
import { Theme } from '../../constants/theme';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HomeScreenProps {
  onOpenCalendar: () => void;
  onLogSymptom: () => void;
  onLogWorkout: () => void;
  onScanFood: () => void;
  onOpenSidebar?: () => void;
}

export function HomeScreen({
  onOpenCalendar,
  onLogSymptom,
  onLogWorkout,
  onScanFood,
  onOpenSidebar,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const currentPhase = {
    name: 'Luteal',
    day: 22,
    color: '#BB8585',
    icon: CrescentIcon,
  };

  const bodyState = [
    { label: 'Energy', value: 65, color: theme.azukaExtended.forestLight, icon: Zap },
    { label: 'Fatigue', value: 45, color: theme.azuka.rose, icon: Activity },
    { label: 'Stress', value: 30, color: theme.azukaExtended.tealLight, icon: TrendingUp },
    { label: 'Inflammation', value: 40, color: theme.azukaExtended.roseLight, icon: Flame },
    { label: 'Carb Need', value: 75, color: '#83965F', icon: Carrot },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: 10 }]}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>Alicia</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={onOpenSidebar}>
            <Menu size={24} color={theme.azuka.forest} />
          </TouchableOpacity>
        </View>

        {/* Phase Status Ring Card */}
        <GlassCard style={styles.phaseCard}>
          <View style={styles.phaseHeader}>
            <View style={styles.phaseTitleRow}>
              <View style={[styles.phaseIconBox, { backgroundColor: `${currentPhase.color}20` }]}>
                <currentPhase.icon size={24} color={currentPhase.color} />
              </View>
              <View>
                <Text style={styles.phaseName}>{currentPhase.name}</Text>
                <Text style={styles.phaseDay}>Day {currentPhase.day} of cycle</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onOpenCalendar} style={styles.calendarBtn}>
              <Calendar size={20} color="#29555F" />
            </TouchableOpacity>
          </View>

          {/* Animated SVG Ring */}
          <View style={styles.ringContainer}>
            <Svg width="160" height="160" viewBox="0 0 160 160" style={styles.svgRotate}>
              {/* Background Circle */}
              <Circle
                cx="80"
                cy="80"
                r="70"
                stroke="#F1ECCE"
                strokeWidth="12"
                fill="none"
              />
              {/* Animated Progress Circle */}
              <CircularProgress size={160} strokeWidth={12} percentage={73} color={currentPhase.color} />
            </Svg>
            <View style={styles.ringTextCenter}>
              <Text style={styles.ringPercent}>73%</Text>
              <Text style={styles.ringLabel}>Optimal</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            <View style={styles.statusTag}><Text style={styles.tagText}>Light Activity</Text></View>
            <View style={styles.statusTag}><Text style={styles.tagText}>High Protein</Text></View>
          </View>
        </GlassCard>

        {/* Digital Body State */}
        <GlassCard style={styles.bodyStateCard}>
          <Text style={styles.sectionTitle}>Digital Body State</Text>
          <View style={styles.progressList}>
            {bodyState.map((item, index) => (
              <BodyStateRow key={item.label} item={item} index={index} />
            ))}
          </View>

          {/* Mini Forecast Chart */}
          <View style={styles.forecastContainer}>
            <Text style={styles.forecastLabel}>NEXT 7 DAYS FORCAST</Text>
            <View style={styles.barChart}>
              {[65, 70, 75, 80, 72, 68, 65].map((h, i) => (
                <MiniBar key={i} height={h} index={i} />
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Daily Insights */}
        <GlassCard style={styles.insightCard}>
          <Text style={styles.sectionTitle}>Daily Insight</Text>
          <View style={styles.insightContent}>
             <View style={styles.insightIconBox}>
               <Zap size={24} color="#83965F" />
             </View>
             <View style={{ flex: 1 }}>
               <Text style={styles.insightTitle}>Luteal Phase Power</Text>
               <Text style={styles.insightText}>
                 Your energy might dip slightly today. Focus on complex carbs and magnesium-rich foods to stay balanced.
               </Text>
             </View>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Specialized Internal Components ---

function CircularProgress({ size, strokeWidth, percentage, color }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const animatedValue = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    const offset = circumference - (percentage / 100) * circumference;
    Animated.timing(animatedValue, {
      toValue: offset,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <AnimatedCircle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeDasharray={`${circumference} ${circumference}`}
      strokeDashoffset={animatedValue}
      strokeLinecap="round"
    />
  );
}

function BodyStateRow({ item, index }: any) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: item.value,
      duration: 800,
      delay: index * 100,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.bodyRow}>
      <View style={styles.bodyRowHeader}>
        <View style={styles.bodyRowLabel}>
          <item.icon size={16} color={item.color} />
          <Text style={styles.bodyLabelText}>{item.label}</Text>
        </View>
        <Text style={[styles.bodyValueText, { color: item.color }]}>{item.value}%</Text>
      </View>
      <View style={styles.bodyBarTrack}>
        <Animated.View
          style={[
            styles.bodyBarFill,
            { backgroundColor: item.color, width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }) },
          ]}
        />
      </View>
    </View>
  );
}

function MiniBar({ height, index }: any) {
  const hAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(hAnim, {
      toValue: height,
      duration: 500,
      delay: 800 + (index * 50),
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.miniBar, 
        { height: hAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }
      ]} 
    />
  );
}

function QuickActionBtn({ icon: Icon, label, color, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.qaBtn}>
      <View style={[styles.qaIconCircle, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.azukaExtended.creamLight},
  scrollContent: { padding: 16, paddingBottom: 120 },
  header: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: theme.azuka.sage,
    fontFamily: 'FunnelDisplay-Regular',
  },
  userName: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.azukaExtended.forestLight,
    fontFamily: 'FunnelDisplay-Bold',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1ECCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseCard: { padding: 10, marginBottom: 10 },
  phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20},
  phaseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  phaseIconBox: { padding: 12, borderRadius: 25 },
  phaseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C3927',
    fontFamily: 'FunnelDisplay-Bold',
  },
  phaseDay: {
    fontSize: 14,
    color: '#83965F',
    fontFamily: 'FunnelDisplay-Regular',
  },
  calendarBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  svgRotate: {
    transform: [{ rotate: '-90deg' }],
  },
  ringTextCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringPercent: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.azuka.forest,
    fontFamily: 'FunnelDisplay-Bold',
  },
  ringLabel: {
    fontSize: 12,
    color: theme.azuka.sage,
    fontFamily: 'FunnelDisplay-Regular',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  statusTag: {
    backgroundColor: 'rgba(195,149,136,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: '#BB8585',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'FunnelDisplay-Bold',
  },
  bodyStateCard: { padding: 10, marginBottom: 16, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.azuka.forest, marginBottom: 20, fontFamily: 'FunnelDisplay-Bold' },
  progressList: { gap: 16 },
  bodyRow: { gap: 8 },
  bodyRowHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  bodyRowLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bodyLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C3927',
    fontFamily: 'FunnelDisplay-Regular',
  },
  bodyValueText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'FunnelDisplay-Bold',
  },
  bodyBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bodyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  forecastContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
  },
  forecastLabel: {
    fontSize: 14,
    color: theme.azuka.sage,
    marginBottom: 12,
    fontFamily: 'FunnelDisplay-SemiBold',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 64,
    gap: 4,
  },
  miniBar: {
    flex: 1,
    backgroundColor: theme.azukaExtended.tealLighter,
    borderRadius: 4,
    opacity: 0.6,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  qaBtn: {
    width: (width - 42) / 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  qaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  qaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C3927',
    fontFamily: 'FunnelDisplay-Bold',
  },
  insightCard: { padding: 10, marginTop: 16 },
  insightContent: { flexDirection: 'row', gap: 10, alignItems: 'flex-start'},
  insightIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.azuka.forest,
    fontFamily: 'FunnelDisplay-Bold',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: theme.azukaExtended.tealDark,
    lineHeight: 20,
    fontFamily: 'SpaceMono-Regular',
  },
});