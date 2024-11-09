import { supabase } from "@/utils/supabase";
import { Controller, Gate } from "@/services/db/controllers";
import { Role, User } from "./users";

interface PassInfo {
  id: number;
  used: boolean;
}

function getTodayRange(): { today: Date; tomorrow: Date } {
  const today = new Date();
  const tomorrow = today;
  today.setHours(17, 0, 0, 0);
  tomorrow.setHours(10, 0, 0, 0);
  tomorrow.setUTCDate(today.getUTCDate() + 1);

  return {
    today,
    tomorrow,
  };
}

class ActivityDb {
  async hasLeftGates(
    user: User,
    gates: Gate[],
    today?: boolean,
  ): Promise<boolean> {
    let query = supabase.from("activity").select().eq("user", user.id);
    for (const g of gates) {
      query = query.or(`gate.eq.${g},and(movement.eq.EGRESS)`);
    }
    if (today != null && today) {
      const { today, tomorrow } = getTodayRange();
      query = query
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());
    }
    const { data, error } = await query;
    console.error(error);
    if (data && data.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async getPass(user: User): Promise<PassInfo | null> {
    const { today, tomorrow } = getTodayRange();
    const { data, error } = await supabase
      .from("pass")
      .select("id, used")
      .eq("user", user.id)
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString())
      .maybeSingle();
    if (data) {
      return {
        id: data.id,
        used: data.used,
      };
    } else {
      return null;
    }
  }

  async registerIngress(user: User, controller: Controller): Promise<void> {
    await this.registerMovement(user, controller, "INGRESS");
  }

  async registerEgress(user: User, controller: Controller): Promise<void> {
    await this.registerMovement(user, controller, "EGRESS");
  }

  async burnPass(id: number) {
    await supabase
      .from("pass")
      .update({
        used: true,
      })
      .eq("id", id);
  }

  private async registerMovement(
    user: User,
    controller: Controller,
    movement: string,
  ): Promise<void> {
    await supabase.from("activity").insert({
      user: user.id,
      controlled_by: controller.id,
      gate: controller.gate,
      movement: movement,
    });
  }
}

const activityDb = new ActivityDb();

export { activityDb, PassInfo };
