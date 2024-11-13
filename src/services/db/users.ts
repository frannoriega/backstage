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
  FIELD = "field",
}

interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  dni: number;
  role: Role;
  state: State;
  photo: string;
  valid_from?: string;
  valid_to?: string;
}

class UserDb {
  async getUser(id: number): Promise<User | null> {
    //TODO: Remove roles or move them inside users
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, name, lastname, email, dni, role, state, valid_from, valid_to",
      )
      .eq("id", id)
      .single();
    const { data: photoUrl, error: photoError } = await supabase.storage.from('photos')
      .createSignedUrl(`${id}/photo.jpg`, 3600)
    if (!photoUrl || photoError) {
      //TODO: Handle this error
      console.error("no photo", photoError)
      throw new Error()
    }
    if (data) {
      return {
        id: data.id,
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        dni: data.dni,
        role: data.role,
        state: data.state,
        photo: photoUrl?.signedUrl,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
      };
    } else if (error) {
      throw new DbError(DbErrorReason.UNKNOWN, "An error has occurred", error);
    } else {
      return null;
    }
  }

  async setState(id: number, state: State) {
    const { error } = await supabase.from('users')
      .update({
        state: state
      })
      .eq('id', id)
  }
}

const userDb = new UserDb();

export { userDb, User, Role, State };
