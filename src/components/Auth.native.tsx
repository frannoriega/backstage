import { supabase } from "@/utils/supabase";
import { AppState, Button, Pressable, PressableProps, Text } from "react-native";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

type AuthButtonProps = {
  title: string
  textClassName: string
} & React.ComponentProps<typeof Pressable>

export default function AuthButton(props: AuthButtonProps) {
  return (
    <Pressable {...props} >
      <Text className={props.textClassName}>{props.title.toUpperCase()}</Text>
    </Pressable>
  )
}
