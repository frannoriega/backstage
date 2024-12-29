import { activityDb } from "@/services/db/activity"
import { Controller } from "@/services/db/controllers"
import { User } from "@/services/db/users"
import { AccessInfo } from "@/services/fsms"
import { router, useNavigation, usePathname } from "expo-router"
import { Ban, Check, LogIn, LogOut, OctagonAlert, OctagonMinus, Ticket, TicketPlus } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Pressable, Text, View } from "react-native"

type AccessProps = {
  user: User,
  accessInfo: AccessInfo,
  controller: Controller
}

export default function Access({ accessInfo, user, controller }: AccessProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (accessInfo.movement === 'denied') {
    return (
      <View className="flex-1 flex-col p-4 gap-4 h-fit items-center">
        <View className="bg-red-400 rounded-full p-4">
          <Ban size={48} color='black' className="bg-red-400 rounded-full" />
        </View>
        <Text className="text-4xl">Acceso denegado</Text>
      </View>
    )
  }

  async function registerMovement(message: string) {
    try {
      if (controller) {
        await activityDb.registerMovement(user, controller, accessInfo.movement, accessInfo.state)
      }
      setMessage(message)
    } catch (_) {
      setError("A ocurrido un error.\nContáctese con Francisco Noriega")
      setMessage(null)
    }
  }

  if (accessInfo.pass) {

    return (
      <View>
        <Pressable
          onPress={() => registerMovement("Pase otorgado")}
          className={`p-8 bg-green-400 rounded-full ${message || error ? "hidden" : "block"}`}>
          <Ticket size={48} color='black' />
        </Pressable>
        <View className={`flex flex-col items-center gap-4 ${error ? "block" : "hidden"} `}>
          <View className="p-8 rounded-full bg-red-400">
            <OctagonAlert size={48} color='black' />
          </View>
          <Text className={`text-xl text-center`}>{error}</Text>
        </View>
        <View className={`flex flex-col items-center gap-4 ${message ? "block" : "hidden"}`}>
          <View className="bg-green-300 p-6 rounded-full">
            <Check size={48} color='black' />
          </View>
          <Text className={`text-2xl `}>{message}</Text>
        </View>
      </View>
    )
  }


  return (
    <View className="flex flex-col p-8">
      <Pressable onPress={() => registerMovement("Acceso otorgado")} className={`flex flex-col items-center gap-4 p-8 rounded-full bg-green-400 ${message || error ? "hidden" : "block"}`} style={{ elevation: 1 }}>
        {accessInfo.movement === 'ingress' ?
          <LogIn size={48} color='black' /> :
          <LogOut size={48} color='black' />
        }
      </Pressable>
      <View className={`flex flex-col items-center gap-4 ${error ? "block" : "hidden"} `}>
        <View className="p-8 rounded-full bg-red-400">
          <OctagonAlert size={48} color='black' />
        </View>
        <Text className={`text-xl text-center`}>{error}</Text>
      </View>
      <View className={`flex flex-col items-center gap-4 ${message ? "block" : "hidden"}`}>
        <View className="bg-green-300 p-6 rounded-full">
          <Check size={48} color='black' />
        </View>
        <Text className={`text-2xl `}>{message}</Text>
      </View>
    </View>
  )
}
