import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { StoreProvider } from '@/store'
import { colors } from '@/theme'

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg }, headerTintColor: colors.primary }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="person/[id]" options={{ title: '', headerTransparent: true, headerBackTitle: 'Back' }} />
        <Stack.Screen
          name="support/[id]"
          options={{
            presentation: 'formSheet',
            headerShown: false,
            sheetAllowedDetents: [0.75, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
          }}
        />
      </Stack>
    </StoreProvider>
  )
}
