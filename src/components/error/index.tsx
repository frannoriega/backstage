import { CircleX } from "lucide-react-native";
import { useState } from "react";
import { View, Text, Modal, ScrollView, Pressable } from "react-native";

type ErrorModalProps = {
  stacktrace: string
}

export default function ErrorModal({ stacktrace }: ErrorModalProps) {
  const [modalVisible, setModalVisible] = useState(false)
  return (
    <View className="flex flex-col items-center gap-2 bg-gray-800 w-full p-4 rounded-xl" style={{ elevation: 1 }}>
      <CircleX size={40} color="black" fill='#fb7185' />
      <Text className={`text-red-200 leading-relaxed w-full`}>Ocurrió un error al cargar la credencial.{"\n"}Intente más tarde o contáctese con Francisco Noriega</Text>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <ScrollView className="bg-white w-full h-full">
          <View className="p-4 flex flex-col items-center">
            <Pressable
              className="bg-blue-300 p-4 rounded-lg"
              onPress={() => setModalVisible(!modalVisible)}>
              <Text>Cerrar</Text>
            </Pressable>
            <Text className="leading-relaxed">{stacktrace}</Text>
          </View>
        </ScrollView>
      </Modal>
      <Pressable
        className="bg-red-400 p-4 rounded-lg"
        onPress={() => setModalVisible(true)}>
        <Text className="text-white">Ver error</Text>
      </Pressable>
    </View>
  )
}
