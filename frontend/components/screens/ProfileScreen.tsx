import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard } from '../GlassCard';
import { User, Settings, Ruler, Weight, Activity, Heart, Clock, Utensils, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Dummy Data matching Backend Model
const userData = {
  name: "Alicia M.",
  email: "alicia@example.com",
  age: 28,
  height: 165, // cm
  weight: 58, // kg
  activityLevel: "Moderately Active",
  cycleDay: 22,
  cycleLength: 28,
  lastPeriod: "2024-01-15",
  goals: {
    primary: "Balance Hormones",
    secondary: "Increase Energy",
    target_weight: 55
  },
  basalMetabolicRate: 1450,
  activityFactor: 1.55,
  stressBaseline: 0.4,
  energyBaseline: 0.7,
  timeWindows: ["08:00 - 12:00", "14:00 - 18:00"],
  foodPrefs: ["Vegetarian", "Gluten-Free"],
  allergies: ["Peanuts"]
};

export function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Profile Card */}
        <View style={styles.header}>
          <View style={styles.profileImagePlaceholder}>
             <User size={40} color="#F1ECCE" />
          </View>
          <View>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings size={24} color="#29555F" />
          </TouchableOpacity>
        </View>

        {/* Physical Stats */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Physical Stats</Text>
          <View style={styles.statsGrid}>
            <StatItem icon={Ruler} label="Height" value={`${userData.height} cm`} color="#29555F" />
            <StatItem icon={Weight} label="Weight" value={`${userData.weight} kg`} color="#83965F" />
            <StatItem icon={Activity} label="Activity" value={userData.activityLevel} color="#BB8585" />
            <StatItem icon={Heart} label="Age" value={`${userData.age}`} color="#D9A691" />
          </View>
        </GlassCard>

        {/* Cycle & Health */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Cycle & Health</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cycle Length</Text>
            <Text style={styles.value}>{userData.cycleLength} Days</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Current Day</Text>
            <Text style={styles.value}>Day {userData.cycleDay}</Text>
          </View>
           <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>BMR</Text>
            <Text style={styles.value}>{userData.basalMetabolicRate} kcal</Text>
          </View>
        </GlassCard>

        {/* Goals */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <View style={styles.goalItem}>
             <View style={styles.bullet} />
             <Text style={styles.goalText}>{userData.goals.primary}</Text>
          </View>
          <View style={styles.goalItem}>
             <View style={styles.bullet} />
             <Text style={styles.goalText}>{userData.goals.secondary}</Text>
          </View>
          <View style={styles.goalItem}>
             <View style={styles.bullet} />
             <Text style={styles.goalText}>Target Weight: {userData.goals.target_weight} kg</Text>
          </View>
        </GlassCard>

         {/* Preferences */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.prefSection}>
            <View style={styles.prefHeader}>
                <Utensils size={16} color="#29555F" />
                <Text style={styles.prefTitle}>Dietary</Text>
            </View>
            <View style={styles.tagContainer}>
                {userData.foodPrefs.map((pref, i) => (
                    <View key={i} style={styles.tag}><Text style={styles.tagText}>{pref}</Text></View>
                ))}
            </View>
          </View>

          <View style={styles.prefSection}>
             <View style={styles.prefHeader}>
                <AlertCircle size={16} color="#BB8585" />
                <Text style={styles.prefTitle}>Allergies</Text>
            </View>
            <View style={styles.tagContainer}>
                {userData.allergies.map((allergy, i) => (
                    <View key={i} style={[styles.tag, {backgroundColor: 'rgba(187, 133, 133, 0.1)'}]}><Text style={[styles.tagText, {color: '#BB8585'}]}>{allergy}</Text></View>
                ))}
            </View>
          </View>

           <View style={styles.prefSection}>
             <View style={styles.prefHeader}>
                <Clock size={16} color="#83965F" />
                <Text style={styles.prefTitle}>Eating Windows</Text>
            </View>
             <View style={styles.tagContainer}>
                {userData.timeWindows.map((window, i) => (
                    <View key={i} style={[styles.tag, {backgroundColor: 'rgba(131, 150, 95, 0.1)'}]}><Text style={[styles.tagText, {color: '#83965F'}]}>{window}</Text></View>
                ))}
            </View>
          </View>

        </GlassCard>

      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ icon: Icon, label, value, color }: any) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F5' },
  scrollContent: { padding: 16, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1C3927',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C3927',
    fontFamily: 'FunnelDisplay-Bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#83965F',
    fontFamily: 'SpaceMono-Regular',
  },
  settingsBtn: {
    marginLeft: 'auto',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C3927',
    marginBottom: 16,
    fontFamily: 'FunnelDisplay-Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    width: (width - 80) / 2, // 2 columns
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#83965F',
    fontFamily: 'SpaceMono-Regular',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'SpaceMono-Bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#5C6C50',
    fontFamily: 'SpaceMono-Regular',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C3927',
    fontFamily: 'SpaceMono-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 4,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#29555F',
  },
  goalText: {
    fontSize: 14,
    color: '#29555F',
    fontFamily: 'SpaceMono-Regular',
  },
  prefSection: {
    marginBottom: 16,
  },
  prefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C3927',
    fontFamily: 'FunnelDisplay-SemiBold',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(41, 85, 95, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#29555F',
    fontFamily: 'SpaceMono-Bold',
  },
});
