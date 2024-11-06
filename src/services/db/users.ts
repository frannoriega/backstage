import { supabase } from "@/utils/supabase";
import { DbError, DbErrorReason } from "./errors";

enum Role {
  A,
  B,
  C,
  D,
  E,
  P,
  X,
}

interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  dni: number;
  role: Role;
  valid_from?: string;
  valid_to?: string;
}

class UserDb {
  async getUser(id: number): Promise<User | null> {
    //TODO: Remove roles or move them inside users
    const { data, error } = await supabase
      .from("users")
      .select("id, name, lastname, email, dni, role, valid_from, valid_to")
      .eq("id", id)
      .single();
    if (data) {
      return {
        id: data.id,
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        dni: data.dni,
        role: data.role,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
      };
    } else if (error) {
      throw new DbError(DbErrorReason.UNKNOWN, "An error has occurred", error);
    } else {
      return null;
    }
  }
}

const userDb = new UserDb();

export { userDb, User, Role };
