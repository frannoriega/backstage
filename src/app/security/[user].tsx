
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

export default function ScannedUserPage() {
  const glob = useGlobalSearchParams();
  const local = useLocalSearchParams();
  console.log(glob)
  console.log(local)
  return (
    <Text>Scanned text is ${local.user}</Text>
  )
}
