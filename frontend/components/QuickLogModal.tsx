import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable, Dimensions, Platform } from 'react-native';
import { X, Activity, Camera, Heart, Gauge } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { GlassCard } from './GlassCard';

const { width } = Dimensions.get('window');
type LogType = 'symptom' | 'workout' | 'food' | 'mood';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: LogType) => void;
}

export function QuickLogModal({ isOpen, onClose, onSelectType }: QuickLogModalProps) {
  const options = [
    { type: 'symptom', icon: Heart, label: 'Log Symptoms', color: '#C39588', desc: 'Pain, cravings' },
    { type: 'workout', icon: Activity, label: 'Log Workout', color: '#29555F', desc: 'Exercise record' },
    { type: 'food', icon: Camera, label: 'Scan Food', color: '#83965F', desc: 'Capture meals' },
    { type: 'mood', icon: Gauge, label: 'Log Mood', color: '#BB8585', desc: 'Check-in' },
  ];

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true} // Fix for Android status bar overlap
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>
        
        <View style={styles.modalContainer}>
          <GlassCard style={styles.modalContent}>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Quick Log</Text>
                <Text style={styles.headerSubtitle}>Choose an activity</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#83965F" />
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={styles.optionCard}
                  onPress={() => {
                    onSelectType(option.type as LogType);
                    onClose();
                  }}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: `${option.color}20` }]}>
                    <option.icon size={24} color={option.color} />
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDesc}>{option.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'flex-end' },
  modalContainer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalContent: { padding: 24, borderRadius: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1C3927' },
  headerSubtitle: { fontSize: 14, color: '#83965F' },
  closeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  optionCard: { width: (width - 80) / 2, backgroundColor: 'rgba(255,255,255,0.5)', padding: 16, borderRadius: 24 },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: '#1C3927' },
  optionDesc: { fontSize: 11, color: '#83965F' },
});