import { supabase } from "@/utils/supabase";
import { Controller, Gate } from "@/services/db/controllers";
import { Role, State, User, UserState } from "./users";

function getTodayRange(): { today: Date; tomorrow: Date } {
  const today = new Date();
  const tomorrow = new Date(today.getTime());
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
    let query = supabase.from("activity")
      .select()
      .eq("user", user.id)
      .or(gates.map(g => `and(gate.eq.${g.valueOf()},movement.eq.EGRESS)`).join(','))
    if (today != null && today) {
      const { today, tomorrow } = getTodayRange();
      query = query
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());
    }
    const { data, error } = await query;
    if (error) {
      console.error(error);
    }
    if (data && data.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async getPass(user: User): Promise<number | null> {
    const { today, tomorrow } = getTodayRange();
    const { data, error } = await supabase
      .from("pass")
      .select("id")
      .eq("user", user.id)
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString())
      .maybeSingle();
    if (data) {
      return data.id;
    } else {
      return null;
    }
  }

  async grantPass(id: number, controller: Controller) {
    await supabase
      .from("pass")
      .insert({
        user: id,
        granted_by: controller.id,
        gate: controller.gate
      })
      .eq("id", id);
  }

  async registerMovement(
    user: User,
    controller: Controller,
    movement: 'ingress' | 'egress',
    newState: UserState
  ): Promise<void> {
    console.log(newState)
    console.log(user.id)
    const { error } = await supabase.rpc('register_movement', {
      user_id: user.id,
      controller_id: controller.id,
      g: controller.gate.valueOf(),
      move: movement.toUpperCase(),
      new_state: newState.state.valueOf(),
      new_s1_pass: newState.s1_pass.valueOf(),
      new_s2_pass: newState.s2_pass.valueOf(),
      new_updated_at: newState.updated_at.toISOString()
    })
    if (error) {
      console.error(error)
    }
  }

}

const activityDb = new ActivityDb();

export { activityDb };
