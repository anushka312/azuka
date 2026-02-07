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
import { GlassCard } from '../../components/GlassCard'; 
import { lightTheme as theme } from '@/constants/theme'; // Using the specific theme object

const { width } = Dimensions.get('window');

export default function FoodScreen() {
  const [activeTab, setActiveTab] = useState<'scan' | 'recipes'>('scan');
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.azuka.cream }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.azuka.forest }]}>Food</Text>
          <Text style={[styles.subtitle, { color: theme.azuka.sage }]}>Phase-synced nutrition</Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: theme.border }]}>
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
                  { color: activeTab === tab ? theme.azuka.teal : theme.azuka.sage }
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
            <View style={[styles.cameraCircle, { backgroundColor: theme.azuka.forest }]}>
              <Camera size={32} color="white" />
            </View>
            <Text style={[styles.cardTitle, { color: theme.azuka.forest }]}>Scan Your Food</Text>
            <Text style={[styles.cardBody, { color: theme.azuka.sage }]}>
              Point camera at your meal for instant calories and macros
            </Text>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.azuka.forest }]}
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
          <Text style={[styles.summaryTitle, { color: theme.azuka.forest }]}>Today's Intake</Text>
          <View style={styles.macroGrid}>
            <MacroStatic value="1,850" label="Calories" color={theme.azuka.forest} />
            <MacroStatic value="95g" label="Protein" color={theme.azukaExtended.tealLighter} />
            <MacroStatic value="180g" label="Carbs" color={theme.azuka.rose} />
          </View>

          <View style={styles.progressContainer}>
            <MacroBar label="Calories" current={1850} target={2100} color={theme.azukaExtended.sageLight} />
            <MacroBar label="Protein" current={95} target={120} color={theme.azukaExtended.tealLight} />
            <MacroBar label="Carbs" current={180} target={200} color={theme.azuka.rose} />
            <MacroBar label="Fats" current={65} target={70} color={theme.azuka.sage} />
          </View>
        </GlassCard>
      </Animated.View>

      {/* Recent Meals */}
      <Animated.View entering={FadeInUp.delay(400)}>
        <GlassCard style={styles.innerCardPadding}>
          <Text style={[styles.summaryTitle, { color: theme.azuka.forest }]}>Recent Meals</Text>
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
    { name: 'High-Protein Buddha Bowl', time: 25, cals: 520, protein: 42, phase: 'Luteal', color: theme.azuka.rose, tags: ['Iron-rich'] },
    { name: 'Quinoa Power Salad', time: 15, cals: 380, protein: 18, phase: 'Ovulatory', color: theme.azuka.teal, tags: ['Light'] },
  ];

  return (
    <View style={styles.sectionGap}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground }]}>
          <Search size={20} color={theme.azuka.sage} />
          <TextInput
            placeholder="Search recipes..."
            placeholderTextColor={`${theme.azuka.sage}80`}
            style={[styles.searchInput, { color: theme.azuka.forest }]}
          />
        </View>
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.inputBackground }]}>
          <Filter size={20} color={theme.azuka.teal} />
        </TouchableOpacity>
      </View>

      <View style={[styles.recommendationBox, { backgroundColor: `${theme.azuka.rose}20`, borderColor: `${theme.azuka.rose}30` }]}>
        <Text style={[styles.recTitle, { color: theme.azuka.forest }]}>Luteal Phase Recommendations</Text>
        <Text style={[styles.recBody, { color: theme.azukaExtended.forestLight }]}>Focus on complex carbs, magnesium, and anti-inflammatory foods</Text>
      </View>

      {recipes.map((item, index) => (
        <GlassCard key={index} style={styles.recipeCard}>
          <View style={[styles.recipeImagePlaceholder, { backgroundColor: `${item.color}30` }]}>
            <Flame size={40} color={item.color} />
          </View>
          <View style={styles.recipeDetails}>
            <View style={styles.recipeHeader}>
              <Text style={[styles.recipeName, { color: theme.azuka.forest }]}>{item.name}</Text>
              <ChevronRight size={20} color={theme.azuka.sage} />
            </View>
            <View style={styles.recipeMetrics}>
              <MetricItem icon={<Clock size={12} color={theme.azuka.sage} />} text={`${item.time} min`} />
              <MetricItem icon={<Flame size={12} color={theme.azuka.sage} />} text={`${item.cals} cal`} />
            </View>
            <View style={styles.tagRow}>
              <View style={[styles.phaseTag, { backgroundColor: `${item.color}20` }]}>
                <Text style={{ color: item.color, fontSize: 10, fontWeight: '600' }}>{item.phase}</Text>
              </View>
              {item.tags.map(t => (
                <View key={t} style={styles.simpleTag}>
                  <Text style={[styles.tagTextSmall, { color: theme.azuka.forest }]}>{t}</Text>
                </View>
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
      <Text style={[styles.macroLabel, { color: theme.azuka.sage }]}>{label}</Text>
    </View>
  );
}

function MacroBar({ label, current, target, color }: any) {
  const widthPerc = Math.min((current / target) * 100, 100);
  return (
    <View style={styles.barWrapper}>
      <View style={styles.barTextRow}>
        <Text style={[styles.barLabel, { color: theme.azuka.sage }]}>{label}</Text>
        <Text style={[styles.barVal, { color: theme.azuka.forest }]}>{current} / {target}</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
        <View style={[styles.barFill, { width: `${widthPerc}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function MealItem({ name, time, cals }: any) {
  return (
    <View style={[styles.mealRow, { backgroundColor: theme.inputBackground }]}>
      <View>
        <Text style={[styles.mealName, { color: theme.azuka.forest }]}>{name}</Text>
        <Text style={[styles.mealTime, { color: theme.azuka.sage }]}>{time}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.mealCals, { color: theme.azuka.forest }]}>{cals}</Text>
        <Text style={[styles.mealUnit, { color: theme.azuka.sage }]}>cal</Text>
      </View>
    </View>
  );
}

function MetricItem({ icon, text }: any) {
  return (
    <View style={styles.metric}>
      {icon}
      <Text style={[styles.metricText, { color: theme.azuka.sage }]}>{text}</Text>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  subtitle: { fontSize: 16, fontFamily: 'FunnelDisplay' },
  tabContainer: { flexDirection: 'row', borderRadius: 30, padding: 4, marginBottom: 24 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 25 },
  tabButtonActive: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '500', fontFamily: 'FunnelDisplay-SemiBold' },
  sectionGap: { gap: 20 },
  innerCardPadding: { padding: 12 },
  cameraCard: { paddingVertical: 30 },
  cameraContent: { alignItems: 'center', paddingHorizontal: 20 },
  cameraCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, fontFamily: 'FunnelDisplay-Bold' },
  cardBody: { fontSize: 14, textAlign: 'center', marginBottom: 24, fontFamily: 'FunnelDisplay-Regular' },
  primaryButton: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontWeight: '600', fontSize: 16, fontFamily: 'FunnelDisplay-Bold' },
  summaryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, fontFamily: 'FunnelDisplay-Bold' },
  macroGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  macroItem: { alignItems: 'center', flex: 1 },
  macroValue: { fontSize: 22, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  macroLabel: { fontSize: 12, marginTop: 4, fontFamily: 'FunnelDisplay-Regular' },
  progressContainer: { gap: 12 },
  barWrapper: { gap: 6 },
  barTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: 12, fontFamily: 'FunnelDisplay-Regular' },
  barVal: { fontSize: 12, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  mealList: { gap: 10 },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 12 },
  mealName: { fontSize: 14, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  mealTime: { fontSize: 12, fontFamily: 'FunnelDisplay-Regular' },
  mealCals: { fontSize: 14, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  mealUnit: { fontSize: 10, fontFamily: 'FunnelDisplay-Regular' },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: 'FunnelDisplay-Regular' },
  filterBtn: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  recommendationBox: { padding: 16, borderRadius: 16, borderWidth: 1 },
  recTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, fontFamily: 'FunnelDisplay-Bold' },
  recBody: { fontSize: 13, fontFamily: 'FunnelDisplay-Regular' },
  recipeCard: { padding: 0, overflow: 'hidden' },
  recipeImagePlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center' },
  recipeDetails: { padding: 16 },
  recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recipeName: { fontSize: 16, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  recipeMetrics: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricText: { fontSize: 12, fontFamily: 'FunnelDisplay-Regular' },
  tagRow: { flexDirection: 'row', gap: 8 },
  phaseTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  simpleTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'white' },
  tagTextSmall: { fontSize: 10, fontFamily: 'FunnelDisplay-Regular' },
});