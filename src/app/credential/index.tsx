import { AccessInfo, accessService } from "@/services/access";
import { Credential, credentialService } from "@/services/credentials";
import { Controller } from "@/services/db/controllers";
import { Role, User, userDb } from "@/services/db/users";
import { store } from "@/services/storage";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image"
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Access from "@/components/access";

export default function ScannedUserPage() {
  const { credential: encodedCredential }: { credential: string } =
    useLocalSearchParams();
  const credential = Credential.fromBase64(encodedCredential);

  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [user, setUser] = useState<User | null>(null)
  const [controller, setController] = useState<Controller | null>(null)
  const [roleClassName, setRoleClassName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const controller = await store.getController();
      const user = await userDb.getUser(credential.id);
      if (controller && user) {
        const accessHandler = await accessService.createHandler(
          controller,
          user,
        );
        setAccessInfo(await accessHandler.getAccessInfo());
        setUser(user)
        setController(controller)
      }
      switch (credential.role) {
        case Role.A:
          setRoleClassName('bg-green-400')
          break
        case Role.B:
          setRoleClassName('bg-orange-400')
          break
        case Role.C:
          setRoleClassName('bg-lime-400')
          break
        case Role.D:
          setRoleClassName('bg-purple-400')
          break
        case Role.E:
          setRoleClassName('bg-rose-400')
          break
        case Role.P:
          setRoleClassName('bg-blue-400')
          break
        case Role.X:
          setRoleClassName('text-white bg-black')
          break
      }
      setLoading(false)
    };

    init();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (user && controller && accessInfo) {
    return (
      <View className="flex-1 justify-evenly items-center gap-8 py-24 px-8 w-full">
        <View className="bg-white flex-2 items-center h-fit w-full gap-2 pt-8 border-4 border-white rounded-xl overflow-hidden">
          {user &&
            <Image source={user?.photo} className="h-80 w-80 rounded-xl border" />
          }
          <Text className="text-4xl font-black">
            {credential.name} {credential.lastname}
          </Text>
          <Text className="text-2xl">
            DNI: {credential.dni}
          </Text>
          <View className={`w-full flex items-center gap-2 p-2 ${roleClassName}`}>
            <Text className={`text-3xl w-full text-center ${roleClassName}`}>Nivel de acceso</Text>
            <Text className={`h-22 w-full justify-self-stretch align-middle text-center text-4xl font-bold ${roleClassName}`}>
              {credential.role}
            </Text>
          </View>
        </View>
        <Access user={user} controller={controller} accessInfo={accessInfo} />
      </View>
    );
  } else {
    return null
  }
}
