import { Stack, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {Ionicons} from "@expo/vector-icons"
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
  <Stack
  
  >
    <Stack.Screen name="index" options={{ headerShown: false }} />
  </Stack>
  );
}
