import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { GlassCard } from '../GlassCard'; // Your existing BlurView wrapper
import { PetalIcon } from '../icons/AzukaIcons'; // Ensure this is converted to RN SVG
import { SafeAreaView } from 'react-native-safe-area-context'; 
// AND REMOVE SafeAreaView from the 'react-native' import line
const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry Animations
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Infinite Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        
        {/* Animated Logo */}
        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.iconContainer}>
            <PetalIcon size={96} color="#BB8585" />
            <Animated.View 
              style={[
                styles.pulseRing, 
                { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.3, 0]
                })}
              ]} 
            />
          </View>
        </Animated.View>

        {/* Brand Text */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          <Text style={styles.brandTitle}>azuka</Text>
          <Text style={styles.brandSubtitle}>Your biological operating system</Text>
        </Animated.View>

        {/* Features Card */}
        <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <GlassCard style={styles.card}>
            <View style={styles.featureList}>
              <FeatureItem
                color="#29555F"
                title="Cycle-Synced Fitness"
                description="Workouts that adapt to your hormonal phases"
              />
              <FeatureItem
                color="#83965F"
                title="Phase-Based Nutrition"
                description="Recipes tailored to your body's needs"
              />
              <FeatureItem
                color="#C39588"
                title="Holistic Tracking"
                description="Symptoms, mood, and recovery insights"
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* CTAs */}
        <Animated.View style={[styles.ctaWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
          This is not a fitness app.{"\n"}
          This is a biological operating system for the female body.
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ color, title, description }: { color: string; title: string; description: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.dotContainer, { backgroundColor: `${color}20` }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F5' },
  innerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoWrapper: { marginBottom: 32 },
  iconContainer: { position: 'relative', width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: '#BB8585' },
  brandTitle: { fontSize: 56, fontWeight: '600', color: '#29555F', marginBottom: 4 },
  brandSubtitle: { fontSize: 18, color: '#83965F', marginBottom: 48 },
  cardWrapper: { width: '100%', maxWidth: 360, marginBottom: 48 },
  card: { padding: 24 },
  featureList: { gap: 20 },
  featureRow: { flexDirection: 'row', gap: 16 },
  dotContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: '#1C3927', marginBottom: 2 },
  featureDesc: { fontSize: 14, color: '#83965F', lineHeight: 20 },
  ctaWrapper: { width: '100%', maxWidth: 360, gap: 12 },
  primaryBtn: { backgroundColor: '#29555F', paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontSize: 18, fontWeight: '600' },
  secondaryBtn: { paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { color: '#83965F', fontSize: 14, fontWeight: '600' },
  tagline: { marginTop: 48, textAlign: 'center', fontSize: 13, color: '#83965F', lineHeight: 20, opacity: 0.8 },
});