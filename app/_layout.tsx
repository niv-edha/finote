import React, { useState } from 'react';
import Login from './login';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { TransactionProvider } from '../context/TransactionContext';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

// Safe icon getter for dynamic routes
function getTabIcon(name: string, focused: boolean): keyof typeof Ionicons.glyphMap {
  switch (name) {
    case 'history':
      return focused ? 'list' : 'list-outline';
    case 'index':
      return focused ? 'home' : 'home-outline';
    case 'add':
      return focused ? 'add-circle' : 'add-circle-outline';
    case 'charts':
      return focused ? 'pie-chart' : 'pie-chart-outline';
    default:
      return 'help-outline';
  }
}

const theme = {
  ...MD3LightTheme,
  roundness: 14,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6347f9',
    secondary: '#22d3ee',
    background: '#f3e8ff',
    cardBg: '#fffbfe',
    error: '#ff3f5a',
  },
};

export default function AppLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <PaperProvider theme={theme}>
      <TransactionProvider>
        <Tabs
          initialRouteName="history"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={getTabIcon(route.name, focused)} size={size} color={color} />
            ),
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { backgroundColor: 'white' },
            headerStyle: { backgroundColor: theme.colors.primary },
            headerTintColor: 'white',
          })}
        >
          {/* No component prop, just use file-based routing */}
          <Tabs.Screen name="history" options={{ title: 'History' }} />
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="add" options={{ title: 'Add' }} />
          <Tabs.Screen name="charts" options={{ title: 'Charts' }} />
        </Tabs>
        <Toast />
      </TransactionProvider>
    </PaperProvider>
  );
}
