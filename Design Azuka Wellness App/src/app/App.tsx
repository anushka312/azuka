import React, { useState } from 'react';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { WorkoutScreen } from './components/screens/WorkoutScreen';
import { FoodScreen } from './components/screens/FoodScreen';
import { MindsetScreen } from './components/screens/MindsetScreen';
import { ForecastScreen } from './components/screens/ForecastScreen';
import { BottomNav } from './components/BottomNav';
import { QuickLogModal } from './components/QuickLogModal';
import { AnimatePresence, motion } from 'motion/react';

type Screen = 'welcome' | 'onboarding' | 'home' | 'calendar' | 'workout' | 'food' | 'mindset' | 'forecast';
type Tab = 'home' | 'workout' | 'food' | 'mindset';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showQuickLog, setShowQuickLog] = useState(false);

  const handleGetStarted = () => {
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('home');
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
  };

  const handleOpenCalendar = () => {
    setCurrentScreen('calendar');
  };

  const handleOpenForecast = () => {
    setCurrentScreen('forecast');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handleQuickLogSelect = (type: 'symptom' | 'workout' | 'food' | 'mood') => {
    console.log('Quick log:', type);
    // In a real app, this would open specific logging screens
  };

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
            onLogSymptom={() => console.log('Log symptom')}
            onLogWorkout={() => console.log('Log workout')}
            onScanFood={() => console.log('Scan food')}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1ECCE] to-[#F1ECCE]">
      {/* Mobile container */}
      <div className="max-w-md mx-auto min-h-screen relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation (hidden on welcome/onboarding/calendar/forecast screens) */}
        {currentScreen !== 'welcome' && 
         currentScreen !== 'onboarding' && 
         currentScreen !== 'calendar' && 
         currentScreen !== 'forecast' && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onQuickLog={() => setShowQuickLog(true)}
          />
        )}

        {/* Quick Log Modal */}
        <QuickLogModal
          isOpen={showQuickLog}
          onClose={() => setShowQuickLog(false)}
          onSelectType={handleQuickLogSelect}
        />
      </div>
    </div>
  );
}