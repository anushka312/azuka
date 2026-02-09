import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { X, Sparkles, Plus, ChefHat } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { lightTheme as theme } from '@/constants/theme';
import { GlassCard } from './GlassCard';
import Animated, { FadeInUp, SlideInDown } from 'react-native-reanimated';

interface RecipeGenerationModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (ingredients: string[]) => void;
  isGenerating: boolean;
}

export function RecipeGenerationModal({ visible, onClose, onGenerate, isGenerating }: RecipeGenerationModalProps) {
  const [inputText, setInputText] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);

  const handleAddIngredient = () => {
    if (inputText.trim()) {
      setIngredients([...ingredients, inputText.trim()]);
      setInputText('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    onGenerate(ingredients);
  };

  const handleSurpriseMe = () => {
    onGenerate([]); // Empty array signals "surprise me"
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.keyboardView}
        >
          <Animated.View 
            entering={SlideInDown.duration(400)}
            style={[styles.modalContent, { backgroundColor: theme.azuka.cream }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: theme.azuka.forest }]}>Chef Azuka AI</Text>
                <Text style={[styles.subtitle, { color: theme.azuka.sage }]}>Create a cycle-synced recipe</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.inputBackground }]}>
                <X size={20} color={theme.azuka.forest} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              
              {/* Introduction Card */}
              <GlassCard style={styles.introCard}>
                <ChefHat size={32} color={theme.azuka.teal} style={{ marginBottom: 12 }} />
                <Text style={[styles.cardText, { color: theme.azuka.forest }]}>
                  Tell me what&apos;s in your kitchen, and I&apos;ll design a meal that matches your current cycle phase and nutritional needs.
                </Text>
              </GlassCard>

              {/* Input Area */}
              <Text style={[styles.sectionLabel, { color: theme.azuka.forest }]}>Your Ingredients</Text>
              
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.azuka.forest }]}
                  placeholder="E.g., Chicken, Spinach, Avocado..."
                  placeholderTextColor={`${theme.azuka.sage}80`}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleAddIngredient}
                  returnKeyType="done"
                />
                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: theme.azuka.forest }]}
                  onPress={handleAddIngredient}
                >
                  <Plus size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Chips Container */}
              <View style={styles.chipsContainer}>
                {ingredients.map((ing, i) => (
                  <Animated.View key={i} entering={FadeInUp.delay(i * 100)} style={[styles.chip, { backgroundColor: theme.azuka.teal }]}>
                    <Text style={styles.chipText}>{ing}</Text>
                    <TouchableOpacity onPress={() => handleRemoveIngredient(i)}>
                      <X size={14} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
                {ingredients.length === 0 && (
                  <Text style={[styles.emptyHint, { color: theme.azuka.sage }]}>
                    No ingredients added yet. Add some or choose &quot;Surprise Me&quot;.
                  </Text>
                )}
              </View>

            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              {isGenerating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.azuka.forest} />
                  <Text style={[styles.loadingText, { color: theme.azuka.forest }]}>Designing your meal...</Text>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                   <TouchableOpacity 
                    style={[styles.actionBtn, styles.secondaryBtn, { borderColor: theme.azuka.forest }]}
                    onPress={handleSurpriseMe}
                  >
                    <Sparkles size={20} color={theme.azuka.forest} />
                    <Text style={[styles.btnText, { color: theme.azuka.forest }]}>Surprise Me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: theme.azuka.forest, opacity: ingredients.length > 0 ? 1 : 0.5 }]}
                    onPress={handleGenerate}
                    disabled={ingredients.length === 0}
                  >
                    <Text style={[styles.btnText, { color: 'white' }]}>Generate Recipe</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  keyboardView: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: { 
    height: '75%', 
    width: '100%',
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    overflow: 'hidden',
    paddingTop: 24,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    marginBottom: 24
  },
  title: { fontSize: 24, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  subtitle: { fontSize: 14, fontFamily: 'FunnelDisplay-Regular' },
  closeBtn: { padding: 8, borderRadius: 20 },
  scrollContent: { paddingHorizontal: 24 },
  introCard: { padding: 20, marginBottom: 24, alignItems: 'center' },
  cardText: { textAlign: 'center', fontSize: 14, lineHeight: 20, fontFamily: 'FunnelDisplay-Regular' },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12, fontFamily: 'FunnelDisplay-Bold' },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  input: { 
    flex: 1, 
    height: 50, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    fontSize: 16,
    fontFamily: 'FunnelDisplay-Regular'
  },
  addBtn: { 
    width: 50, 
    height: 50, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 100 },
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  chipText: { color: 'white', fontSize: 14, fontWeight: '600', fontFamily: 'FunnelDisplay-SemiBold' },
  emptyHint: { fontSize: 14, fontStyle: 'italic', width: '100%', textAlign: 'center', marginTop: 20 },
  footer: { 
    padding: 24, 
    borderTopWidth: 1, 
    paddingBottom: 40
  },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { 
    flex: 1, 
    height: 56, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8
  },
  secondaryBtn: { borderWidth: 1, backgroundColor: 'transparent' },
  primaryBtn: {},
  btnText: { fontSize: 16, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  loadingContainer: { alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16, fontWeight: '500', fontFamily: 'FunnelDisplay-Medium' }
});
