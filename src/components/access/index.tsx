import { AccessInfo } from "@/services/access"
import { activityDb } from "@/services/db/activity"
import { Controller } from "@/services/db/controllers"
import { User } from "@/services/db/users"
import { router } from "expo-router"
import { useState } from "react"
import { Pressable, Text, View } from "react-native"

type AccessProps = {
  user: User,
  controller: Controller | null,
  accessInfo: AccessInfo,
}

export default function Access({ controller, accessInfo, user }: AccessProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState(false)

  if (!controller || !controller.gate) {
    return null
  }

  if (!accessInfo.allowed && !accessInfo.canHavePass) {
    return (
      <View className="flex-1 items-center">
        <Text className="text-4xl p-4 bg-red-200 rounded-xl">Acceso denegado</Text>
      </View>
    )
  }

  if (!accessInfo.allowed && accessInfo.canHavePass) {

    async function grantPass() {
      if (controller && !message) {
        await activityDb.grantPass(user.id, controller)
      }
      setMessage("Pase otorgado")
    }

    return (
      <View>
        {!message && 
          <Pressable
            onPress={grantPass}
            className="p-4 bg-green-400">
            <Text className="text-4xl">Otorgar pase</Text>
          </Pressable>
        }
        {message &&
          <Text className={`text-4xl ${error ? "text-red-300" : "text-green-300"}`}>{message}</Text>
        }
      </View>
    )
  }

  async function registerMovement() {
    if (controller) {
      await activityDb.registerMovement(user, controller, accessInfo.movement, accessInfo.newState)
    }
    router.back()
  }

  return (
    <Pressable onPress={registerMovement} className="p-4 rounded-xl bg-blue-200">
      <Text className="text-4xl">Registrar {accessInfo.movement === 'ingress' ? 'entrada' : 'salida'}</Text>
    </Pressable>
  )
}
