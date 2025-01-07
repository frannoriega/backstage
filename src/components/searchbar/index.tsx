import { StyleSheet, Text, Modal, Pressable, TextInput, View, TouchableWithoutFeedback, TouchableOpacity, Platform, FlatList } from "react-native";
import Filter from "./filter";
import { Role } from "@/services/db/users";
import { useCallback, useRef, useState } from "react";
import { Check } from "lucide-react-native";

type SearchBarProps = {
  onSearch: (text: string) => any
  onFilter: (roles: Role[]) => any
}

export default function SearchBar({ onSearch, onFilter }: SearchBarProps) {
  const [selected, setSelected] = useState<Role[]>([])

  function select(onSelect: (s: Role[]) => any) {
    setSelected(onSelect)
    onFilter(onSelect(selected))
  }

  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded(!expanded), [expanded]);

  const buttonRef = useRef<View>(null);

  const [top, setTop] = useState(0);

  return (
    <View>
      <View
        ref={buttonRef}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          const topOffset = layout.y;
          const heightOfComponent = layout.height;

          const finalValue =
            topOffset + heightOfComponent;

          setTop(finalValue);
        }}>
        <View className="flex flex-row p-4 gap-4 items-center">
          <Filter onOpen={toggleExpanded} />
          <TextInput onChangeText={onSearch} className="w-full" placeholder="Buscar..." />
        </View>
        {expanded ? (
          <Modal visible={expanded} transparent>
            <TouchableWithoutFeedback onPress={() => setExpanded(false)}>
              <View style={styles.backdrop}>
                <View
                  style={[
                    styles.options,
                    {
                      top,
                    },
                  ]}
                >
                  {Object.values(Role).map(r => (
                    <Pressable key={r} onPress={() => {
                      select(s => {
                        if (!s.includes(r)) {
                          return [r, ...s]
                        } else {
                          return s.filter(sr => sr !== r)
                        }
                      })
                    }} className="p-4 border border-gray-100 flex flex-row justify-between">
                      <Text>Nivel {r}</Text>
                      {selected.includes(r) &&
                        <Check size={20} color='black' />
                      }
                    </Pressable>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        ) : null}
      </View>
      {selected.length > 0 &&
        <View className="flex flex-row gap-2 p-2">
          {selected.map(r => (
            <Pressable key={r} onPress={() => select(s => {
              return s.filter(sr => sr !== r)
            })}>
              <Text className="px-4 py-1 border border-gray-600 bg-blue-100 rounded-full">Nivel {r}</Text>
            </Pressable>
          ))}
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  optionItem: {
    height: 40,
    justifyContent: "center",
  },
  separator: {
    height: 4,
  },
  options: {
    position: "absolute",
    // top: 53,
    backgroundColor: "white",
    width: "100%",
    borderRadius: 6,
  },
  text: {
    fontSize: 15,
    opacity: 0.8,
  },
  button: {
    height: 50,
    justifyContent: "space-between",
    backgroundColor: "#fff",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 8,
  },
});
