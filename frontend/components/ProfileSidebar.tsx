import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput, Modal, Pressable } from 'react-native';
import { toast } from 'sonner-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { User, Ruler, Weight, Heart, X, Edit2, Save, LogOut, ChevronDown, Target } from 'lucide-react-native';
import { lightTheme as theme } from '../constants/theme'; // Utilizing your theme
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const FONT_REG = 'FunnelDisplay-Regular';
const FONT_BOLD = 'FunnelDisplay-Bold';
const FONT_SB = 'FunnelDisplay-SemiBold';

export function ProfileSidebar({ isOpen, onClose, userData, onUpdateUserData }: any) {
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const goalOptions = ["Balance Hormones", "Weight Management", "Increase Energy", "Reduce Stress", "Improve Sleep"];
  const bmi = (parseFloat(userData.weight) / Math.pow(parseFloat(userData.height) / 100, 2)).toFixed(1);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile Synced');
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.mainWrapper}>
        
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} />
          </Pressable>
        </Animated.View>

        <Animated.View 
          entering={SlideInRight.duration(300)} 
          exiting={SlideOutRight.duration(250)} 
          style={[styles.sidebar, { paddingTop: insets.top, backgroundColor: theme.azuka.cream }]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.azuka.sage + '20' }]}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <X size={20} color={theme.azuka.forest} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.azuka.forest }]}>Account Settings</Text>
            <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
              {isEditing ? <Save size={20} color={theme.azuka.teal} /> : <Edit2 size={20} color={theme.azuka.teal} />}
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* User Hero */}
            <View style={styles.profileHero}>
              <View style={[styles.avatar, { backgroundColor: theme.azuka.forest }]}>
                <User size={24} color={theme.azuka.cream} />
              </View>
              {isEditing ? (
                <TextInput 
                  style={[styles.nameInput, { color: theme.azuka.forest, borderBottomColor: theme.azuka.teal }]}
                  value={userData.name}
                  onChangeText={(t) => onUpdateUserData({...userData, name: t})}
                />
              ) : (
                <Text style={[styles.userName, { color: theme.azuka.forest }]}>{userData.name}</Text>
              )}
              <Text style={[styles.userEmail, { color: theme.azuka.sage }]}>{userData.email}</Text>
            </View>

            {/* BMI Card */}
            <View style={[styles.bmiCard, { backgroundColor: theme.azuka.forest }]}>
               <Text style={[styles.bmiLabel, { color: theme.azuka.sage }]}>Current BMI</Text>
               <View style={styles.bmiRow}>
                  <Text style={[styles.bmiValue, { color: theme.azuka.cream }]}>{bmi}</Text>
                  <View style={[styles.bmiBadge, { backgroundColor: theme.azuka.teal }]}>
                    <Text style={[styles.bmiBadgeText, { color: theme.azuka.cream }]}>Healthy</Text>
                  </View>
               </View>
            </View>

            {/* Stats */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.azuka.sage }]}>Physical Profile</Text>
              <StatRow icon={Ruler} label="Height" value={userData.height} unit="cm" color={theme.azuka.teal} />
              <StatRow icon={Weight} label="Weight" value={userData.weight} unit="kg" color={theme.azuka.teal} />
              <StatRow icon={Heart} label="Age" value={userData.age} unit="yrs" color={theme.azuka.rose} />
            </View>

            {/* Goals */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.azuka.sage }]}>Focus Area</Text>
              <TouchableOpacity 
                disabled={!isEditing}
                onPress={() => setShowGoalPicker(true)}
                style={[styles.goalBox, { backgroundColor: '#FFFFFF', borderColor: isEditing ? theme.azuka.teal : 'transparent' }]}
              >
                <View style={styles.goalLeft}>
                  <Target size={18} color={theme.azuka.teal} />
                  <Text style={[styles.goalValue, { color: theme.azuka.forest }]}>{userData.goals.primary}</Text>
                </View>
                {isEditing && <ChevronDown size={18} color={theme.azuka.sage} />}
              </TouchableOpacity>
            </View>

          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.azuka.rose + '30' }]}>
              <LogOut size={16} color={theme.azuka.rose} />
              <Text style={[styles.logoutText, { color: theme.azuka.rose }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Dropdown Modal */}
      <Modal visible={showGoalPicker} transparent animationType="fade">
        <Pressable style={styles.pickerOverlay} onPress={() => setShowGoalPicker(false)}>
          <View style={[styles.pickerContent, { backgroundColor: theme.azuka.cream }]}>
            {goalOptions.map((option) => (
              <TouchableOpacity key={option} style={styles.pickerItem} onPress={() => {
                onUpdateUserData({ ...userData, goals: { ...userData.goals, primary: option } });
                setShowGoalPicker(false);
              }}>
                <Text style={[styles.pickerText, { color: theme.azuka.forest, fontFamily: userData.goals.primary === option ? FONT_BOLD : FONT_REG }]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

function StatRow({ icon: Icon, label, value, unit, color }: any) {
  return (
    <View style={[styles.statRow, { borderBottomColor: theme.azuka.sage + '10' }]}>
      <View style={styles.statLeft}>
        <Icon size={16} color={color} />
        <Text style={[styles.statLabel, { color: theme.azuka.forest }]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color: theme.azuka.forest }]}>{value} {unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end'},
  backdrop: { ...StyleSheet.absoluteFillObject,  opacity: 60 },
  sidebar: { width: width * 0.85, height: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 15, fontFamily: FONT_SB },
  iconBtn: { padding: 4 },
  scrollContent: { padding: 24 },
  profileHero: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { fontSize: 22, fontFamily: FONT_BOLD },
  nameInput: { fontSize: 22, fontFamily: FONT_BOLD, borderBottomWidth: 2, textAlign: 'center', width: '80%' },
  userEmail: { fontSize: 13, fontFamily: FONT_REG, marginTop: 4 },
  bmiCard: { padding: 20, borderRadius: 24, marginBottom: 32 },
  bmiLabel: { fontSize: 10, fontFamily: FONT_BOLD, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  bmiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bmiValue: { fontSize: 32, fontFamily: FONT_BOLD },
  bmiBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bmiBadgeText: { fontSize: 11, fontFamily: FONT_SB },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 11, fontFamily: FONT_BOLD, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statLabel: { fontSize: 15, fontFamily: FONT_REG },
  statValue: { fontSize: 15, fontFamily: FONT_SB },
  goalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5 },
  goalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalValue: { fontSize: 15, fontFamily: FONT_SB },
  footer: { paddingHorizontal: 24 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 16, borderSize: 1, backgroundColor: '#FFF' },
  logoutText: { fontFamily: FONT_BOLD, fontSize: 14 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', padding: 30 },
  pickerContent: { borderRadius: 24, padding: 16 },
  pickerItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  pickerText: { fontSize: 16, textAlign: 'center' }
});