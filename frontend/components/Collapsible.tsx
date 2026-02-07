import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';

// Important: Enable animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function Collapsible({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    // Presets.easeInEaseOut creates the smooth native sliding effect
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggle} style={styles.header} activeOpacity={0.7}>
        <Text style={styles.title}>{title}</Text>
        {isOpen ? <ChevronDown size={18} color="#83965F" /> : <ChevronRight size={18} color="#83965F" />}
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C3927',
    fontFamily: 'FunnelDisplay-SemiBold',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  }
});