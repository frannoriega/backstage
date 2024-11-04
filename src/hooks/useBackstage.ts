import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

enum Gate {
  S1 = "S1",
  S2 = "S2",
  S3 = "S3",
  S4 = "S4",
}

enum Role {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  P = "P",
  S = "S",
  X = "X",
}

type User = {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: Role;
};

export function useBackstage(controllerId: number, email: string, gate: Gate) {
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<number>(0);
  const [passes, setPasses] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("type, users(id, name, lastname, email)")
        .eq("users.email", email);
      const procUser = {
        id: data[0].users.id,
        name: data[0].users.name,
        lastname: data[0].users.lastname,
        email: data[0].users.email,
        role: data[0].type,
      };
      setUser(procUser);

      const act = await supabase
        .from("activity")
        .select("user:users!user (email), movement", {
          count: "exact",
        })
        .eq("movement", "EGRESS")
        .eq("user.email", procUser.email);
      setActivity(act.count || 0);

      const pass = await supabase
        .from("pass")
        .select("users(email), used", {
          count: "exact",
        })
        .eq("used", true)
        .eq("users.email", procUser.email);
      console.log(pass);
      setPasses(pass.count || 0);
    };

    init();
  }, [email]);

  let canAccess = false;
  switch (user?.role) {
    case (Role.A, Role.B):
      canAccess = activity < 2 || passes < 2;
      break;
    case Role.X:
      canAccess = true;
      break;
  }

  async function registerAccess() {
    console.log(controllerId);
    const res = await supabase.from("activity").insert([
      {
        user: user?.id,
        controlled_by: controllerId,
        gate: gate,
        movement: "INGRESS",
      },
    ]);

    console.log("Register: ", res);
  }

  return { user, canAccess, registerAccess };
}
