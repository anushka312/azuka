import React, { useState, useRef } from 'react';
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
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
// AND REMOVE SafeAreaView from the 'react-native' import line
import DateTimePicker from '@react-native-community/datetimepicker';
import { GlassCard } from '../GlassCard';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [data, setData] = useState({
    name: '',
    age: '',
    cycleLength: '28',
    lastPeriod: new Date(),
    goals: [] as string[],
    foodPreferences: [] as string[],
    trainingLevel: '',
  });

  const animateTransition = (direction: 'next' | 'back') => {
    // Basic slide animation logic
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -20 : 20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (step < 5) {
      animateTransition('next');
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      animateTransition('back');
      setStep(step - 1);
    }
  };

  const toggleGoal = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.name.length > 0 && data.age.length > 0;
      case 1: return data.cycleLength.length > 0;
      case 2: return true; // Date is usually defaulted
      case 3: return data.goals.length > 0;
      case 4: return true;
      case 5: return data.trainingLevel.length > 0;
      default: return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressWrapper}>
        <View style={styles.progressBarTrack}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                { backgroundColor: i <= step ? '#29555F' : 'rgba(255,255,255,0.4)' }
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepText}>Step {step + 1} of 6</Text>
      </View>

      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <GlassCard style={styles.card}>
              <Text style={styles.title}>Welcome to Azuka</Text>
              <Text style={styles.subtitle}>Let's personalize your experience</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>What's your name?</Text>
                <TextInput
                  style={styles.input}
                  value={data.name}
                  onChangeText={(text) => setData({ ...data, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(131,150,95,0.5)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>How old are you?</Text>
                <TextInput
                  style={styles.input}
                  value={data.age}
                  onChangeText={(text) => setData({ ...data, age: text })}
                  placeholder="Enter your age"
                  keyboardType="number-pad"
                  placeholderTextColor="rgba(131,150,95,0.5)"
                />
              </View>
            </GlassCard>
          )}

          {step === 1 && (
            <GlassCard style={styles.card}>
              <Text style={styles.title}>Cycle Information</Text>
              <Text style={styles.subtitle}>Help us understand your cycle</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Average cycle length (days)</Text>
                <TextInput
                  style={styles.input}
                  value={data.cycleLength}
                  onChangeText={(text) => setData({ ...data, cycleLength: text })}
                  keyboardType="number-pad"
                  placeholder="28"
                />
                <Text style={styles.hint}>Typical range is 21-35 days</Text>
              </View>
            </GlassCard>
          )}

          {step === 2 && (
            <GlassCard style={styles.card}>
              <Text style={styles.title}>Last Period</Text>
              <Text style={styles.subtitle}>When did your last period start?</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First day of last period</Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  style={styles.input}
                >
                  <Text style={{color: '#1C3927'}}>{data.lastPeriod.toDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={data.lastPeriod}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) setData({ ...data, lastPeriod: selectedDate });
                    }}
                  />
                )}
              </View>
              

[Image of the female menstrual cycle phases: menstrual, follicular, ovulatory, and luteal]

            </GlassCard>
          )}

          {step === 3 && (
            <GlassCard style={styles.card}>
              <Text style={styles.title}>Your Goals</Text>
              <Text style={styles.subtitle}>Select all that apply</Text>
              <View style={styles.grid}>
                {['Fat Loss', 'Muscle Gain', 'Balance Hormones', 'More Energy', 'Better Sleep', 'Stress Relief'].map(goal => (
                  <TouchableOpacity
                    key={goal}
                    onPress={() => toggleGoal(goal)}
                    style={[
                      styles.gridItem,
                      data.goals.includes(goal) ? styles.gridItemActive : styles.gridItemInactive
                    ]}
                  >
                    <Text style={[styles.gridText, data.goals.includes(goal) ? styles.textActive : styles.textInactive]}>
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          )}

          {/* Steps 4 and 5 follow similar Grid/List patterns */}
        </ScrollView>
      </Animated.View>

      {/* Fixed Navigation Footer */}
      <View style={styles.footer}>
        <View style={styles.navRow}>
          {step > 0 && (
            <TouchableOpacity onPress={handleBack} style={[styles.navBtn, styles.backBtn]}>
              <ChevronLeft size={20} color="#29555F" />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={handleNext} 
            disabled={!canProceed()}
            style={[styles.navBtn, styles.nextBtn, !canProceed() && { opacity: 0.5 }]}
          >
            <Text style={styles.nextBtnText}>{step === 5 ? 'Complete' : 'Continue'}</Text>
            {step < 5 && <ChevronRight size={20} color="white" />}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F5' },
  progressWrapper: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
  progressBarTrack: { flexDirection: 'row', gap: 6, height: 4, marginBottom: 8 },
  progressSegment: { flex: 1, borderRadius: 2 },
  stepText: { fontSize: 12, color: '#83965F', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  card: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1C3927', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#83965F', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1C3927', marginBottom: 8 },
  input: { 
    backgroundColor: 'rgba(255,255,255,0.5)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.4)', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    color: '#1C3927',
    justifyContent: 'center'
  },
  hint: { fontSize: 12, color: '#83965F', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: (width - 80) / 2, padding: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  gridItemActive: { backgroundColor: 'rgba(41,85,95,0.1)', borderColor: '#29555F' },
  gridItemInactive: { backgroundColor: 'rgba(255,255,255,0.5)', borderColor: 'transparent' },
  gridText: { fontSize: 13, fontWeight: '600' },
  textActive: { color: '#29555F' },
  textInactive: { color: '#83965F' },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, paddingHorizontal: 20 },
  navRow: { flexDirection: 'row', gap: 12 },
  navBtn: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  nextBtn: { flex: 1, backgroundColor: '#29555F' },
  backBtnText: { color: '#29555F', fontWeight: '600', marginLeft: 4 },
  nextBtnText: { color: 'white', fontWeight: '600', marginRight: 4 },
});