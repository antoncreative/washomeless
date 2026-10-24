import type { ColorValue } from 'react-native'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '@/theme'
import { useStore } from '@/store'
import { useAuth } from '@/auth'

type IconName = React.ComponentProps<typeof Ionicons>['name']

const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />
  }

export default function TabLayout() {
  const { supporting } = useStore()
  const { canPost } = useAuth()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: icon('compass') }} />
      <Tabs.Screen
        name="circle"
        options={{
          title: 'My Circle',
          tabBarIcon: icon('heart'),
          tabBarBadge: supporting.length > 0 ? supporting.length : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{ title: 'My Journey', tabBarIcon: icon('sparkles'), href: canPost ? undefined : null }}
      />
      <Tabs.Screen name="activity" options={{ title: 'Activity', tabBarIcon: icon('notifications') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person-circle') }} />
    </Tabs>
  )
}
