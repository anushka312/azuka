import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable, Dimensions, Platform, ScrollView } from 'react-native';
import { X, Activity, Camera, Heart, Gauge, Ruler } from 'lucide-react-native';
import Animated, { 
  SlideInDown,
  SlideOutDown 
} from 'react-native-reanimated';
import { lightTheme as theme } from '@/constants/theme';

const { width, height } = Dimensions.get('window');
type LogType = 'symptom' | 'workout' | 'food' | 'mood' | 'body';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: LogType) => void;
}

export function QuickLogModal({ isOpen, onClose, onSelectType }: QuickLogModalProps) {
  const options = [
    { type: 'symptom', icon: Heart, label: 'Symptoms', color: theme.azuka.rose, desc: 'Pain, cravings & physical changes' },
    { type: 'workout', icon: Activity, label: 'Workout', color: theme.azuka.teal, desc: 'Log your movement and intensity' },
    { type: 'food', icon: Camera, label: 'Nutrition', color: theme.azuka.sage, desc: 'Scan or log your phase-synced meals' },
    { type: 'mood', icon: Gauge, label: 'Mindset', color: theme.azukaExtended.roseLight, desc: 'Daily emotional check-in' },
    { type: 'body', icon: Ruler, label: 'Metrics', color: theme.azukaExtended.tealLight, desc: 'Weight, temperature & stats' },
  ];

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Opaque Background Backdrop */}
        <Pressable 
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(28, 57, 39, 0.7)' }]} 
          onPress={onClose} 
        />
        
        <Animated.View 
          entering={SlideInDown.duration(350)} // Smooth slide up
          exiting={SlideOutDown.duration(300)}
          style={[styles.modalContainer, { backgroundColor: theme.background }]}
        >
          {/* Visual Grabber */}
          <View style={[styles.grabber, { backgroundColor: theme.azuka.sage, opacity: 0.3 }]} />

          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.azuka.forest }]}>Quick Log</Text>
              <Text style={[styles.headerSubtitle, { color: theme.azuka.sage }]}>Choose an activity</Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              style={[styles.closeBtn, { backgroundColor: theme.border }]}
            >
              <X size={20} color={theme.azuka.forest} />
            </TouchableOpacity>
          </View>

          {/* ScrollView ensures all elements are accessible in the half-page view */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollPadding}
          >
            <View style={styles.listGap}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  activeOpacity={0.7}
                  style={[styles.optionCard, { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: theme.border 
                  }]}
                  onPress={() => {
                    onSelectType(option.type as LogType);
                    onClose();
                  }}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: `${option.color}15` }]}>
                    <option.icon size={22} color={option.color} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.optionLabel, { color: theme.azuka.forest }]}>{option.label}</Text>
                    <Text style={[styles.optionDesc, { color: theme.azuka.sage }]}>{option.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  modalContainer: { 
    height: height * 0.55, 
    width: width,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  headerSubtitle: { fontSize: 14, fontFamily: 'FunnelDisplay-Regular', marginTop: -2 },
  closeBtn: { padding: 6, borderRadius: 20 },
  scrollPadding: {
    paddingBottom: 40, // Space at the bottom of the list
  },
  listGap: {
    gap: 10,
  },
  optionCard: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 12, 
    borderRadius: 18,
    borderWidth: 1,
  },
  iconWrapper: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14 
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    fontFamily: 'FunnelDisplay-Bold' 
  },
  optionDesc: { 
    fontSize: 12, 
    fontFamily: 'FunnelDisplay-Regular',
    marginTop: 1,
    opacity: 0.9
  },
});