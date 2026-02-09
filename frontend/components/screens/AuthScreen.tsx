import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme as theme } from '../../constants/theme';
import { PetalIcon } from '../icons/AzukaIcons';
import { GlassCard } from '../GlassCard';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowRight, Mail, Lock } from 'lucide-react-native';
import { auth } from '../../constants/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { API_URL } from '../../constants/config';

// const { width } = Dimensions.get('window');

interface AuthScreenProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function AuthScreen({ onLogin, onSignup }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        await AsyncStorage.setItem('userToken', token);
        // On success, Firebase updates auth.currentUser automatically
        onLogin();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        await AsyncStorage.setItem('userToken', token);
        
        // Sync with backend
        try {
          // IMPORTANT: We use the token to authenticate with our backend
          const syncRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              email: userCredential.user.email,
              firebaseUid: userCredential.user.uid,
              name: email.split('@')[0]
            })
          });

          const syncJson = await syncRes.json();
          // console.log("Backend Signup Sync:", syncJson);
          
          if (!syncRes.ok) {
             console.error("Backend Sync Failed", syncJson);
          }
        } catch (syncErr) {
           console.error("Backend Connection Error during Signup", syncErr);
           // Don't block the user if backend sync fails (we can retry or they can fix in onboarding)
        }
        // -------------------------

        // On success, we navigate to onboarding
        onSignup();
      }
    } catch (error: any) {
      console.error("Auth Error", error);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = 'That email address is already in use!';
      if (error.code === 'auth/invalid-email') msg = 'That email address is invalid!';
      if (error.code === 'auth/user-not-found') msg = 'User not found. Please sign up.';
      if (error.code === 'auth/wrong-password') msg = 'Invalid password.';
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View entering={FadeInUp.duration(800).springify()}>
          <View style={styles.header}>
            <PetalIcon size={60} color={theme.azuka.rose} />
            <Text style={styles.title}>azuka</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(200).springify()}>
          <View style={styles.formContainer}>
            <GlassCard style={styles.card}>
              <Text style={styles.welcomeText}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Sign in to continue your cycle syncing journey' : 'Start your biological intelligence journey today'}
            </Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={theme.azuka.teal} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={theme.azuka.teal}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={theme.azuka.teal} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={theme.azuka.teal}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.mainBtn} 
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.mainBtnText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                  <ArrowRight size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loading}>
              {/* Dummy Google G Icon */}
              <View style={styles.gIcon}>
                 <Text style={{fontSize: 18, fontWeight: 'bold', color: '#4285F4'}}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Google</Text>
            </TouchableOpacity>

          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchAuthText}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 18 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: {
    fontSize: 42,
    color: theme.azuka.teal,
    fontFamily: 'FunnelDisplay-Bold',
  },
  formContainer: { width: '100%' },
  card: { padding: 10, borderRadius: 32 },
  welcomeText: {
    fontSize: 28,
    color: theme.azuka.forest,
    fontFamily: 'FunnelDisplay-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.azuka.forest,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'FunnelDisplay-Regular',
  },
  inputGroup: { gap: 16, marginBottom: 10 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(131, 150, 95, 0.1)',
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.azuka.forest,
    fontFamily: 'FunnelDisplay-Regular',
    height: '100%',
  },
  mainBtn: {
    marginTop: 8,
    backgroundColor: theme.azuka.sage,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: theme.azuka.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainBtnText: {
    color: theme.azuka.cream,
    fontSize: 18,
    fontFamily: 'FunnelDisplay-Bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    gap: 12,
  },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(131, 150, 95, 0.2)' },
  orText: {
    color: theme.azuka.sage,
    fontSize: 12,
    fontFamily: 'FunnelDisplay-Regular',
  },
  googleBtn: {
    backgroundColor: '#FFF',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  gIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    color: '#1C3927',
    fontSize: 16,
    fontFamily: 'FunnelDisplay-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  footerText: {
    color: theme.azuka.sage,
    fontSize: 14,
    fontFamily: 'FunnelDisplay-Regular',
  },
  switchAuthText: {
    color: theme.azuka.forest,
    fontSize: 14,
    fontFamily: 'FunnelDisplay-Bold',
  },
});
