import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, StatusBar, Text as RNText, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../constants/firebaseConfig';
import { signOut } from 'firebase/auth';
import { API_URL } from '../constants/config';

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
import { ErrorBoundary } from '../components/ErrorBoundary';

// Fonts
// const fonts = {
//   'FunnelDisplay-Light': require('../assets/fonts/FunnelDisplay-Light.ttf'),
//   'FunnelDisplay-Regular': require('../assets/fonts/FunnelDisplay-Regular.ttf'),
//   'FunnelDisplay-Medium': require('../assets/fonts/FunnelDisplay-Medium.ttf'),
//   'FunnelDisplay-SemiBold': require('../assets/fonts/FunnelDisplay-SemiBold.ttf'),
//   'FunnelDisplay-Bold': require('../assets/fonts/FunnelDisplay-Bold.ttf'),
//   'FunnelDisplay-ExtraBold': require('../assets/fonts/FunnelDisplay-ExtraBold.ttf')
// };

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

// const { width, height } = Dimensions.get('window');

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
    target_weight: "55",
    start_weight: "60"
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // User Data State (Lifted)
  const [userData, setUserData] = useState(initialUserData);
  const [isLoading, setIsLoading] = useState(true);

  // --- Initial Auth Check ---
  const checkUserSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Fetch fresh profile with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        try {
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal
          });
          
          const json = await response.json();
          if (json.success) {
            setUserData(json.result);
            
            // Fix: Check onboarding status
            if (!json.result.isOnboarded) {
                setCurrentScreen('onboarding');
            } else {
                if (currentScreen !== 'onboarding') { // Don't interrupt if already there
                  setCurrentScreen('home'); 
                }
            }
          }
        } finally {
          clearTimeout(timeoutId);
        }
      }
    } catch (error) {
      console.error("Session Check Failed", error);
    } finally {
      // Small delay to prevent flash
      setTimeout(() => setIsLoading(false), 500);
    }
  }, []); // Remove currentScreen dependency to prevent loops

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // --- Logic Handlers ---
  const handleGetStarted = () => setCurrentScreen('auth');
  const handleAuthComplete = () => {
     checkUserSession(); // Refresh profile after login
     setCurrentScreen('home'); // Login -> Home
  };
  const handleSignupComplete = () => {
     checkUserSession(); // Refresh profile after signup (to get user data for onboarding if needed)
     setCurrentScreen('onboarding'); // Signup -> Onboarding
  };
  const handleOnboardingComplete = () => {
    checkUserSession(); 
    setCurrentScreen('home');
  };
  const handleLogout = async () => {
    try {
      console.log("Initiating Logout...");
      await signOut(auth);
      console.log("Firebase Signout Complete");
    } catch (e) {
      console.log("Firebase Signout Error (Non-fatal)", e);
    }
    await AsyncStorage.removeItem('userToken');
    console.log("User Token Removed");
    
    setUserData(initialUserData);
    setIsSidebarOpen(false);
    setCurrentScreen('welcome');
    toast.success('Logged Out');
  };
  const handleOpenCalendar = () => setCurrentScreen('calendar');
  // const handleOpenForecast = () => setCurrentScreen('forecast');
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
  };
  const handleBackToHome = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };
  const handleQuickLogSelect = async (type: 'symptom' | 'workout' | 'food' | 'mood' | 'body') => {
    setShowQuickLog(false);
    
    // Optimistic UI updates could go here
    const today = new Date().toISOString();
    let apiType = type;
    let apiData = {};

    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      switch(type) {
        case 'workout':
          // For quick log, we assume a generic manual workout if not detailed
          // In a real app, this might open a detailed modal first
          apiData = { workoutType: 'Quick Workout', duration: 30, notes: 'Quick logged' };
          toast.success("Log Workout", { description: "Logging quick workout..." });
          break;
        case 'food':
          toast.success("Log Nutrition", { description: "Opening food scanner..." });
          handleTabChange('food');
          return; // Navigate only
        case 'mood':
          apiData = { mood: 85, moodLabel: 'Good', note: 'Quick check-in' }; // Default for quick button
          toast.success("Mindset Check-in", { description: "Logged 'Good' mood." });
          break;
        case 'symptom':
          // Navigate to calendar for detailed symptom logging
          setCurrentScreen('calendar');
          toast.info("Select a day to log symptoms");
          return;
        case 'body':
          setIsSidebarOpen(true);
          toast.info("Update your metrics in Profile");
          return;
      }

      // Perform API Call for direct logs (workout, mood)
      if (['workout', 'mood'].includes(type)) {
         const response = await fetch(`${API_URL}/calendar/log`, {
           method: 'POST',
           headers: headers,
           body: JSON.stringify({
             date: today,
             type: apiType,
             data: apiData
           })
         });
         
         const json = await response.json();
         if (!json.success) throw new Error(json.message);
      }

    } catch (error) {
      console.error("Quick Log Error", error);
      toast.error("Failed to log", { description: "Please try again." });
    }
  };

  // --- Screen Switcher ---
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
      case 'auth':
        return <AuthScreen onLogin={handleAuthComplete} onSignup={handleSignupComplete} />;
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

  if (isLoading) {
    return (
      <View style={[styles.outerContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1ECCE' }]}>
        <ActivityIndicator size="large" color="#1C3927" />
        <RNText style={{ marginTop: 20, fontFamily: 'FunnelDisplay-Medium', color: '#1C3927' }}>Loading Azuka...</RNText>
      </View>
    );
  }

  return (
    <ErrorBoundary>
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
          onLogout={handleLogout}
        />
      </View>
    </ErrorBoundary>
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