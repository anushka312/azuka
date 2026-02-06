import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { toast } from "sonner-native";
import {
  Camera,
  Search,
  Filter,
  Clock,
  Flame,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; // Ensure this path is correct for your project

const { width } = Dimensions.get('window');

export default function FoodScreen() {
  const [activeTab, setActiveTab] = useState<'scan' | 'recipes'>('scan');
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 100 } // Ensures list doesn't get hidden by BottomNav
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Food</Text>
          <Text style={styles.subtitle}>Phase-synced nutrition</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {(['scan', 'recipes'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === 'scan' ? 'Food Scanner' : 'Recipes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'scan' ? <FoodScanner /> : <RecipeGenerator />}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- View: FOOD SCANNER ---

function FoodScanner() {
  return (
    <View style={styles.sectionGap}>
      {/* Camera Card */}
      <Animated.View entering={ZoomIn.duration(500)}>
        <GlassCard style={styles.cameraCard}>
          <View style={styles.cameraContent}>
            <View style={styles.cameraCircle}>
              <Camera size={32} color="white" />
            </View>
            <Text style={styles.cardTitle}>Scan Your Food</Text>
            <Text style={styles.cardBody}>
              Point camera at your meal for instant calories and macros
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => toast.success("Camera started", { description: "Ready to scan food." })}
            >
              <Text style={styles.primaryButtonText}>Open Camera</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Summary Card */}
      <Animated.View entering={FadeInUp.delay(200)}>
        <GlassCard style={styles.innerCardPadding}>
          <Text style={styles.summaryTitle}>Today's Intake</Text>
          <View style={styles.macroGrid}>
            <MacroStatic value="1,850" label="Calories" color="#1C3927" />
            <MacroStatic value="95g" label="Protein" color="#29555F" />
            <MacroStatic value="180g" label="Carbs" color="#C39588" />
          </View>

          <View style={styles.progressContainer}>
            <MacroBar label="Calories" current={1850} target={2100} color="#29555F" />
            <MacroBar label="Protein" current={95} target={120} color="#29555F" />
            <MacroBar label="Carbs" current={180} target={200} color="#C39588" />
            <MacroBar label="Fats" current={65} target={70} color="#83965F" />
          </View>
        </GlassCard>
      </Animated.View>

      {/* Recent Meals */}
      <Animated.View entering={FadeInUp.delay(400)}>
        <GlassCard style={styles.innerCardPadding}>
          <Text style={styles.summaryTitle}>Recent Meals</Text>
          <View style={styles.mealList}>
            <MealItem name="Salmon & Quinoa Bowl" time="12:30 PM" cals={650} />
            <MealItem name="Greek Yogurt & Berries" time="9:00 AM" cals={320} />
            <MealItem name="Green Smoothie" time="7:00 AM" cals={180} />
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

// --- View: RECIPE GENERATOR ---

function RecipeGenerator() {
  const recipes = [
    { name: 'High-Protein Buddha Bowl', time: 25, cals: 520, protein: 42, phase: 'Luteal', color: '#C39588', tags: ['Iron-rich'] },
    { name: 'Quinoa Power Salad', time: 15, cals: 380, protein: 18, phase: 'Ovulatory', color: '#29555F', tags: ['Light'] },
  ];

  return (
    <View style={styles.sectionGap}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={20} color="#83965F" />
          <TextInput
            placeholder="Search recipes..."
            placeholderTextColor="rgba(131,150,95,0.5)"
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color="#29555F" />
        </TouchableOpacity>
      </View>

      <View style={styles.recommendationBox}>
        <Text style={styles.recTitle}>Luteal Phase Recommendations</Text>
        <Text style={styles.recBody}>Focus on complex carbs, magnesium, and anti-inflammatory foods</Text>
      </View>

      {recipes.map((item, index) => (
        <GlassCard key={index} style={styles.recipeCard}>
          <View style={[styles.recipeImagePlaceholder, { backgroundColor: `${item.color}30` }]}>
            <Flame size={40} color={item.color} />
          </View>
          <View style={styles.recipeDetails}>
            <View style={styles.recipeHeader}>
              <Text style={styles.recipeName}>{item.name}</Text>
              <ChevronRight size={20} color="#83965F" />
            </View>
            <View style={styles.recipeMetrics}>
              <MetricItem icon={<Clock size={12} color="#83965F" />} text={`${item.time} min`} />
              <MetricItem icon={<Flame size={12} color="#83965F" />} text={`${item.cals} cal`} />
              <MetricItem icon={<Users size={12} color="#83965F" />} text={`${item.protein}g`} />
            </View>
            <View style={styles.tagRow}>
              <View style={[styles.phaseTag, { backgroundColor: `${item.color}20` }]}>
                <Text style={{ color: item.color, fontSize: 10, fontWeight: '600' }}>{item.phase}</Text>
              </View>
              {item.tags.map(t => (
                <View key={t} style={styles.simpleTag}><Text style={styles.tagTextSmall}>{t}</Text></View>
              ))}
            </View>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

// --- Helper Components ---

function MacroStatic({ value, label, color }: any) {
  return (
    <View style={styles.macroItem}>
      <Text style={[styles.macroValue, { color }]}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function MacroBar({ label, current, target, color }: any) {
  const widthPerc = Math.min((current / target) * 100, 100);
  return (
    <View style={styles.barWrapper}>
      <View style={styles.barTextRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barVal}>{current} / {target}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${widthPerc}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function MealItem({ name, time, cals }: any) {
  return (
    <View style={styles.mealRow}>
      <View>
        <Text style={styles.mealName}>{name}</Text>
        <Text style={styles.mealTime}>{time}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.mealCals}>{cals}</Text>
        <Text style={styles.mealUnit}>cal</Text>
      </View>
    </View>
  );
}

function MetricItem({ icon, text }: any) {
  return (
    <View style={styles.metric}>
      {icon}
      <Text style={styles.metricText}>{text}</Text>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F5' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#1C3927' },
  subtitle: { fontSize: 16, color: '#83965F' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 30, padding: 4, marginBottom: 24 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 25 },
  tabButtonActive: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '500', color: '#83965F' },
  tabTextActive: { color: '#29555F' },
  sectionGap: { gap: 20 },
  innerCardPadding: { padding: 16 },
  cameraCard: { paddingVertical: 30 },
  cameraContent: { alignItems: 'center', paddingHorizontal: 20 },
  cameraCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1C3927', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1C3927', marginBottom: 8 },
  cardBody: { fontSize: 14, color: '#83965F', textAlign: 'center', marginBottom: 24 },
  primaryButton: { backgroundColor: '#1C3927', width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1C3927', marginBottom: 16 },
  macroGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  macroItem: { alignItems: 'center', flex: 1 },
  macroValue: { fontSize: 22, fontWeight: '700' },
  macroLabel: { fontSize: 12, color: '#83965F', marginTop: 4 },
  progressContainer: { gap: 12 },
  barWrapper: { gap: 6 },
  barTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: 12, color: '#83965F' },
  barVal: { fontSize: 12, fontWeight: '600', color: '#1C3927' },
  barTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  mealList: { gap: 10 },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12 },
  mealName: { fontSize: 14, fontWeight: '600', color: '#1C3927' },
  mealTime: { fontSize: 12, color: '#83965F' },
  mealCals: { fontSize: 14, fontWeight: '700', color: '#1C3927' },
  mealUnit: { fontSize: 10, color: '#83965F' },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 16, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, color: '#1C3927' },
  filterBtn: { width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  recommendationBox: { padding: 16, borderRadius: 16, backgroundColor: 'rgba(195,149,136,0.15)', borderWidth: 1, borderColor: 'rgba(195,149,136,0.3)' },
  recTitle: { fontSize: 14, fontWeight: '600', color: '#1C3927', marginBottom: 4 },
  recBody: { fontSize: 12, color: '#83965F' },
  recipeCard: { padding: 0, overflow: 'hidden' },
  recipeImagePlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center' },
  recipeDetails: { padding: 16 },
  recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recipeName: { fontSize: 16, fontWeight: '700', color: '#1C3927' },
  recipeMetrics: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricText: { fontSize: 12, color: '#83965F' },
  tagRow: { flexDirection: 'row', gap: 8 },
  phaseTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  simpleTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'white' },
  tagTextSmall: { fontSize: 10, color: '#1C3927' },
});