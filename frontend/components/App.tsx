import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context'; 

// AND REMOVE SafeAreaView from the 'react-native' import line

// Screen Components - Fixed to use Default Imports
import {WelcomeScreen} from '../components/screens/WelcomeScreen';
import {OnboardingScreen } from '../components/screens/OnboardingScreen';
import{ HomeScreen } from '../components/screens/HomeScreen';
import CalendarScreen from '../components/screens/CalendarScreen';
import WorkoutScreen from '../components/screens/WorkoutScreen';
import FoodScreen from '../components/screens/FoodScreen';
import MindsetScreen from '../components/screens/MindsetScreen';
import ForecastScreen from '../components/screens/ForecastScreen';

// UI Components
import { BottomNav } from '../components/BottomNav';
import { QuickLogModal } from '../components/QuickLogModal';
import { toast } from "sonner-native"; // Make sure to import toast if you use it in handleQuickLogSelect

// Types
type Screen = 'welcome' | 'onboarding' | 'home' | 'calendar' | 'workout' | 'food' | 'mindset' | 'forecast';
type Tab = 'home' | 'workout' | 'food' | 'mindset';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showQuickLog, setShowQuickLog] = useState(false);

  // --- Logic Handlers ---
  const handleGetStarted = () => setCurrentScreen('onboarding');
  const handleOnboardingComplete = () => setCurrentScreen('home');
  const handleOpenCalendar = () => setCurrentScreen('calendar');
  const handleOpenForecast = () => setCurrentScreen('forecast');

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handleQuickLogSelect = (type: 'symptom' | 'workout' | 'food' | 'mood') => {
    console.log('Quick log native:', type);
    toast.success(`Logged ${type}`, { description: "Added to your daily log." });
    setShowQuickLog(false);
  };

  // --- Screen Switcher ---
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'home':
        return (
          <HomeScreen
            onOpenCalendar={handleOpenCalendar}
            onLogSymptom={() => toast.info("Opening symptom logger...")}
            onLogWorkout={() => {
              toast.success("Navigating to Workout");
              handleTabChange('workout');
            }}
            onScanFood={() => {
              toast.success("Opening Food Scanner");
              handleTabChange('food');
            }}
          />
        );
      case 'calendar':
        return <CalendarScreen onClose={handleBackToHome} />;
      case 'forecast':
        return <ForecastScreen onBack={handleBackToHome} />;
      case 'workout':
        return <WorkoutScreen />;
      case 'food':
        return <FoodScreen />;
      case 'mindset':
        return <MindsetScreen />;
      default:
        return null;
    }
  };

  // Check if we should show the BottomNav
  const hideNav = ['welcome', 'onboarding', 'calendar', 'forecast'].includes(currentScreen);

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F1ECCE', '#EEEDD1']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      {!hideNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onQuickLog={() => setShowQuickLog(true)}
        />
      )}

      {/* Quick Log Modal Overlay */}
      <QuickLogModal
        isOpen={showQuickLog}
        onClose={() => setShowQuickLog(false)}
        onSelectType={handleQuickLogSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});