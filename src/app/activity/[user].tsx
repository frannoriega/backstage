import { State, User, userDb } from "@/services/db/users";
import { Col, Grid, Row } from "react-native-easy-grid";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View, Text, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityInfo, activityDb } from "@/services/db/activity";

export default function UserScreen() {
  const { user: id } = useLocalSearchParams();
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
    <ScrollView className="w-full">
      <View className="w-full flex flex-col pb-4 gap-8">
        <Text className="text-2xl bg-blue-200 p-4">Última ubicación registrada</Text>
        <Text className="text-2xl w-full text-center font-bold">{getState(user)}</Text>
        <Text className="text-2xl bg-blue-200 p-4">Información del usuario</Text>
        <View className="flex flex-col px-4">
          <DataRow user={user} render={(user) => `${user.name} ${user.lastname}`}>Nombre</DataRow>
          <DataRow user={user} render={(user) => user.dni}>DNI</DataRow>
          <DataRow user={user} render={(user) => user.role}>Rol</DataRow>
          {user.group && <DataRow user={user} render={(user) => user.group}>Grupo</DataRow>}
          <DataRow user={user} render={(user) => user.phone}>Telefono</DataRow>
          <DataRow last user={user} render={(user) => user.email}>Email</DataRow>
        </View>
        <Text className="text-2xl bg-blue-200 p-4">Actividad reciente</Text>
        <View className="flex flex-col px-4">
          <View className="flex flex-row">
            <Text className="w-1/4 text-center">Fecha</Text>
            <Text className="w-1/4 text-center">Movimiento</Text>
            <Text className="w-1/4 text-center">Puerta</Text>
            <Text className="w-1/4 text-center">Controlado por</Text>
          </View>
          {activity.map(a => (
            <View key={a.created_at} className="border border-b-0 border-slate-700 flex flex-row items-center justify-center">
              <Text className="w-1/4 text-center h-full align-middle border-b border-slate-700">{formatDate(new Date(a.created_at))}</Text>
              <Text className="w-1/4 text-center h-full align-middle border-b border-l border-slate-700">{formatMovement(a.movement)}</Text>
              <Text className="w-1/4 text-center h-full align-middle border-b border-l border-slate-700">{a.gate}</Text>
              <Text className="w-1/4 text-center h-full align-middle border-b border-l border-slate-700">{a.controller.name} {a.controller.lastname}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

function DataRow({ user, children, render, last = false }: { user: User, render: (user: User) => ReactNode, last?: boolean } & React.ComponentProps<"div">) {
  return (
    <View className="flex flex-row justify-between">
      <Text className={`bg-blue-200 p-4 text-xl border border-slate-700 w-1/3 border-r-0 ${!last && 'border-b-0'}`}>{children}</Text>
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
      return "Cinta asfáltica"
    case State.BACKSTAGE:
      return "Backstage (Zona A)"
    case State.BAND:
      return "Backstage (Zona B)"
  }
}

function formatDate(date: Date): string {
  const localTime = date
  localTime.setHours(localTime.getHours() - 3)
  return `${localTime.getHours()}:${localTime.getMinutes()} ${localTime.getDate()}/${localTime.getMonth()}`
}

function formatMovement(movement: 'INGRESS' | 'EGRESS'): string {
  switch (movement) {
    case "INGRESS":
      return "Ingreso"
    case "EGRESS":
      return "Egreso"
  }
}
