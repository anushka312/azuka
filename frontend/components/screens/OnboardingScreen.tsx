import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { ChevronRight, ChevronLeft, Plus, Minus, Check, Calendar, Clock, Target, Award, User, Hash } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../GlassCard';
import { lightTheme as theme } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const STEP_COLORS = [
  theme.azuka.rose,   
  theme.azuka.teal,   
  theme.azuka.sage,   
  theme.azukaExtended.roseLight, 
  theme.azuka.forest, 
  theme.azukaExtended.tealLight, 
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  // Resetting logic to use sequential 0-5 mapping
  const [step, setStep] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.96)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const [data, setData] = useState({
    name: '',
    age: '',
    cycleLength: '28',
    lastPeriod: new Date(),
    goals: [] as string[],
    trainingLevel: '',
  });

  useEffect(() => {
    if (!isSuccess) {
      contentFade.setValue(0);
      contentScale.setValue(0.96);
      Animated.parallel([
        Animated.spring(contentFade, { toValue: 1, useNativeDriver: true, tension: 50, friction: 9 }),
        Animated.spring(contentScale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 9 }),
        Animated.timing(bgAnim, { toValue: step, duration: 800, useNativeDriver: true })
      ]).start();
    }
  }, [step, isSuccess]);

  const activeColor = STEP_COLORS[step] || theme.azuka.forest;

  const isStepValid = () => {
    // Sequential validation for steps 0 through 5
    switch(step) {
      case 0: return data.name.trim().length > 0 && data.age.trim().length > 0;
      case 1: return parseInt(data.cycleLength) >= 21;
      case 2: return data.lastPeriod <= new Date();
      case 3: return data.goals.length > 0;
      case 4: return data.trainingLevel !== '';
      case 5: return true; // Summary step is always valid
      default: return true;
    }
  };
  
  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  };

  const handleNext = () => {
    if (!isStepValid()) return;
    
    if (step === 5) { // Final step is now 5
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      setIsSuccess(true);
      Animated.sequence([
        Animated.timing(contentFade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.spring(successScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true })
      ]).start(() => {
        setTimeout(onComplete, 1200);
      });
    } else {
      triggerHaptic();
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    triggerHaptic();
    if (step > 0) setStep(step - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.blob, styles.blob1, { backgroundColor: activeColor, transform: [{ translateY: bgAnim.interpolate({ inputRange: [0, 5], outputRange: [0, 120] }) }] }]} />
      <Animated.View style={[styles.blob, styles.blob2, { backgroundColor: STEP_COLORS[(step + 1) % 6], transform: [{ translateX: bgAnim.interpolate({ inputRange: [0, 5], outputRange: [0, -60] }) }] }]} />

      {!isSuccess ? (
        <>
          <View style={styles.header}>
            <View style={styles.stepIndicator}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={[styles.dot, { backgroundColor: i === step ? activeColor : 'rgba(0,0,0,0.05)', width: i === step ? 16 : 6 }]} />
              ))}
            </View>
          </View>

          <Animated.View style={[styles.main, { opacity: contentFade, transform: [{ scale: contentScale }] }]}>
            <View style={styles.cardContainer}>
              <GlassCard style={styles.glass}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  
                  {step === 0 && (
                    <View style={styles.stepContainer}>
                      <View style={styles.headerGap}>
                        <Text style={[styles.title, { color: activeColor }]}>The Basics</Text>
                        <Text style={styles.subtitle}>Azuka personalizes your metabolic logic based on your age and activity.</Text>
                      </View>
                      <View style={styles.enhancedInputCard}>
                        <View style={styles.labelRow}>
                          <Text style={styles.inputLabel}>YOUR IDENTITY</Text>
                          <User size={14} color={activeColor} />
                        </View>
                        <TextInput 
                          style={styles.input} 
                          placeholder="First Name" 
                          value={data.name} 
                          onChangeText={t => setData({...data, name: t})} 
                        />
                        <View style={[styles.labelRow, { marginTop: 20 }]}>
                          <Text style={styles.inputLabel}>AGE</Text>
                          <Hash size={14} color={activeColor} />
                        </View>
                        <TextInput 
                          style={styles.input} 
                          placeholder="Age" 
                          keyboardType="numeric" 
                          value={data.age} 
                          onChangeText={t => setData({...data, age: t})} 
                        />
                      </View>
                    </View>
                  )}

                  {step === 1 && (
                    <View style={styles.stepContainer}>
                      <View style={styles.headerGap}>
                        <Text style={[styles.title, { color: activeColor }]}>Cycle Rhythm</Text>
                        <Text style={styles.subtitle}>Average days between your periods. Most women fluctuate between 21–35 days.</Text>
                      </View>
                      <View style={styles.enhancedDateCard}>
                        <View style={styles.labelRow}>
                          <Text style={styles.inputLabel}>AVERAGE DURATION</Text>
                          <Clock size={14} color={activeColor} />
                        </View>
                        <View style={styles.stepperRow}>
                          <TouchableOpacity style={styles.stepBtn} onPress={() => { triggerHaptic(); setData({...data, cycleLength: (Math.max(21, parseInt(data.cycleLength)-1)).toString()}) }}>
                            <Minus size={20} color={activeColor} />
                          </TouchableOpacity>
                          <View style={styles.cycleDisplay}>
                            <Text style={[styles.cycleValue, { color: activeColor }]}>{data.cycleLength}</Text>
                            <Text style={styles.cycleUnit}>Days</Text>
                          </View>
                          <TouchableOpacity style={styles.stepBtn} onPress={() => { triggerHaptic(); setData({...data, cycleLength: (Math.min(45, parseInt(data.cycleLength)+1)).toString()}) }}>
                            <Plus size={20} color={activeColor} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}

                  {step === 2 && (
                    <View style={styles.stepContainer}>
                      <View style={styles.headerGap}>
                        <Text style={[styles.title, { color: activeColor }]}>Cycle Baseline</Text>
                        <Text style={styles.subtitle}>Select the start date of your last period to sync your biological clock.</Text>
                      </View>
                      <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.9} style={styles.enhancedDateCard}>
                        <View style={styles.labelRow}>
                          <Text style={styles.inputLabel}>LAST PERIOD START DATE</Text>
                          <Calendar size={14} color={activeColor} />
                        </View>
                        <Text style={styles.largeDateDisplay}>
                          {data.lastPeriod.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Text>
                        <Text style={styles.helperText}>Tap to adjust</Text>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <View style={styles.pickerWrapper}>
                          <DateTimePicker 
                            value={data.lastPeriod} mode="date" 
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
                            maximumDate={new Date()}
                            onChange={(e, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setData({...data, lastPeriod: d}); }} 
                          />
                        </View>
                      )}
                    </View>
                  )}

                  {step === 3 && (
                    <View style={styles.stepContainer}>
                      <View style={styles.headerGap}>
                        <Text style={[styles.title, { color: activeColor }]}>Primary Focus</Text>
                        <Text style={styles.subtitle}>Select what you want Azuka to optimize for first. (Pick at least one)</Text>
                      </View>
                      <View style={styles.goalGrid}>
                        {['Energy', 'Sleep', 'Hormones', 'Muscle', 'Mood', 'Stress'].map((goal) => {
                          const sel = data.goals.includes(goal);
                          return (
                            <TouchableOpacity key={goal} onPress={() => { triggerHaptic(); setData(prev => ({...prev, goals: sel ? prev.goals.filter(g => g !== goal) : [...prev.goals, goal]})); }} 
                              style={[styles.goalItem, sel && { backgroundColor: activeColor, borderColor: activeColor }]}>
                              <Text style={[styles.goalText, { color: sel ? '#FFF' : activeColor }]}>{goal}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {step === 4 && (
                    <View style={styles.stepContainer}>
                      <View style={styles.headerGap}>
                        <Text style={[styles.title, { color: activeColor }]}>Experience</Text>
                        <Text style={styles.subtitle}>Your current fitness level dictates the volume and intensity of Azuka's generators.</Text>
                      </View>
                      {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <TouchableOpacity key={level} onPress={() => { triggerHaptic(); setData({...data, trainingLevel: level}); }} 
                          style={[styles.levelRow, data.trainingLevel === level && { borderColor: activeColor, backgroundColor: theme.foreground}]}>
                          <Text style={[styles.levelText, { color: data.trainingLevel === level ? '#fff' : theme.azuka.forest }]}>{level}</Text>
                          {data.trainingLevel === level && <Check size={18} color={'#fff'} />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {step === 5 && (
                    <View style={styles.stepContainer}>
                      <View style={styles.headerGap}>
                        <Text style={[styles.title, { color: activeColor }]}>Confirm Your Details</Text>
                        <Text style={styles.subtitle}>Review your biological profile before we generate your first day.</Text>
                      </View>
                      <View style={styles.summaryGrid}>
                        <SummaryItem icon={<Clock size={16} color={activeColor}/>} label="Cycle" value={`${data.cycleLength} Days`} color={activeColor}/>
                        <SummaryItem icon={<Calendar size={16} color={activeColor}/>} label="Started" value={data.lastPeriod.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} color={activeColor}/>
                        <SummaryItem icon={<Award size={16} color={activeColor}/>} label="Level" value={data.trainingLevel || '—'} color={activeColor}/>
                        <SummaryItem icon={<Target size={16} color={activeColor}/>} label="Goals" value={`${data.goals.length} Selected`} color={activeColor}/>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </GlassCard>
            </View>
          </Animated.View>

          <View style={styles.footer}>
            {step > 0 && (
              <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                <ChevronLeft size={22} color={theme.azuka.forest} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={handleNext} 
              disabled={!isStepValid()}
              style={[styles.primaryBtn, { backgroundColor: activeColor, opacity: isStepValid() ? 1 : 0.4 }]}
            >
              <Text style={styles.primaryBtnText}>{step === 5 ? 'Generate System' : 'Next'}</Text>
              <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.successContainer}>
          <Animated.View style={[styles.successCircle, { backgroundColor: activeColor, transform: [{ scale: successScale }] }]}>
            <Check size={48} color="#FFF" />
          </Animated.View>
          <Text style={[styles.successText, { color: theme.azuka.forest }]}>Biological Profile Generating...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
// SummaryItem and Styles remain unchanged from your provided code
const SummaryItem = ({ icon, label, value, color }: any) => (
  <View style={styles.summaryItem}>
    <View style={styles.summaryIcon}>{icon}</View>
    <View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  blob: { position: 'absolute', borderRadius: 100, opacity: 0.08 },
  blob1: { width: 220, height: 220, top: -40, right: -60 },
  blob2: { width: 140, height: 140, bottom: 120, left: -30 },
  header: { paddingVertical: 15, alignItems: 'center' },
  stepIndicator: { flexDirection: 'row', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  main: { flex: 1, paddingHorizontal: 15 },
  cardContainer: { flex: 1, justifyContent: 'center' },
  glass: { padding: 10, borderRadius: 30, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  
  stepContainer: { paddingHorizontal: 3 },
  headerGap: { marginBottom: 25 },
  title: { fontSize: 26, fontFamily: 'FunnelDisplay-Bold', marginBottom: 6 },
  subtitle: { fontSize: 14.5, color: theme.primary, lineHeight: 20, fontFamily: 'FunnelDisplay-SemiBold' },
  
  enhancedInputCard: { backgroundColor: '#FFF', borderRadius: 24, padding:20, borderWidth: 1, borderColor: '#eee' },
  enhancedDateCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#eee' },
  
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  inputLabel: { fontSize: 12, letterSpacing: 1.5, color: theme.mutedForeground, fontFamily: 'FunnelDisplay-Bold' },
  input: { borderBottomWidth: 1.5, borderBottomColor: '#f0f0f0', paddingVertical: 10, fontSize: 16, fontFamily: 'FunnelDisplay-Medium', color: theme.azuka.forest },
  
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  stepBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#fcfcfc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
  cycleDisplay: { alignItems: 'center' },
  cycleValue: { fontSize: 44, fontFamily: 'FunnelDisplay-Bold' },
  cycleUnit: { fontSize: 13, color: '#999', marginTop: -5 },
  
  largeDateDisplay: { fontSize: 22, fontFamily: 'FunnelDisplay-Medium', color: theme.azuka.forest },
  helperText: { marginTop: 10, fontSize: 12, color: theme.mutedForeground, fontFamily: 'FunnelDisplay-Medium' },
  pickerWrapper: { marginTop: 10, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 20 },
  
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10,  },
  goalItem: { flexBasis: '48%', height: 65, backgroundColor: '#FFF', borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0' },
  goalText: { fontFamily: 'FunnelDisplay-Bold', fontSize: 15 },
  
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: theme.azukaExtended.sageLight, borderRadius: 20, marginBottom: 12, borderWidth: 1.5, borderColor: '#f0f0f0' },
  levelText: { fontSize: 15, fontFamily: 'FunnelDisplay-Bold' },
  
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap:10 },
  summaryItem: { flexBasis: '100%', backgroundColor: '#FFF', padding: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#f0f0f0' },
  summaryIcon: { width: 20, height: 20, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.02)', alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontSize: 10, color: '#999', fontFamily: 'FunnelDisplay-Bold', textTransform: 'uppercase' },
  summaryValue: { fontSize: 13, fontFamily: 'FunnelDisplay-Bold', paddingRight: 20 },
  
  footer: { flexDirection: 'row', padding: 20, gap: 10 },
  iconBtn: { width: 55, height: 55, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  primaryBtn: { flex: 1, height: 55, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'FunnelDisplay-Bold', marginRight: 8 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successText: { fontSize: 20, fontFamily: 'FunnelDisplay-Bold' }
});