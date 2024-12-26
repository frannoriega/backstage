import { State, User, userDb } from "@/services/db/users";
import { Col, Grid, Row } from "react-native-easy-grid";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserScreen() {
  const { user: id, name, lastname } = useLocalSearchParams();
  const navigator = useNavigation();
  navigator.setOptions({
    title: `Actividad del usuario`
  })
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      setUser(await userDb.getUser(Number(id)))
    }

    init()
  }, [])

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View className="w-full flex flex-col p-4 gap-8">
      <Text className="text-2xl">Información del usuario</Text>
      <View className="flex flex-col">
        <DataRow user={user} render={(user) => `${user.name} ${user.lastname}`}>Nombre</DataRow>
        <DataRow user={user} render={(user) => user.dni}>DNI</DataRow>
        <DataRow user={user} render={(user) => user.role}>Rol</DataRow>
        { user.group && <DataRow user={user} render={(user) => user.group}>Grupo</DataRow>}
        <DataRow user={user} render={(user) => user.phone}>Telefono</DataRow>
      </View>
      <Text className="text-2xl">Última ubicación registrada</Text>
        <Text className="text-xl">{getState(user)}</Text>
    </View>
  )
}

function DataRow({ user, children, render }: { user: User, render: (user: User) => ReactNode } & React.ComponentProps<"div">) {
  return (
    <View className="flex flex-row justify-between">
      <Text className="p-4 text-xl border border-slate-700 w-1/3">{children}</Text>
      <Text className="p-4 text-xl border border-slate-700 w-2/3">{render(user)}</Text>
    </View>
  )
}

function getState(user: User): string {
  switch (user.state.state) {
    case State.FIELD:
      return "Campo"
    case State.OUTSIDE:
      return "Afuera"
    case State.CHECKPOINT:
      return "Cinta fáctica"
    case State.BACKSTAGE:
      return "Backstage (Zona A)"
    case State.BAND:
      return "Backstage (Zona B)"
  }
}
