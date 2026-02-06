import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { QuickLogModal } from '../../components/QuickLogModal';
import { toast } from 'sonner-native';

export default function TabLayout() {
  const [showQuickLog, setShowQuickLog] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, 
        }}
        tabBar={(props) => {
          const routeName = props.state.routes[props.state.index].name;
          const activeTab = routeName === 'index' ? 'home' : routeName;
          
          return (
            <BottomNav
              activeTab={activeTab as any}
              onTabChange={(tab) => {
                const route = tab === 'home' ? 'index' : tab;
                props.navigation.navigate(route);
              }}
              onQuickLog={() => setShowQuickLog(true)}
            />
          );
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="workout" />
        <Tabs.Screen name="food" />
        <Tabs.Screen name="mindset" />
      </Tabs>

      {/* MODAL FIX: The Modal is placed here to overlay everything in the tabs */}
      <QuickLogModal
        isOpen={showQuickLog}
        onClose={() => setShowQuickLog(false)}
        onSelectType={(type) => toast.success(`Logged ${type}`)}
      />
    </View>
  );
}