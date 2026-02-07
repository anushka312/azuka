import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Home, Dumbbell, Utensils, Brain, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface BottomNavProps {
  activeTab: 'home' | 'workout' | 'food' | 'mindset';
  onTabChange: (tab: 'home' | 'workout' | 'food' | 'mindset') => void;
  onQuickLog: () => void;
}

export function BottomNav({ activeTab, onTabChange, onQuickLog }: BottomNavProps) {
  const leftTabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'workout' as const, label: 'Workout', icon: Dumbbell },
  ];
  const rightTabs = [
    { id: 'food' as const, label: 'Food', icon: Utensils },
    { id: 'mindset' as const, label: 'Mindset', icon: Brain },
  ];

  return (
    <View style={styles.navWrapper}>
      <BlurView 
        intensity={200} 
        tint="systemMaterial"
        style={styles.blurContainer}
      >
        <View style={styles.navInner}>
          {leftTabs.map((tab) => (
            <NavButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              onPress={() => onTabChange(tab.id)}
            />
          ))}

          {/* Spacer for the floating button */}
          <View style={{ width: 60 }} />

          {rightTabs.map((tab) => (
            <NavButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              onPress={() => onTabChange(tab.id)}
            />
          ))}
        </View>
      </BlurView>

      {/* Floating Plus Button */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        style={styles.floatingButton} 
        onPress={onQuickLog}
      >
        <Plus color="white" size={32} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

function NavButton({ icon: Icon, label, active, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.navButton}>
      <Icon size={20} color={active ? '#29555F' : '#83965F'} />
      <Text style={[styles.navLabel, { color: active ? '#29555F' : '#83965F' }]}>
        {label}
      </Text>
      {active && <View style={styles.activeDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    position: 'absolute',
    bottom: 30,
    width: width - 40,
    alignSelf: 'center',
    height: 75,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  navInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
    paddingHorizontal: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'FunnelDisplay-Bold',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#29555F',
    marginTop: 4,
  },
  floatingButton: {
    position: 'absolute',
    top: -25,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1C3927',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#1C3927',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});