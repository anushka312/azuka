import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.cardContainer, style]}>
      <BlurView intensity={40} tint="light" style={styles.blur}>
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

interface GlassButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export function GlassButton({ children, onPress, variant = 'primary', style }: GlassButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btnWrapper, style]}>
      <BlurView 
        intensity={30} 
        style={[styles.btnBlur, isPrimary ? {backgroundColor: '#29555F'} : {backgroundColor: 'rgba(255,255,255,0.6)'}]}
      >
        <Text style={[styles.btnText, isPrimary ? {color: '#fff'} : {color: '#1C3927'}]}>
          {children}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  blur: { flex: 1 },
  content: { padding: 16 },
  btnWrapper: { borderRadius: 100, overflow: 'hidden' },
  btnBlur: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  btnText: { fontWeight: '600' }
});