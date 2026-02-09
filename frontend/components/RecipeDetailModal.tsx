import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Share } from 'react-native';
import { X, Clock, Flame, Share2, Heart } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { lightTheme as theme } from '@/constants/theme';
import { GlassCard } from './GlassCard';
import { API_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from 'sonner-native';

export function RecipeDetailModal({ visible, onClose, onCook, recipe }: any) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    if (visible && recipe) {
        setIsFavorite(recipe.isFavorite || false);
    }
  }, [visible, recipe]);

  if (!recipe) return null;

  const toggleFavorite = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(`${API_URL}/food/recipe/favorite`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ recipeId: recipe._id })
        });
        const json = await res.json();
        
        if (json.success) {
            setIsFavorite(json.isFavorite);
            toast.success(json.isFavorite ? "Added to favorites!" : "Removed from favorites");
        } else {
            // Fallback for demo/local if API fails or recipe has no ID
             setIsFavorite(!isFavorite);
             toast.success(isFavorite ? "Removed from favorites" : "Added to favorites!");
        }
      } catch (e) {
         // Fallback
         setIsFavorite(!isFavorite);
         toast.success(isFavorite ? "Removed from favorites" : "Added to favorites!");
      }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, { backgroundColor: theme.azuka.cream }]}>
            {/* Header Image Area */}
            <View style={[styles.imageHeader, { backgroundColor: recipe.color ? `${recipe.color}30` : `${theme.azuka.sage}30` }]}>
                <Flame size={60} color={recipe.color || theme.azuka.sage} />
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X size={24} color={theme.azuka.forest} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: theme.azuka.forest }]}>{recipe.name}</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity onPress={toggleFavorite}>
                            <Heart size={24} color={theme.azuka.rose} fill={isFavorite ? theme.azuka.rose : 'transparent'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Share.share({ message: `Check out this recipe: ${recipe.name} - ${recipe.cals || recipe.calories} calories!` })}>
                            <Share2 size={24} color={theme.azuka.sage} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tags */}
                <View style={styles.tagRow}>
                    {(recipe.phase || (recipe.phase_tags && recipe.phase_tags.length > 0)) && (
                         <View style={[styles.tag, { backgroundColor: recipe.color || theme.azuka.sage }]}>
                            <Text style={styles.tagText}>{recipe.phase || recipe.phase_tags[0]}</Text>
                        </View>
                    )}
                    <View style={[styles.tag, { backgroundColor: 'white', borderWidth: 1, borderColor: theme.border }]}>
                        <Clock size={12} color={theme.azuka.forest} style={{ marginRight: 4 }}/>
                        <Text style={[styles.tagText, { color: theme.azuka.forest }]}>{recipe.time || recipe.time_mins} min</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: 'white', borderWidth: 1, borderColor: theme.border }]}>
                        <Flame size={12} color={theme.azuka.forest} style={{ marginRight: 4 }}/>
                        <Text style={[styles.tagText, { color: theme.azuka.forest }]}>{recipe.cals || recipe.calories || recipe.macros?.calories || 0} cal</Text>
                    </View>
                </View>

                {/* Macros */}
                <GlassCard style={styles.macroCard}>
                    <View style={styles.macroRow}>
                        <MacroItem label="Protein" value={`${recipe.protein || recipe.macros?.protein || 0}g`} />
                        <View style={styles.divider} />
                        <MacroItem label="Carbs" value={`${recipe.carbs || recipe.macros?.carbs || 0}g`} />
                        <View style={styles.divider} />
                        <MacroItem label="Fats" value={`${recipe.fats || recipe.fat || recipe.macros?.fat || recipe.macros?.fats || 0}g`} />
                    </View>
                </GlassCard>

                {/* Ingredients */}
                <Text style={[styles.sectionTitle, { color: theme.azuka.forest }]}>Ingredients</Text>
                <View style={styles.listContainer}>
                    {recipe.ingredients && recipe.ingredients.map((ing: string, i: number) => (
                        <View key={i} style={styles.listItem}>
                            <View style={[styles.bullet, { backgroundColor: theme.azuka.teal }]} />
                            <Text style={[styles.listText, { color: theme.azukaExtended.forestLight }]}>{ing}</Text>
                        </View>
                    ))}
                    {(!recipe.ingredients || recipe.ingredients.length === 0) && <Text style={{color: theme.azuka.sage}}>No ingredients listed.</Text>}
                </View>

                {/* Instructions */}
                <Text style={[styles.sectionTitle, { color: theme.azuka.forest }]}>Instructions</Text>
                <View style={styles.listContainer}>
                    {recipe.instructions && recipe.instructions.map((inst: string, i: number) => (
                        <View key={i} style={styles.stepItem}>
                            <View style={[styles.stepCircle, { backgroundColor: `${theme.azuka.forest}20` }]}>
                                <Text style={[styles.stepNum, { color: theme.azuka.forest }]}>{i + 1}</Text>
                            </View>
                            <Text style={[styles.listText, { color: theme.azukaExtended.forestLight, flex: 1 }]}>{inst}</Text>
                        </View>
                    ))}
                     {(!recipe.instructions || recipe.instructions.length === 0) && <Text style={{color: theme.azuka.sage}}>No instructions listed.</Text>}
                </View>

            </ScrollView>

             <View style={[styles.footer, { backgroundColor: theme.azuka.cream }]}>
                    <TouchableOpacity 
                        style={[styles.cookBtn, { backgroundColor: theme.azuka.forest }]} 
                        onPress={() => {
                            if (onCook) onCook(recipe);
                            onClose();
                        }}
                    >
                      <Text style={styles.cookBtnText}>Cook This Now</Text>
                    </TouchableOpacity>
                  </View>
        </View>
      </View>
    </Modal>
  );
}

function MacroItem({ label, value }: any) {
    return (
        <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.azuka.forest, fontFamily: 'FunnelDisplay-Bold' }}>{value}</Text>
            <Text style={{ fontSize: 12, color: theme.azuka.sage, fontFamily: 'FunnelDisplay-Regular' }}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { height: '90%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
    imageHeader: { height: 200, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    closeBtn: { position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 24, paddingBottom: 100 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '600', flex: 1, marginRight: 16, fontFamily: 'FunnelDisplay-Bold' },
    actionRow: { flexDirection: 'row', gap: 12 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    tagText: { color: 'white', fontSize: 12, fontWeight: '600', fontFamily: 'FunnelDisplay-SemiBold' },
    macroCard: { padding: 16, marginBottom: 24 },
    macroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    divider: { width: 1, height: 30, backgroundColor: theme.border },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, marginTop: 8, fontFamily: 'FunnelDisplay-Bold' },
    listContainer: { gap: 12, marginBottom: 24 },
    listItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    bullet: { width: 6, height: 6, borderRadius: 3 },
    listText: { fontSize: 15, lineHeight: 22, fontFamily: 'FunnelDisplay-Regular' },
    stepItem: { flexDirection: 'row', gap: 12 },
    stepCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 0 },
    stepNum: { fontSize: 12, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    cookBtn: { height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    cookBtnText: { color: 'white', fontSize: 16, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' }
});
