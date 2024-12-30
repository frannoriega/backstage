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
        <View className="flex flex-col gap-0 mx-4 rounded-xl bg-white overflow-hidden" style={{ elevation: 1 }}>
          <DataRow user={user} render={(user) => `${user.name} ${user.lastname}`}>Nombre</DataRow>
          <DataRow user={user} render={(user) => user.dni}>DNI</DataRow>
          <DataRow user={user} render={(user) => user.role}>Rol</DataRow>
          {user.group && <DataRow user={user} render={(user) => user.group}>Grupo</DataRow>}
          <DataRow user={user} render={(user) => user.phone}>Telefono</DataRow>
          <DataRow user={user} render={(user) => user.email}>Email</DataRow>
        </View>
        <Text className="text-2xl bg-blue-200 p-4">Actividad reciente</Text>
        <View className="flex flex-col px-4 gap-2">
          <View className="flex flex-row">
            <Text className="w-1/4 text-center">Fecha</Text>
            <Text className="w-1/4 text-center">Movimiento</Text>
            <Text className="w-1/4 text-center">Puerta</Text>
            <Text className="w-1/4 text-center">Controlado por</Text>
          </View>
          <View className="flex flex-col bg-white rounded-xl" style={{elevation: 1}}>
            {activity.map((a, i) => (
              <View key={a.created_at} className={`flex flex-row items-center justify-center p-2 ${i == activity.length - 1 ? null : "border-b border-gray-200"}`}>
                <Text className="w-1/4 text-center h-full align-middle">{formatDate(new Date(a.created_at))}</Text>
                <Text className="w-1/4 text-center h-full align-middle">{formatMovement(a.movement)}</Text>
                <Text className="w-1/4 text-center h-full align-middle">{a.gate}</Text>
                <Text className="w-1/4 text-center h-full align-middle">{a.controller.name} {a.controller.lastname}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

function DataRow({ user, children, render}: { user: User, render: (user: User) => ReactNode } & React.ComponentProps<"div">) {
  return (
    <View className="flex flex-row justify-between">
      <Text className={`bg-blue-200 p-4 text-xl w-1/3 text-right`}>{children}</Text>
      <Text className={`p-4 text-xl  w-2/3`}>{render(user)}</Text>
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
  return `${("0" + localTime.getHours()).slice(-2)}:${("0" + localTime.getMinutes()).slice(-2)} ${localTime.getDate()}/${("0" + (localTime.getMonth() + 1)).slice(-2)}`
}

function formatMovement(movement: 'INGRESS' | 'EGRESS'): string {
  switch (movement) {
    case "INGRESS":
      return "Ingreso"
    case "EGRESS":
      return "Egreso"
  }
}
