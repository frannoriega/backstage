import { UserId, userDb } from "@/services/db/users";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";

export default function Activity() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserId[]>([])

  useEffect(() => {
    const init = async () => {
      const users = await userDb.getUsers()
      setUsers(users)
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

  function goToUser(id: number) {
    router.push({
      pathname: "/security/activity/[user]",
      params: {
        user: id
      }
    })
  }

  return (
    <View className="flex-1">
      {users.map(u => (
        <Pressable key={u.id} className="p-4" onPress={() => goToUser(u.id)}>
          <Text className="text-white">{u.name} {u.lastname}</Text>
        </Pressable>
      ))}
    </View>
  );
}
