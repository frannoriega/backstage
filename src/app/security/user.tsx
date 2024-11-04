import { useBackstage } from "@/hooks/useBackstage";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ScannedUserPage() {
  const { controllerId, name, lastname, email, role, photo } =
    useLocalSearchParams();
  const { user, canAccess, registerAccess } = useBackstage(
    Number(controllerId),
    email,
    "S1",
  );

  async function grantAccess() {
    await registerAccess();
    console.log("Acceso registrado");
    router.back();
  }

  return (
    <View>
      <Text>
        Datos del usuario: {name}, {lastname}, {role}, {photo},{" "}
        {JSON.stringify(user)}
      </Text>
      <Pressable onPress={grantAccess} disabled={!canAccess}>
        <Text>Dar acceso</Text>
      </Pressable>
    </View>
  );
}
