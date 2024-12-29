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
  OUTSIDE = "OUTSIDE",
  CHECKPOINT = "SECURITY",
  BACKSTAGE = "BACKSTAGE",
  BAND = "BAND",
  FIELD = "FIELD",
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
  lastname: string,
  dni: number,
  role: Role
}

interface UserState {
  state: State;
  s1_pass: Pass;
  s2_pass: Pass;
  updated_at: Date;
}

enum Pass {
  NONE = "NONE",
  IN_PROGRESS = "IN_PROGRESS",
  USED = "USED"
}

class UserDb {
  private readonly PAGE_SIZE = 10

  async getUsers(page: number, roles: Role[], search: string): Promise<{ data: UserId[], next: boolean, prev: boolean}> {
    const offset = page * this.PAGE_SIZE
    const r = roles.length == 0 ?
      Object.values(Role) :
      roles
    const { data, error, count } = await supabase
      .from("users")
      .select("id, name, lastname, dni, role", { count: 'exact', head: false })
      .or(`name.ilike.%${search}%,lastname.ilike.%${search}%`)
      .in("role", r)
      .order("lastname", { ascending: true })
      .range(offset, offset + this.PAGE_SIZE - 1)
    if (error || !data) {
      //TODO: Handle this error
      console.error("getUsers: ", error)
      throw error
    }
    return {
      data: data ?? [],
      next: (offset + this.PAGE_SIZE - 1) < (count ?? 0),
      prev: page > 0
    }
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
      .createSignedUrl(`${data.id}.jpg`, 3600)
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
      valid_from: data.valid_from ? new Date(data.valid_from) : undefined,
      valid_to: data.valid_from ? new Date(data.valid_to) : undefined,
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
