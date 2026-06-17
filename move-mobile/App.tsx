import 'react-native-gesture-handler';
import React from 'react';
import { I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { NutritionProvider } from './src/store/nutritionContext';
import { RootNavigator } from './src/navigation/RootNavigator';

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
}

export default function App() {
  return (
    <ThemeProvider>
      <NutritionProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </NutritionProvider>
    </ThemeProvider>
  );
}
