import { supabase } from "@/utils/supabase";
import { DbError, DbErrorReason } from "./errors";

enum Gate {
  S1 = "S1",
  S2 = "S2",
  S3 = "S3",
}

interface Controller {
  id: number;
  name: string;
  lastname: string;
  email: string;
  dni: number;
  gate?: Gate;
}

class ControllerDb {
  async getController(email: string): Promise<Controller | null> {
    const { data, error } = await supabase
      .from("controllers")
      .select()
      .eq("email", email)
      .single();
    if (data) {
      return {
        id: data.id,
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        dni: data.dni,
        gate: data.gate,
      };
    } else if (error) {
      throw new DbError(DbErrorReason.UNKNOWN, "An error has occurred", error);
    } else {
      throw new DbError(DbErrorReason.UNKNOWN, "An error has occurred");
    }
  }
}

const controllersDb = new ControllerDb();

export { controllersDb, Controller, Gate };
