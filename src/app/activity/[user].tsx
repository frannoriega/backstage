import { User, userDb } from "@/services/db/users";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";

export default function UserScreen() {
  const { user: id, name, lastname } = useLocalSearchParams();
  const navigator = useNavigation();
  navigator.setOptions({
    title: `${name} ${lastname}`
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      setUser(await userDb.getUser(Number(id)))
      setLoading(false)
    }

    init()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View>
      <Text className="text-white">{user?.name} {user?.lastname}</Text>
      <Text className="text-white">{user?.state}</Text>
    </View>
  )
}
