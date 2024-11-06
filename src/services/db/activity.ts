import { Credential } from "@/services/credentials";
import { supabase } from "@/utils/supabase";
import { Controller } from "@/services/db/controllers";

function roleCanAccess(role: string, ingresses: number): boolean {
  switch (role) {
    case "A":
    case "B":
    case "D":
    case "E":
    case "P":
      return ingresses < 2;
    case "C":
      return ingresses === 0;
    case "X":
      return true;
    default:
      return false;
  }
}

class ActivityDb {
  async canAccess(credential: Credential): Promise<boolean> {
    if ((await this.countPasses(credential)) > 0) {
      return true;
    }

    let canAccess = true;
    let now = new Date();
    if (credential.valid_from) {
      canAccess = canAccess && now > new Date(credential.valid_from);
    }
    if (credential.valid_to) {
      canAccess = canAccess && now < new Date(credential.valid_to);
    }
    // Shortcircuit here to avoid going to the database if we already
    // know the user can't access
    if (!canAccess) {
      return false;
    }

    const ingresses = await this.countIngress(credential);
    return roleCanAccess(credential.role, ingresses);
  }

  async canHavePass(credential: Credential): Promise<boolean> {
    return (await this.countPasses(credential)) < 2;
  }

  async registerIngress(
    credential: Credential,
    controller: Controller,
  ): Promise<void> {
    await this.registerMovement(credential, controller, "INGRESS");
  }

  async registerEgress(
    credential: Credential,
    controller: Controller,
  ): Promise<void> {
    await this.registerMovement(credential, controller, "EGRESS");
  }

  async grantPass(
    credential: Credential,
    controller: Controller,
  ): Promise<void> {
    await supabase.from("pass").insert({
      user: credential.id,
      granted_by: controller.id,
      used: false,
    });
  }

  private async countPasses(credential: Credential): Promise<number> {
    //TODO: Handle error
    const { count, error } = await supabase
      .from("passes")
      .select("*", { count: "exact" })
      .eq("user", credential.id)
      .eq("used", false)
      .single();
    return count || 0;
  }

  private async countIngress(credential: Credential): Promise<number> {
    //TODO: Handle error
    const { count, error } = await supabase
      .from("activity")
      .select("*", { count: "exact" })
      .eq("user", credential.id)
      .eq("movement", "INGRESS")
      .single();
    return count || 0;
  }

  private async registerMovement(
    credential: Credential,
    controller: Controller,
    movement: string,
  ): Promise<void> {
    await supabase.from("activity").insert({
      user: credential.id,
      controlled_by: controller.id,
      gate: controller.gate,
      movement: movement,
    });
  }
}

const activityDb = new ActivityDb();

export { activityDb };
