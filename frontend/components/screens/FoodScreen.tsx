import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Modal
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { toast } from "sonner-native";
import {
  Camera,
  Search,
  Clock,
  Flame,
  ChevronRight,
  Plus,
  X
} from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; 
import { lightTheme as theme } from '@/constants/theme';
import { RecipeDetailModal } from '../../components/RecipeDetailModal';
import { RecipeGenerationModal } from '../../components/RecipeGenerationModal';
import { API_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width } = Dimensions.get('window');

export default function FoodScreen() {
  const [activeTab, setActiveTab] = useState<'scan' | 'recipes'>('scan');
  const insets = useSafeAreaInsets();
  
  // Data State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [genModalVisible, setGenModalVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Dashboard
        const dashRes = await fetch(`${API_URL}/food/dashboard`, { headers });
        const dashJson = await dashRes.json();
        if (dashJson.success) setDashboardData(dashJson.data);

        // Recipes
        const recRes = await fetch(`${API_URL}/food/recipes`, { headers });
        const recJson = await recRes.json();
        if (recJson.success) {
            // Combine hardcoded defaults with backend results if backend is empty
            if (recJson.recipes.length === 0) {
                 setRecipes(DEFAULT_RECIPES);
            } else {
                 setRecipes(recJson.recipes);
            }
        }
    } catch (error) {
        console.error("Food Fetch Error", error);
        toast.error("Failed to load food data");
    } finally {
        // setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecipeClick = (recipe: any) => {
      setSelectedRecipe(recipe);
      setModalVisible(true);
  };

  const handleCook = async (recipe: any) => {
      toast.info("Logging meal...");
      try {
          const token = await AsyncStorage.getItem('userToken');
          
          const payload = {
              name: recipe.name || "Quick Meal",
              calories: parseInt(recipe.calories || recipe.cals || 0),
              protein: parseInt(recipe.protein || recipe.macros?.protein || 0),
              carbs: parseInt(recipe.carbs || recipe.macros?.carbs || 0),
              fat: parseInt(recipe.fat || recipe.macros?.fat || 0),
              type: 'manual'
          };

          // console.log("Logging Payload:", payload);

          await fetch(`${API_URL}/food/log`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(payload)
          });
          toast.success("Bon Appétit! Meal Logged.");
          fetchData(); // Refresh dashboard
      } catch (err: any) {
          console.error("Log Meal Error:", err);
          toast.error("Failed to log meal");
      }
  };

  const handleGenerateRecipe = async (ingredients: string[]) => {
      setIsGenerating(true);
      // toast.info("Asking Chef AI..."); 
      try {
          const token = await AsyncStorage.getItem('userToken');
          const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          };

          const res = await fetch(`${API_URL}/recipe_generator`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ ingredients }) 
          });
          const json = await res.json();
          if (json.success && json.recipe) {
             const newRecipe = json.recipe;
             const phase = json.phase || 'General';
             // Save it so it appears in the list
             const saveRes = await fetch(`${API_URL}/food/recipe/save`, {
                 method: 'POST',
                 headers,
                 body: JSON.stringify({
                     name: newRecipe.meal_name,
                     description: newRecipe.biological_rationale,
                     time_mins: newRecipe.prep_time_mins,
                     calories: newRecipe.calories || newRecipe.macros?.calories || 0,
                     macros: { 
                        protein: newRecipe.macros?.protein || 0, 
                        carbs: newRecipe.macros?.carbs || 0, 
                        fat: newRecipe.macros?.fat || 0 
                     },
                     ingredients: newRecipe.ingredients,
                     instructions: newRecipe.instructions,
                     phase_tags: [phase, 'Cycle Synced'],
                     image_url: "" 
                 })
             });
             
             if (saveRes.ok) {
                const savedData = await saveRes.json();
                toast.success("New Recipe Created!");
                setGenModalVisible(false);
                fetchData();
                
                // Open the detail modal so user can log it immediately
                if (savedData.recipe) {
                    setTimeout(() => {
                        setSelectedRecipe(savedData.recipe);
                        setModalVisible(true);
                    }, 500);
                }
             } else {
                toast.error("Failed to save recipe");
             }
          } else {
             toast.error(json.message || "Failed to generate recipe");
          }
      } catch (error) {
          console.error("Error generating recipe:", error);
          toast.error("Failed to generate recipe");
      } finally {
          setIsGenerating(false);
      }
  };

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

        {activeTab === 'scan' ? (
            <FoodScanner dashboardData={dashboardData} onRefresh={fetchData} />
        ) : (
            <RecipeGenerator 
              recipes={recipes} 
              onRecipeClick={handleRecipeClick} 
              onOpenGenModal={() => setGenModalVisible(true)} 
            />
        )}
      </ScrollView>

      <RecipeDetailModal 
        visible={modalVisible} 
        recipe={selectedRecipe} 
        onClose={() => setModalVisible(false)} 
        onCook={handleCook}
      />

      <RecipeGenerationModal
        visible={genModalVisible}
        onClose={() => setGenModalVisible(false)}
        onGenerate={handleGenerateRecipe}
        isGenerating={isGenerating}
      />
    </SafeAreaView>
  );
}

// --- View: FOOD SCANNER ---

function FoodScanner({ dashboardData, onRefresh }: any) {
  const [scanning, setScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pickImage = async (useCamera: boolean) => {
      setScanning(true);
      setErrorMsg(null);
      try {
          const permissionResult = useCamera 
              ? await ImagePicker.requestCameraPermissionsAsync()
              : await ImagePicker.requestMediaLibraryPermissionsAsync();
          
          if (permissionResult.status !== 'granted') {
              toast.error("Permission denied");
              setScanning(false);
              return;
          }

          const result = useCamera
              ? await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  base64: true,
                  quality: 0.5,
              })
              : await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  base64: true,
                  quality: 0.5,
              });

          if (!result.canceled && result.assets && result.assets[0].base64) {
              setPreviewImage(result.assets[0].uri); // Show preview
              setBase64Image(result.assets[0].base64);
              // Auto analyze removed - User confirms first
          } else {
              setScanning(false);
          }
      } catch (error) {
          console.error("Pick Image Error", error);
          toast.error("Error picking image");
          setScanning(false);
      }
  };

  const analyzeFood = async (base64: string) => {
      setAnalyzing(true);
      setErrorMsg(null);
      // toast.info("Analyzing Image...");
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(`${API_URL}/food/analyze`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ 
                imageBase64: base64 
            })
        });
        const json = await res.json();
        
        if (json.success && json.analysis) {
            setAnalysisResult(json.analysis);
        } else {
            setErrorMsg("Could not identify food. Please try again.");
            toast.error("Could not identify food");
            // closeModal(); // Don't close, let user retry
        }
      } catch {
          setErrorMsg("Analysis Failed. Check connection.");
          toast.error("Analysis Failed");
          // closeModal(); // Don't close
      } finally {
          setAnalyzing(false);
          setScanning(false);
      }
  };

  const logMeal = async () => {
      if (!analysisResult) return;
      
      const meal = analysisResult.meal_identification[0];
      const macros = analysisResult.macros;

      try {
        const token = await AsyncStorage.getItem('userToken');
        await fetch(`${API_URL}/food/log`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                name: meal,
                calories: macros.calories,
                protein: macros.protein,
                carbs: macros.carbs,
                fat: macros.fat,
                type: 'photo'
            })
        });
        toast.success("Meal Logged!");
        onRefresh();
        closeModal();
      } catch (e) {
          toast.error("Failed to log meal");
      }
  };

  const closeModal = () => {
      setPreviewImage(null);
      setBase64Image(null);
      setAnalysisResult(null);
      setAnalyzing(false);
      setErrorMsg(null);
  };

  const summary = dashboardData?.summary || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const targets = dashboardData?.targets || { calories: 2000, protein: 120, carbs: 200, fat: 70 };
  // Recent Meals
  const meals = dashboardData?.meals || [];

  return (
    <View style={styles.sectionGap}>
      <Animated.View entering={FadeInUp}>
      {/* Meal Analysis Modal */}
      <Modal visible={!!previewImage} animationType="slide" transparent onRequestClose={closeModal}>
          <View style={styles.modalOverlay}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            <View style={[styles.modalContent, { backgroundColor: theme.azuka.cream, maxHeight: '85%', marginTop: 'auto', borderTopLeftRadius: 30, borderTopRightRadius: 30 }]}>
                  
                  {/* Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 20 }}>
                      <TouchableOpacity onPress={closeModal} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 20 }}>
                          <X size={24} color={theme.azuka.forest} />
                      </TouchableOpacity>
                  </View>

                  <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                      {/* Image Preview */}
                      <View style={{ alignItems: 'center', marginBottom: 20 }}>
                          {previewImage && <Image source={{ uri: previewImage }} style={{ width: 200, height: 200, borderRadius: 20 }} />}
                      </View>

                      {analyzing ? (
                          <View style={{ alignItems: 'center', padding: 20 }}>
                              <ActivityIndicator size="large" color={theme.azuka.forest} />
                              <Text style={{ marginTop: 20, color: theme.azuka.forest, fontSize: 16, fontFamily: 'FunnelDisplay-Regular' }}>
                                  Analyzing your meal...
                              </Text>
                          </View>
                      ) : !analysisResult ? (
                          <View>
                              <Text style={[styles.title, { fontSize: 24, textAlign: 'center', marginBottom: 10, color: theme.azuka.forest }]}>Analyze this meal?</Text>
                              {errorMsg && (
                                <Text style={{ color: theme.azuka.rose, textAlign: 'center', marginBottom: 10, fontFamily: 'FunnelDisplay-Medium' }}>
                                    {errorMsg}
                                </Text>
                              )}
                              <TouchableOpacity 
                                  style={[styles.primaryButton, { backgroundColor: theme.azuka.forest }]}
                                  onPress={() => base64Image && analyzeFood(base64Image)}
                              >
                                  <Text style={styles.primaryButtonText}>{errorMsg ? "Retry Analysis" : "Analyze Nutrition"}</Text>
                              </TouchableOpacity>
                          </View>
                      ) : (
                          // MEAL RECAP VIEW
                          <View>
                              <Text style={[styles.title, { fontSize: 24, marginBottom: 20, color: theme.azuka.forest }]}>Meal Recap</Text>
                              
                              <GlassCard style={{ padding: 20, marginBottom: 20 }}>
                                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.azuka.forest, marginBottom: 16, fontFamily: 'FunnelDisplay-Bold' }}>
                                      {analysisResult.meal_identification?.[0] || "Food"}
                                  </Text>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                      <View style={{ alignItems: 'center' }}>
                                          <Text style={{ color: theme.azuka.sage, fontSize: 12, fontFamily: 'FunnelDisplay-Regular' }}>Calories</Text>
                                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.azuka.forest, fontFamily: 'FunnelDisplay-Bold' }}>
                                              {analysisResult.macros?.calories}
                                          </Text>
                                      </View>
                                      <View style={{ width: 1, height: 30, backgroundColor: theme.border }} />
                                      <View style={{ alignItems: 'center' }}>
                                          <Text style={{ color: theme.azuka.sage, fontSize: 12, fontFamily: 'FunnelDisplay-Regular' }}>Protein</Text>
                                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.azukaExtended.tealLighter, fontFamily: 'FunnelDisplay-Bold' }}>
                                              {analysisResult.macros?.protein}g
                                          </Text>
                                      </View>
                                      <View style={{ width: 1, height: 30, backgroundColor: theme.border }} />
                                      <View style={{ alignItems: 'center' }}>
                                          <Text style={{ color: theme.azuka.sage, fontSize: 12, fontFamily: 'FunnelDisplay-Regular' }}>Carbs</Text>
                                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.azuka.rose, fontFamily: 'FunnelDisplay-Bold' }}>
                                              {analysisResult.macros?.carbs}g
                                          </Text>
                                      </View>
                                      <View style={{ width: 1, height: 30, backgroundColor: theme.border }} />
                                      <View style={{ alignItems: 'center' }}>
                                          <Text style={{ color: theme.azuka.sage, fontSize: 12, fontFamily: 'FunnelDisplay-Regular' }}>Fat</Text>
                                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.azuka.sage, fontFamily: 'FunnelDisplay-Bold' }}>
                                              {analysisResult.macros?.fat}g
                                          </Text>
                                      </View>
                                  </View>
                              </GlassCard>

                              <TouchableOpacity 
                                  style={[styles.primaryButton, { backgroundColor: theme.azuka.forest }]}
                                  onPress={logMeal}
                              >
                                  <Text style={styles.primaryButtonText}>Log Meal</Text>
                              </TouchableOpacity>
                          </View>
                      )}
                  </ScrollView>
            </View>
          </View>
      </Modal>
      </Animated.View>

      {/* Camera Card */}
      {/* Camera Card */}
      <Animated.View entering={ZoomIn.duration(500)}>
        <GlassCard style={styles.cameraCard}>
          <View style={styles.cameraContent}>
            <View style={[styles.cameraCircle, { backgroundColor: theme.azuka.forest }]}>
              {scanning ? <ActivityIndicator color="white" /> : <Camera size={32} color="white" />}
            </View>
            <Text style={[styles.cardTitle, { color: theme.azuka.forest }]}>Scan Your Food</Text>
            <Text style={[styles.cardBody, { color: theme.azuka.sage }]}>
              Point camera at your meal for instant calories and macros
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: theme.azuka.forest, flex: 1 }]}
                  onPress={() => pickImage(true)}
                  disabled={scanning}
                >
                  <Text style={styles.primaryButtonText}>{scanning ? "Scanning..." : "Camera"}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: theme.azuka.teal, flex: 1 }]}
                  onPress={() => pickImage(false)}
                  disabled={scanning}
                >
                  <Text style={styles.primaryButtonText}>{scanning ? "..." : "Gallery"}</Text>
                </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Summary Card */}
      <Animated.View entering={FadeInUp.delay(200)}>
        <GlassCard style={styles.innerCardPadding}>
          <Text style={[styles.summaryTitle, { color: theme.azuka.forest }]}>Today&apos;s Intake</Text>
          <View style={styles.macroGrid}>
            <MacroStatic value={summary.calories} label="Calories" color={theme.azuka.forest} />
            <MacroStatic value={`${summary.protein}g`} label="Protein" color={theme.azukaExtended.tealLighter} />
            <MacroStatic value={`${summary.carbs}g`} label="Carbs" color={theme.azuka.rose} />
          </View>

          <View style={styles.progressContainer}>
            <MacroBar label="Calories" current={summary.calories} target={targets.calories} color={theme.azukaExtended.sageLight} />
            <MacroBar label="Protein" current={summary.protein} target={targets.protein} color={theme.azukaExtended.tealLight} />
            <MacroBar label="Carbs" current={summary.carbs} target={targets.carbs} color={theme.azuka.rose} />
            <MacroBar label="Fats" current={summary.fat} target={targets.fat} color={theme.azuka.sage} />
          </View>
        </GlassCard>
      </Animated.View>

      {/* Recent Meals */}
      <Animated.View entering={FadeInUp.delay(400)}>
        <GlassCard style={styles.innerCardPadding}>
          <Text style={[styles.summaryTitle, { color: theme.azuka.forest }]}>Recent Meals</Text>
          <View style={styles.mealList}>
            {meals.slice().reverse().slice(0, 5).map((meal: any, i: number) => (
                <MealItem 
                    key={i} 
                    name={meal.food} 
                    time={meal.type === 'photo' ? 'Scanned' : 'Manual'} 
                    cals={meal.calories} 
                />
            ))}
            {meals.length === 0 && <Text style={{ textAlign: 'center', color: theme.azuka.sage, padding: 10 }}>No meals logged yet today.</Text>}
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

// --- View: RECIPE GENERATOR ---

function RecipeGenerator({ recipes, onRecipeClick, onOpenGenModal }: any) {
  
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
        <TouchableOpacity 
            style={[styles.filterBtn, { backgroundColor: theme.azuka.forest }]}
            onPress={onOpenGenModal}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={[styles.recommendationBox, { backgroundColor: `${theme.azuka.rose}20`, borderColor: `${theme.azuka.rose}30` }]}>
        <Text style={[styles.recTitle, { color: theme.azuka.forest }]}>Current Phase Recommendations</Text>
        <Text style={[styles.recBody, { color: theme.azukaExtended.forestLight }]}>
            Focus on complex carbs, magnesium, and anti-inflammatory foods to support hormone balance.
        </Text>
      </View>

      {recipes.map((item: any, index: number) => (
        <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => onRecipeClick(item)}>
            <GlassCard style={styles.recipeCard}>
            <View style={[styles.recipeImagePlaceholder, { backgroundColor: item.color ? `${item.color}30` : `${theme.azuka.sage}30` }]}>
                <Flame size={40} color={item.color || theme.azuka.sage} />
            </View>
            <View style={styles.recipeDetails}>
                <View style={styles.recipeHeader}>
                <Text style={[styles.recipeName, { color: theme.azuka.forest }]}>{item.name}</Text>
                <ChevronRight size={20} color={theme.azuka.sage} />
                </View>
                <View style={styles.recipeMetrics}>
                <MetricItem icon={<Clock size={12} color={theme.azuka.sage} />} text={`${item.time_mins || item.time} min`} />
                <MetricItem icon={<Flame size={12} color={theme.azuka.sage} />} text={`${item.calories || item.cals} cal`} />
                </View>
                <View style={styles.tagRow}>
                <View style={[styles.phaseTag, { backgroundColor: `${item.color || theme.azuka.teal}20` }]}>
                    <Text style={{ color: item.color || theme.azuka.teal, fontSize: 10, fontWeight: '600' }}>{item.phase || item.phase_tags?.[0] || 'General'}</Text>
                </View>
                {item.tags && item.tags.map((t: string) => (
                    <View key={t} style={styles.simpleTag}>
                    <Text style={[styles.tagTextSmall, { color: theme.azuka.forest }]}>{t}</Text>
                    </View>
                ))}
                </View>
            </View>
            </GlassCard>
        </TouchableOpacity>
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

// Default Data for fallback
const DEFAULT_RECIPES = [
    { name: 'High-Protein Buddha Bowl', time: 25, cals: 520, protein: 42, carbs: 50, fat: 18, phase: 'Luteal', color: theme.azuka.rose, tags: ['Iron-rich'], ingredients: ['Quinoa', 'Chickpeas', 'Spinach', 'Tahini'], instructions: ['Boil quinoa.', 'Roast chickpeas.', 'Mix everything.'] },
    { name: 'Quinoa Power Salad', time: 15, cals: 380, protein: 18, carbs: 40, fat: 12, phase: 'Ovulatory', color: theme.azuka.teal, tags: ['Light'], ingredients: ['Quinoa', 'Cucumber', 'Feta', 'Lemon'], instructions: ['Chop veggies.', 'Toss with quinoa and dressing.'] },
];

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
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { height: '85%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  modalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  previewContainer: { height: 250, backgroundColor: '#f0f0f0', marginBottom: 0 },
  previewImage: { width: '100%', height: '100%' },
  loadingContainer: { padding: 40, alignItems: 'center' },
  resultTitle: { fontSize: 24, fontWeight: '600', textAlign: 'center', fontFamily: 'FunnelDisplay-Bold', marginBottom: 8 },
});
