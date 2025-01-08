import { Role, UserId, userDb } from "@/services/db/users";
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { router } from "expo-router";
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RollInLeft } from "react-native-reanimated";
import SearchBar from "@/components/searchbar";
import ErrorModal from "@/components/error";

export default function Activity() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<UserId[]>([])
  const [page, setPage] = useState(0)
  const [next, setNext] = useState(false)
  const [prev, setPrev] = useState(false)
  const [filterInput, setFilterInput] = useState<Role[]>([])
  const [searchInput, setSearchInput] = useState("")

  useEffect(() => {
    const init = async () => {
      setError(null)
      const users = await userDb.getUsers(page, filterInput, searchInput).catch(_ => {
        return {
          data: [],
          next: false,
          prev: false
        }
      })
      let mock = []
      for (let i = 0; i < 1300; i++) {
        mock.push({ id: i, name: `name ${i}`, lastname: `lastname ${i}`, dni: i, role: Role.A })
      }
      setUsers(users.data)
      setNext(users.next)
      setPrev(users.prev)
    }

    init()
      .catch(e => setError(e.stack))
      .finally(() => setLoading(false))
  }, [filterInput, searchInput, page])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex flex-col h-full w-full items-center justify-center p-4 bg-black">
        <ErrorModal stacktrace={error} />
      </View>
    )
  }


  function goToUser(user: UserId) {
    router.push({
      pathname: "/activity/[user]",
      params: {
        user: user.id,
      }
    })
  }

  function search(text: string) {
    setPage(0)
    setSearchInput(text)
  }

  function filter(roles: Role[]) {
    setPage(0)
    setFilterInput(roles)
  }

  return (
    <SafeAreaView className="flex-1 flex-col items-center">
      <View className="w-full">
        <SearchBar onSearch={search} onFilter={filter} />
      </View>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <Pressable key={item.dni} className="w-full p-4 border-gray-200 border flex flex-row items-center justify-between" onPress={() => goToUser(item)}>
            <View className="flex flex-col justify-between">
              <Text>{item.name} {item.lastname}</Text>
              <Text className="text-gray-500">DNI: {item.dni}</Text>
            </View>
            <ChevronRight size={24} color="#6b7280" />
          </Pressable>
        )}
      />
      <View className="flex flex-row items-center justify-center py-3 border-t border-gray-700 w-full">
        <Pressable onPress={() => setPage(p => p - 1)} className={`${prev ? "visible" : "invisible"}`} disabled={!prev}>
          <ChevronLeft size={34} color='black' />
        </Pressable>
        <Text className="p-4 rounded-xl text-xl">{page + 1}</Text>
        {<Pressable onPress={() => setPage(p => p + 1)} className={`${next ? "visible" : "invisible"}`} disabled={!next}>
          <ChevronRight size={34} color='black' />
        </Pressable>
        }
      </View>
    </SafeAreaView>
  );
}
