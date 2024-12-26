import { Text, Modal, Pressable, TextInput, View } from "react-native";
import Filter from "./filter";
import { Role } from "@/services/db/users";
import { useState } from "react";
import { Check } from "lucide-react-native";

type SearchBarProps = {
  onSearch: (text: string) => any
  onFilter: (roles: Role[]) => any
}

export default function SearchBar({ onSearch, onFilter }: SearchBarProps) {
  const [selected, setSelected] = useState<Role[]>([])
  const [open, setOpen] = useState(false)

  function select(onSelect: (s: Role[]) => any) {
    setSelected(onSelect)
    onFilter(onSelect(selected))
  }

  return (
    <View className="flex flex-col">
      <View className="flex flex-row px-4 py-2 gap-4 items-center">
        <Filter onOpen={setOpen} />
        <TextInput onChangeText={onSearch} className="w-full" placeholder="Buscar..." />
      </View>
      {open &&
        <View className="w-full h-0 relative">
          <View className='z-10 flex flex-col justify-between w-full bg-slate-50 absolute'>
            {Object.values(Role).map(r => (
              <Pressable onPress={() => {
                select(s => {
                  if (!s.includes(r)) {
                    return [r, ...s]
                  } else {
                    return s.filter(sr => sr !== r)
                  }
                })
              }} className="p-4 border border-gray-100 focus:bg-slate-200 flex flex-row justify-between">
                <Text>Rol {r}</Text>
                {selected.includes(r) &&
                  <Check size={20} color='black' />
                }
              </Pressable>
            ))}
          </View>
        </View>
      }
      {selected.length > 0 &&
        <View className="flex flex-row gap-2 p-2">
          {selected.map(r => (
            <Pressable onPress={() => select(s => {
              return s.filter(sr => sr !== r)
            })}>
              <Text className="px-4 py-1 border border-gray-600 bg-blue-100 rounded-full">Rol {r}</Text>
            </Pressable>
          ))}
        </View>
      }
    </View>

  )
}
