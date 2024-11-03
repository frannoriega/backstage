
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

export default function ScannedUserPage() {
  const local = useLocalSearchParams();
  return (
    <Text>Datos del usuario: {local.name}, {local.lastname}, {local.email}, {local.photo}</Text>
  )
}
