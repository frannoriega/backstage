import { supabase } from "@/utils/supabase";
import { DbError, DbErrorReason } from "./errors";

enum Role {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  P = "P",
  X = "X",
}

enum State {
  OUTSIDE = "outside",
  CHECKPOINT = "checkpoint",
  BACKSTAGE = "backstage",
  BAND = "band",
  FIELD = "field",
}

interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  dni: number;
  role: Role;
  photo_url: string;
  phone: string;
  group: string | null;
  valid_from?: Date;
  valid_to?: Date;
  enabled: boolean;
  state: UserState;
}

interface UserId {
  id: number,
  name: string,
  lastname: string
}

interface UserState {
  state: State;
  s1_pass: Pass;
  s2_pass: Pass;
  updated_at: Date;
}

enum Pass {
  NONE,
  IN_PROGRESS,
  USED
}

class UserDb {
  async getUsers(): Promise<UserId[]> {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, lastname")
    if (error || !data) {
      //TODO: Handle this error
      console.error("getUsers: ", error)
      throw new Error()
    }
    return data
  }

  async getUser(id: number): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*, groups(name), user_state(*)")
      .eq("id", id)
      .single();
    console.log("getUser: ", data)
    if (error) {
      console.error("getUser: ", error)
      throw new DbError(DbErrorReason.UNKNOWN, "An error has occurred", error);
    }
    if (!data) {
      return null
    }
    const { data: photoUrl, error: photoError } = await supabase.storage.from('photos')
      .createSignedUrl(data.photo_url, 3600)
    if (!photoUrl || photoError) {
      //TODO: Handle this error
      console.error("no photo", photoError)
      throw new Error()
    }
    return {
      id: data.id,
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      dni: data.dni,
      phone: data.phone,
      role: data.role,
      photo_url: photoUrl?.signedUrl,
      group: data.groups?.name,
      valid_from: new Date(data.valid_from),
      valid_to: new Date(data.valid_to),
      enabled: data.enabled,
      state: {
        state: data.user_state.state,
        s1_pass: data.user_state.s1_pass,
        s2_pass: data.user_state.s2_pass,
        updated_at: new Date(data.user_state.updated_at)
      }
    };
  }
}

const userDb = new UserDb();

export { userDb, User, UserId, UserState, Pass, Role, State };
