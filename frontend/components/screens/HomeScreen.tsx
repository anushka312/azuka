import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from 'react-native-svg';
import {
  Activity,
  Zap,
  Flame,
  Carrot,
  Calendar,
  ClipboardList,
  TrendingUp,
  Menu,
  Moon,
} from 'lucide-react-native';
import { lightTheme as theme } from '../../constants/theme';
import { GlassCard } from '../GlassCard';
import { CrescentIcon } from '../icons/AzukaIcons';
import { API_URL } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // const insets = useSafeAreaInsets();
  
  // State for dynamic data
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [error, setError] = useState<string | null>(null);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 18) return "Good Afternoon,";
    return "Good Evening,";
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('userToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await fetch(`${API_URL}/home/dashboard`, { 
            headers,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const json = await response.json();
        if (json.success) {
            setData(json);
        } else {
            throw new Error(json.message || "Failed to load dashboard");
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
            throw new Error("Connection timed out. Please check your internet.");
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Home Fetch Error:", error);
      setError("Unable to load your personalized insights.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.azuka.sage} />
        <Text style={{ marginTop: 16, color: theme.azuka.sage, fontFamily: 'FunnelDisplay-Medium' }}>
            Analyzing your biometrics...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Activity size={48} color={theme.azuka.rose} />
        <Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: 16 }]}>
            Connection Issue
        </Text>
        <Text style={{ textAlign: 'center', color: theme.azuka.sage, marginBottom: 24, fontFamily: 'FunnelDisplay-Regular' }}>
            {error}
        </Text>
        <TouchableOpacity 
            onPress={fetchDashboardData}
            style={{ backgroundColor: theme.azuka.forest, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
            <Text style={{ color: '#FFF', fontFamily: 'FunnelDisplay-Bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallbacks if data fails
  const user = data?.user || { name: 'Alicia', cycleDay: 1, phase: 'Follicular', phaseColor: theme.azuka.teal, cycleProgress: 10 };
  const insight = data?.insight || { title: 'Welcome', text: 'Start logging to get personalized insights.' };
  
  const DEFAULT_BODY_STATE = [
      { label: 'Energy', value: 0, color: theme.azuka.teal },
      { label: 'Sleep', value: 0, color: theme.azuka.sage },
      { label: 'Stress', value: 0, color: theme.azuka.rose },
  ];
  const bodyState = (data?.bodyState && data.bodyState.length > 0) ? data.bodyState : DEFAULT_BODY_STATE;
  
  // Map backend body state to icons
  const getIcon = (label: string) => {
    switch(label) {
      case 'Energy': return Zap;
      case 'Fatigue': return Activity;
      case 'Stress': return TrendingUp;
      case 'Inflammation': return Flame;
      case 'Sleep': return Moon;
      case 'Carb Need': return Carrot;
      // Agent-driven labels
      case 'Fuel Risk': return Flame;     // Metabolic risk
      case 'Adherence': return ClipboardList; // Consistency
      case 'Motivation': return Zap;      // Drive/Energy
      default: return Activity;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: 10 }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={onOpenSidebar}>
            <Menu size={24} color={theme.azuka.forest} />
          </TouchableOpacity>
        </View>

        {/* Phase Status Ring Card */}
        <GlassCard style={styles.phaseCard}>
          <View style={styles.phaseHeader}>
            <View style={styles.phaseTitleRow}>
              <View style={[styles.phaseIconBox, { backgroundColor: `${user.phaseColor}20` }]}>
                <CrescentIcon size={24} color={user.phaseColor} />
              </View>
              <View>
                <Text style={styles.phaseName}>{user.phase}</Text>
                <Text style={styles.phaseDay}>Day {user.cycleDay} of cycle</Text>
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
                stroke="#EEEDD1"
                strokeWidth="12"
                fill="none"
              />
              {/* Animated Progress Circle */}
              <CircularProgress size={160} strokeWidth={12} percentage={user.cycleProgress} color={user.phaseColor} />
            </Svg>
            <View style={styles.ringTextCenter}>
              <Text style={styles.ringPercent}>{user.cycleProgress}%</Text>
              <Text style={styles.ringLabel}>Cycle</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            <View style={styles.statusTag}><Text style={styles.tagText}>{user.phase} Phase</Text></View>
            <View style={styles.statusTag}><Text style={styles.tagText}>High Protein</Text></View>
          </View>
        </GlassCard>

        {/* Digital Body State */}
        <GlassCard style={styles.bodyStateCard}>
          <Text style={styles.sectionTitle}>Digital Body State</Text>
          <View style={styles.progressList}>
            {bodyState.map((item: any, index: number) => (
              <BodyStateRow 
                key={item.label} 
                item={{...item, icon: getIcon(item.label)}} 
                index={index} 
              />
            ))}
          </View>

          {/* Mini Forecast Chart Removed */}
        </GlassCard>

        {/* Daily Insights */}
        <GlassCard style={styles.insightCard}>
          <Text style={styles.sectionTitle}>Daily Insight</Text>
          <View style={styles.insightContent}>
             <View style={styles.insightIconBox}>
               <Zap size={24} color="#83965F" />
             </View>
             <View style={{ flex: 1 }}>
               <Text style={styles.insightTitle}>{insight.title}</Text>
               <Text style={styles.insightText}>
                 {insight.text}
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
  }, [circumference, percentage, animatedValue]);

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
  }, [index, item.value, widthAnim]);

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

// function QuickActionBtn({ icon: Icon, label, color, onPress }: any) {
//   return (
//     <TouchableOpacity onPress={onPress} style={styles.qaBtn}>
//       <View style={[styles.qaIconCircle, { backgroundColor: `${color}20` }]}>
//         <Icon size={20} color={color} />
//       </View>
//       <Text style={styles.qaLabel}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

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