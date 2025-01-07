import { Ban } from "lucide-react-native";
import { View, Text } from "react-native";

export default function Invalid() {
  return (
    <View className="flex flex-col w-full h-full items-center justify-center">
      <View style={{ elevation: 1 }} className="bg-white p-8 flex flex-col items-center gap-4 rounded-xl">
        <View className="bg-red-400 p-4 w-min rounded-full">
          <Ban size={48} color='black' className="bg-red-400 rounded-full" />
        </View>
        <Text className="text-black text-4xl">Acceso denegado</Text>
        <Text className="text-black text-xl">Credencial inválida</Text>
      </View>
    </View>
  );
}
