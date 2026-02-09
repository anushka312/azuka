// themes.ts

export const lightTheme = {
  fontSize: '16px',

  // Azuka Primary Palette
  azuka: {
    forest: '#1C3927',
    sage: '#83965F',
    cream: '#F1ECCE',
    rose: '#BB8585',
    teal: '#29555F',
  },

  // Azuka Extended Palette
  azukaExtended: {
    sageLight: '#A8A383',
    sageLighter: '#D7CE93',
    creamLight: '#F1ECCE',
    roseLight: '#D9A691',
    roseDark: '#BB8585',
    tealLight: '#4E7B85',
    tealLighter: '#8EB1B8',
    tealDark: '#1B3A42',
    /* Added Forest Extensions */
    forestLight: '#3E5C41',   /* Lighter evergreen for secondary buttons */
    forestLighter: '#7B937D', /* Muted, misty moss for cards/backgrounds */
    forestDark: '#0E1F15',    /* Deep obsidian-forest for typography */
},

  // Phase Colors
  phase: {
    menstrual: '#BB8585', // azuka-rose
    ovulatory: '#29555F', // azuka-teal
    recovery: '#83965F', // azuka-sage
  },

  // Backgrounds
  background: '#F1ECCE',
  foreground: '#1C3927',

  // Components
  card: 'rgba(255, 255, 255, 0.45)',
  cardForeground: '#1C3927',
  popover: 'rgba(255, 255, 255, 0.95)',
  popoverForeground: '#1C3927',
  primary: '#29555F',
  primaryForeground: '#ffffff',
  secondary: '#83965F',
  secondaryForeground: '#ffffff',
  muted: '#F1ECCE',
  mutedForeground: '#A8A383',
  accent: '#D9A691',
  accentForeground: '#1C3927',
  destructive: '#d4183d',
  destructiveForeground: '#ffffff',
  border: 'rgba(131, 150, 95, 0.2)',
  input: 'transparent',
  inputBackground: 'rgba(255, 255, 255, 0.7)',
  switchBackground: '#A8A383',
  ring: '#83965F',
  fontWeightMedium: 500,
  fontWeightNormal: 400,
  chart: ['#BB8585', '#29555F', '#83965F', '#D9A691', '#D7CE93'],
  radius: '1rem',

  sidebar: {
    background: 'rgba(255, 255, 255, 0.8)',
    foreground: '#1C3927',
    primary: '#29555F',
    primaryForeground: '#ffffff',
    accent: 'rgba(255, 255, 255, 0.6)',
    accentForeground: '#1C3927',
    border: 'rgba(131, 150, 95, 0.2)',
    ring: '#83965F',
  },
};

export const darkTheme = {
  background: 'oklch(0.145 0 0)',
  foreground: 'oklch(0.985 0 0)',
  card: 'oklch(0.145 0 0)',
  cardForeground: 'oklch(0.985 0 0)',
  popover: 'oklch(0.145 0 0)',
  popoverForeground: 'oklch(0.985 0 0)',
  primary: 'oklch(0.985 0 0)',
  primaryForeground: 'oklch(0.205 0 0)',
  secondary: 'oklch(0.269 0 0)',
  secondaryForeground: 'oklch(0.985 0 0)',
  muted: 'oklch(0.269 0 0)',
  mutedForeground: 'oklch(0.708 0 0)',
  accent: 'oklch(0.269 0 0)',
  accentForeground: 'oklch(0.985 0 0)',
  destructive: 'oklch(0.396 0.141 25.723)',
  destructiveForeground: 'oklch(0.637 0.237 25.331)',
  border: 'oklch(0.269 0 0)',
  input: 'oklch(0.269 0 0)',
  ring: 'oklch(0.439 0 0)',
  fontWeightMedium: 500,
  fontWeightNormal: 400,
  chart: [
    'oklch(0.488 0.243 264.376)',
    'oklch(0.696 0.17 162.48)',
    'oklch(0.769 0.188 70.08)',
    'oklch(0.627 0.265 303.9)',
    'oklch(0.645 0.246 16.439)',
  ],
  sidebar: {
    background: 'oklch(0.205 0 0)',
    foreground: 'oklch(0.985 0 0)',
    primary: 'oklch(0.488 0.243 264.376)',
    primaryForeground: 'oklch(0.985 0 0)',
    accent: 'oklch(0.269 0 0)',
    accentForeground: 'oklch(0.985 0 0)',
    border: 'oklch(0.269 0 0)',
    ring: 'oklch(0.439 0 0)',
  },

  fontSize: '16px',
  
  // Azuka Primary Palette
  azuka: {
    forest: '#1C3927',
    sage: '#83965F',
    cream: '#F1ECCE',
    rose: '#BB8585',
    teal: '#29555F',
  },

  // Azuka Extended Palette
  azukaExtended: {
    sageLight: '#A8A383',
    sageLighter: '#D7CE93',
    creamLight: '#F1ECCE',
    roseLight: '#D9A691',
    roseDark: '#BB8585',
    tealLight: '#4E7B85',
    tealLighter: '#8EB1B8',
    tealDark: '#1B3A42',
    forestLight: '#3E5C41',
    forestLighter: '#7B937D',
    forestDark: '#0E1F15',
  },

  // Phase Colors
  phase: {
    menstrual: '#BB8585',
    ovulatory: '#29555F',
    recovery: '#83965F',
  },
  
  radius: '1rem',
};

export const Colors = {
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = typeof lightTheme;
