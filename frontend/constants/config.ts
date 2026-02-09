import { Platform } from 'react-native';

// This is your computer's IP from ipconfig 
const DEV_IP = '10.164.15.184';  
const PORT = '5000'; 

export const API_URL = Platform.select({ 
  // iOS Simulators can use localhost 
  ios: `http://localhost:${PORT}/api`, 
   
  // Android (both Emulator and Physical Device) works best with the specific IP 
  // Note: 10.0.2.2 only works for Emulators, so the DEV_IP is safer for your setup 
  android: `http://${DEV_IP}:${PORT}/api`, 
   
  default: `http://localhost:${PORT}/api`, 
}); 

console.log(`[API] Configuring endpoint: ${API_URL}`);
