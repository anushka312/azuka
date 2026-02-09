import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { GlassCard } from '../GlassCard';
import { PetalIcon } from '../icons/AzukaIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightTheme as theme } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  // Animation Refs
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Initial Pop
      Animated.spring(logoScale, {
        toValue: 1.1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      // 2. The "Lift & Reveal"
      Animated.parallel([
        Animated.timing(logoTranslateY, {
          toValue: -height * 0.35,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 800,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 800,
          delay: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [contentFade, contentSlide, logoScale, logoTranslateY]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>

        {/* Animated Header/Logo - Stays above the content flow */}
        <Animated.View style={[
          styles.logoGroup,
          { transform: [{ translateY: logoTranslateY }, { scale: logoScale }] }
        ]}>
          <View style={styles.iconContainer}>
            <PetalIcon size={100} color={theme.azuka.rose} />
          </View>
          <Text style={styles.brandTitle}>azuka</Text>
        </Animated.View>

        {/* Content - Fades in as the logo moves up */}
        <Animated.View style={[
          styles.contentWrapper,
          { opacity: contentFade, transform: [{ translateY: contentSlide }] }
        ]}>
          <Text style={styles.brandSubtitle}>Your biological operating system</Text>

          <GlassCard style={styles.card}>
            <View style={styles.featureList}>
              <FeatureItem
                color={theme.phase.ovulatory}
                title="Biological Intelligence"
                description="Daily optimal actions calculated for your unique biology"
              />
              <FeatureItem
                color={theme.phase.recovery}
                title="Cycle-Synced Performance"
                description="Strategic training scaled to your monthly strength peaks"
              />
              <FeatureItem
                color={theme.phase.menstrual}
                title="Biological Adherence"
                description="Smart replanning that ensures you never fail a fitness goal"
              />
            </View>
          </GlassCard>

          <View style={styles.ctaWrapper}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.azuka.forest }]}
              onPress={onGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={onGetStarted}>
              <Text style={[styles.secondaryBtnText, { color: theme.azuka.teal }]}>
                Already have an account? <Text style={styles.signInText}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>


        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ color, title, description }: { color: string; title: string; description: string }) {
  return (
    <View style={styles.enhancedFeatureRow}>
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: theme.azuka.forest }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: theme.azuka.teal }]}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.azuka.cream },
  mainContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  logoGroup: {
    position: 'absolute',
    alignItems: 'center',
    width: width,
    zIndex: 100,
  },
  iconContainer: {
    marginTop: 10,
    marginBottom: 7,
  },
  brandTitle: {
    fontSize: 52,
    color: theme.azuka.teal,
    letterSpacing: 0.35,
    fontFamily: 'FunnelDisplay-SemiBold'
  },

  contentWrapper: {
    width: '100%',
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 100, // Provides space so logo doesn't cover content after lifting
  },
  brandSubtitle: {
    fontSize: 16,
    color: theme.azuka.sage,
    marginBottom:20,
    fontFamily: 'FunnelDisplay-Regular',
    letterSpacing: 0.2,
  },
  card: {
    width: '100%',
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(131, 150, 95, 0.2)', // sage with low opacity
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  featureList: { gap: 10 },
  featureRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  dotContainer: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontFamily: 'FunnelDisplay-Bold', marginBottom: 2 },
  featureDesc: { fontSize: 13, lineHeight: 18, fontFamily: 'FunnelDisplay-Regular', opacity: 0.9, letterSpacing: 0.01 },
  enhancedFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Top-aligned looks more editorial
    gap: 14,
    paddingVertical: 8, // More vertical space between items
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(131, 150, 95, 0.05)', // Very faint divider
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaWrapper: { width: '100%', marginTop: 32, gap: 10 },
  primaryBtn: {
    height: 60,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.azuka.forest,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontFamily: 'FunnelDisplay-Bold' },
  secondaryBtn: { alignItems: 'center', paddingVertical: 10 },
  secondaryBtnText: { fontSize: 14, fontFamily: 'FunnelDisplay-Regular' },
  signInText: { fontFamily: 'FunnelDisplay-Bold' },

  tagline: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'FunnelDisplay-Regular',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.5,
  }
});