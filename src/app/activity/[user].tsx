import { State, User, userDb } from "@/services/db/users";
import { Col, Grid, Row } from "react-native-easy-grid";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityInfo, activityDb } from "@/services/db/activity";

export default function UserScreen() {
  const { user: id, name, lastname } = useLocalSearchParams();
  const navigator = useNavigation();
  navigator.setOptions({
    title: `Actividad del usuario`
  })
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<ActivityInfo[]>([])

  useEffect(() => {
    const init = async () => {
      setUser(await userDb.getUser(Number(id)))
      setActivity(await activityDb.getActivity(Number(id)))
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
      <Text className="text-2xl">Última ubicación registrada</Text>
      <Text className="text-xl">{getState(user)}</Text>
      <Text className="text-2xl">Información del usuario</Text>
      <View className="flex flex-col">
        <DataRow user={user} render={(user) => `${user.name} ${user.lastname}`}>Nombre</DataRow>
        <DataRow user={user} render={(user) => user.dni}>DNI</DataRow>
        <DataRow user={user} render={(user) => user.role}>Rol</DataRow>
        {user.group && <DataRow user={user} render={(user) => user.group}>Grupo</DataRow>}
        <DataRow user={user} render={(user) => user.phone}>Telefono</DataRow>
        <DataRow last user={user} render={(user) => user.email}>Email</DataRow>
      </View>
      <Text className="text-2xl">Actividad reciente</Text>
      <View className="flex flex-col">
        <View className="flex flex-row">
          <Text className="w-1/4 text-center text-bold">Fecha</Text>
          <Text className="w-1/4 text-center text-bold">Movimiento</Text>
          <Text className="w-1/4 text-center text-bold">Puerta</Text>
          <Text className="w-1/4 text-center text-bold">Controlado por</Text>
        </View>
        <FlatList
          className="border border-b-0 border-slate-700"
          data={activity}
          renderItem={({ item }) => (
            <View className="flex flex-row items-center justify-center">
              <Text className="w-1/4 text-center text-bold h-full align-middle border-b border-slate-700">{formatDate(new Date(item.created_at))}</Text>
              <Text className="w-1/4 text-center text-bold h-full align-middle border-b border-l border-slate-700">{formatMovement(item.movement)}</Text>
              <Text className="w-1/4 text-center text-bold h-full align-middle border-b border-l border-slate-700">{item.gate}</Text>
              <Text className="w-1/4 text-center text-bold h-full align-middle border-b border-l border-slate-700">{item.controller.name} {item.controller.lastname}</Text>
            </View>
          )}
        />
      </View>
    </View>
  )
}

function DataRow({ user, children, render, last = false }: { user: User, render: (user: User) => ReactNode, last?: boolean } & React.ComponentProps<"div">) {
  return (
    <View className="flex flex-row justify-between">
      <Text className={`p-4 text-xl border border-slate-700 w-1/3 border-r-0 ${!last && 'border-b-0'}`}>{children}</Text>
      <Text className={`p-4 text-xl border border-slate-700 w-2/3 ${!last && 'border-b-0'}`}>{render(user)}</Text>
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

function formatDate(date: Date): string {
  return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth()}`
}

function formatMovement(movement: 'INGRESS' | 'EGRESS'): string {
  switch (movement) {
    case "INGRESS":
      return "Ingreso"
    case "EGRESS":
      return "Egreso"
  }
}
