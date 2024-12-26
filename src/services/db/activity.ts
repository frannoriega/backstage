import { supabase } from "@/utils/supabase";
import { Controller, Gate } from "@/services/db/controllers";
import { Role, State, User, UserState } from "./users";

interface ActivityInfo {
  controller: {
    id: number,
    name: string,
    lastname: string
  },
  movement: 'INGRESS' | 'EGRESS',
  gate: Gate,
  created_at: string
}

class ActivityDb {

  async getActivity(id: number): Promise<ActivityInfo[]> {
    const { data, error } = await supabase.from("activity")
      .select("controller(id, name, lastname), movement, gate, created_at")
      .eq("user", id)
      .order("created_at", { ascending: false })
      .limit(5)
    if (error || !data) {
      console.error("getActivity: ", error)
    }
    console.log("getActivity: ", data)
    return data.map(d => {
      return {
        controller: {
          id: d.controller.id,
          name: d.controller.name,
          lastname: d.controller.lastname,
        },
        movement: d.movement,
        gate: d.gate,
        created_at: d.created_at
      }
    }) 
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

export { activityDb, ActivityInfo };
