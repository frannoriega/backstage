import { State, User, userDb } from "@/services/db/users";
import { useLocalSearchParams } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View, Text, ScrollView, Pressable, Linking, Modal } from "react-native";
import { ActivityInfo, activityDb } from "@/services/db/activity";
import { CircleX, Phone } from "lucide-react-native";
import { Image } from "expo-image"
import ErrorModal from "@/components/error";

export default function UserScreen() {
  const { user: id } = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<ActivityInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      setError(null)
      setUser(await userDb.getUser(Number(id)))
      setActivity(await activityDb.getActivity(Number(id)))
    }

    init()
      .catch(e => setError(e.stack))
      .finally(() => setLoading(false))
  }, [])

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


  return (
    <ScrollView className="w-full">
      <View className="w-full flex flex-col pb-4 gap-8">
        <Text className="text-2xl bg-blue-200 p-4">Última ubicación registrada</Text>
        <Text className="text-2xl w-full text-center font-bold">{getState(user)}</Text>
        <Text className="text-2xl bg-blue-200 p-4">Información del usuario</Text>
        <View className="flex flex-col items-center justify-center gap-0 mx-4 rounded-xl bg-white overflow-hidden" style={{ elevation: 1 }}>
          <View className="p-4">
            <Image source={user.photo_url} className="h-80 w-80 rounded-xl border" />
          </View>
          <DataRow user={user} render={(user) => <Text>{`${user.name} ${user.lastname}`}</Text>}>Nombre</DataRow>
          <DataRow user={user} render={(user) => <Text>{user.dni}</Text>}>DNI</DataRow>
          <DataRow user={user} render={(user) => <Text>{user.role}</Text>}>Nivel de acceso</DataRow>
          {user.group && <DataRow user={user} render={(user) => <Text>{user.group}</Text>}>Grupo</DataRow>}
          <DataRow user={user} render={(user) => (
            <Pressable className="flex flex-row gap-4" onPress={() => Linking.openURL(`tel:${user.phone}`)}>
              <Phone size={18} color='black' />
              <Text className="text-black">{user.phone}</Text>
            </Pressable>)}>Telefono</DataRow>
          <DataRow user={user} render={(user) => <Text>{user.email}</Text>}>Email</DataRow>
        </View>
        {activity.length > 0 &&
          <>
            <Text className="text-2xl bg-blue-200 p-4">Actividad reciente</Text>
            <View className="flex flex-col px-4 gap-2">
              <View className="flex flex-row">
                <Text className="w-1/4 text-center">Fecha</Text>
                <Text className="w-1/4 text-center">Movimiento</Text>
                <Text className="w-1/4 text-center">Puerta</Text>
                <Text className="w-1/4 text-center">Controlado por</Text>
              </View>
              <View className="flex flex-col bg-white rounded-xl" style={{ elevation: 1 }}>
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
          </>
        }
      </View>
    </ScrollView>
  )
}

function DataRow({ user, children, render }: { user: User, render: (user: User) => ReactNode } & React.ComponentProps<"div">) {
  return (
    <View className="flex flex-row justify-between">
      <Text className={`bg-blue-200 border border-blue-200 p-4 text-xl w-1/3 text-right`}>{children}</Text>
      <View className={`p-4 text-xl w-2/3 flex flex-col justify-center items-start`}>{render(user)}</View>
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
