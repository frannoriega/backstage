import { AccessInfo, accessService } from "@/services/access";
import { Credential, credentialService } from "@/services/credentials";
import { userDb } from "@/services/db/users";
import { store } from "@/services/storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function ScannedUserPage() {
  const { credential: encodedCredential }: { credential: string } =
    useLocalSearchParams();
  const credential = Credential.fromBase64(encodedCredential);

  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);

  useEffect(() => {
    const init = async () => {
      const controller = await store.getController();
      const user = await userDb.getUser(credential.id);
      if (controller && user && credentialService.validate(user, credential)) {
        const accessHandler = await accessService.createHandler(
          controller,
          user,
        );
        setAccessInfo(await accessHandler.getAccessInfo());
      } else {
        //TODO: Handle error
      }
    };

    init();
  }, [credential]);

  const today = new Date();
  const tomorrow = new Date();
  today.setHours(17, 0, 0, 0);
  tomorrow.setHours(10, 0, 0, 0);
  tomorrow.setDate(today.getDate() + 1);

  return (
    <View>
      <Text>
        Datos del usuario: {credential.name}, {credential.photo}
      </Text>
      <Text>{accessInfo?.movement}</Text>
      {accessInfo?.allowed && (
        <Pressable>
          <Text>Acceder</Text>
        </Pressable>
      )}
    </View>
  );
}
