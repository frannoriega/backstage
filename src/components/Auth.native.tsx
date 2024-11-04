import { supabase } from "@/utils/supabase";
import { AppState, Button } from "react-native";

type AuthButtonProps = React.ComponentProps<typeof Button>;

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function AuthButton(props: AuthButtonProps) {
  return <Button {...props} />;
}
