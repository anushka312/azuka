import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Dimensions, Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { toast } from 'sonner-native';

// Fonts
const fonts = {
  'FunnelDisplay-Light': require('../assets/fonts/FunnelDisplay-Light.ttf'),
  'FunnelDisplay-Regular': require('../assets/fonts/FunnelDisplay-Regular.ttf'),
  'FunnelDisplay-Medium': require('../assets/fonts/FunnelDisplay-Medium.ttf'),
  'FunnelDisplay-SemiBold': require('../assets/fonts/FunnelDisplay-SemiBold.ttf'),
  'FunnelDisplay-Bold': require('../assets/fonts/FunnelDisplay-Bold.ttf'),
  'FunnelDisplay-ExtraBold': require('../assets/fonts/FunnelDisplay-ExtraBold.ttf')
};

// Screen Components
import { AuthScreen } from '../components/screens/AuthScreen';
import { WelcomeScreen } from '../components/screens/WelcomeScreen';
import { OnboardingScreen } from '../components/screens/OnboardingScreen';
import { HomeScreen } from '../components/screens/HomeScreen';
import CalendarScreen from '../components/screens/CalendarScreen';
import WorkoutScreen from '../components/screens/WorkoutScreen';
import FoodScreen from '../components/screens/FoodScreen';
import MindsetScreen from '../components/screens/MindsetScreen';
import ForecastScreen from '../components/screens/ForecastScreen';
import { ProfileSidebar } from '../components/ProfileSidebar';

// UI Components
import { BottomNav } from '../components/BottomNav';
import { QuickLogModal } from '../components/QuickLogModal';

// Types
type Screen =
  | 'welcome'
  | 'auth'
  | 'onboarding'
  | 'home'
  | 'calendar'
  | 'workout'
  | 'food'
  | 'mindset'
  | 'forecast';
type Tab = 'home' | 'workout' | 'food' | 'mindset';

const { width, height } = Dimensions.get('window');

// Initial User Data
const initialUserData = {
  name: "Alicia M.",
  email: "alicia@example.com",
  age: "28",
  height: "165", // cm
  weight: "58", // kg
  activityLevel: "Moderately Active",
  cycleDay: 22,
  cycleLength: 28,
  goals: {
    primary: "Balance Hormones",
    secondary: "Increase Energy",
    target_weight: "55"
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // User Data State (Lifted)
  const [userData, setUserData] = useState(initialUserData);

  // --- Logic Handlers ---
  const handleGetStarted = () => setCurrentScreen('auth');
  const handleAuthComplete = () => setCurrentScreen('onboarding');
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
  const handleQuickLogSelect = (type: 'symptom' | 'workout' | 'food' | 'mood' | 'body') => {
    if (type === 'body') {
       toast.success('Body Stats Logged', { description: 'Weight and Height recorded for today.' });
    } else {
       toast.success(`Logged ${type}`, { description: 'Added to your daily log.' });
    }
    setShowQuickLog(false);
  };

  // --- Screen Switcher ---
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
      case 'auth':
        return <AuthScreen onLogin={handleAuthComplete} />;
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'home':
        return (
          <HomeScreen
            onOpenCalendar={handleOpenCalendar}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onLogSymptom={() => toast.info('Opening symptom logger...')}
            onLogWorkout={() => {
              toast.success('Navigating to Workout');
              handleTabChange('workout');
            }}
            onScanFood={() => {
              toast.success('Opening Food Scanner');
              handleTabChange('food');
            }}
          />
        );
      case 'calendar':
        return <CalendarScreen onBack={handleBackToHome} />;
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

  const hideNav = ['welcome', 'auth', 'onboarding', 'calendar', 'forecast'].includes(currentScreen);

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background Gradient using your theme colors */}
      <LinearGradient 
        colors={['#F1ECCE', '#F1ECCE']} 
        style={StyleSheet.absoluteFill} 
      />

      <View style={styles.screenContainer}>{renderScreen()}</View>

      {!hideNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onQuickLog={() => setShowQuickLog(true)}
        />
      )}

      <QuickLogModal
        isOpen={showQuickLog}
        onClose={() => setShowQuickLog(false)}
        onSelectType={handleQuickLogSelect}
      />

      <ProfileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userData={userData}
        onUpdateUserData={setUserData}
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