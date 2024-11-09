import { Role, State, User } from "@/services/db/users";
import { Controller, Gate } from "./db/controllers";
import { PassInfo, activityDb } from "./db/activity";

interface AccessInfo {
  type: "pass" | "access";
  allowed: boolean;
  movement: "ingress" | "egress";
}

class AccessHandler {
  private readonly user: User;
  private readonly controller: Controller;
  // whether it has a pass, and it's id
  private readonly pass: PassInfo | null;

  constructor(user: User, controller: Controller, pass: PassInfo | null) {
    this.user = user;
    this.controller = controller;
    this.pass = pass;
  }

  async getAccessInfo(): Promise<AccessInfo> {
    const accessType = this.getAccessType();
    switch (this.user.role) {
      case Role.A:
      case Role.X:
        // They can always access
        return {
          type: "access",
          allowed: true,
          movement: accessType,
        };
      case Role.B:
        // Has pass for today (S1)?
        if (this.pass) {
          return {
            type: "pass",
            allowed: !this.pass.used,
            movement: accessType,
          };
        }
        // Has valid timeframe?
        if (!this.hasValidTimeframe()) {
          return {
            type: "access",
            allowed: false,
            movement: accessType,
          };
        }
        // Did they spent their access already?
        // 1 egress for S1 OR 1 egress for S2
        return {
          type: "access",
          allowed: !(await activityDb.hasLeftGates(this.user, [
            Gate.S1,
            Gate.S2,
          ])),
          movement: accessType,
        };
      case Role.C:
        // Has valid timeframe?
        if (!this.hasValidTimeframe()) {
          return {
            type: "access",
            allowed: false,
            movement: accessType,
          };
        }
        // They can't access S3
        if (this.controller.gate && this.controller.gate === Gate.S3) {
          return {
            type: "access",
            allowed: false,
            movement: accessType,
          };
        }
        // Did they spent their TODAY's access already?
        // 1 ingress for S1
        // 1 egress for S2
        return {
          type: "access",
          allowed: !(await activityDb.hasLeftGates(this.user, [
            Gate.S1,
            Gate.S2,
          ])),
          movement: accessType,
        };
      case Role.D:
      case Role.E:
        // Has pass for today (S1)?
        if (this.pass) {
          return {
            type: "pass",
            allowed: !this.pass.used,
            movement: accessType,
          };
        }
        // Has valid timeframe?
        if (!this.hasValidTimeframe()) {
          return {
            type: "access",
            allowed: false,
            movement: accessType,
          };
        }

        // They can't access S3
        if (this.controller.gate && this.controller.gate === Gate.S3) {
          return {
            type: "access",
            allowed: false,
            movement: accessType,
          };
        }

        // Did they spent their TODAY's access already?
        return {
          type: "access",
          allowed: !(await activityDb.hasLeftGates(
            this.user,
            [Gate.S1, Gate.S2],
            true,
          )),
          movement: accessType,
        };
      case Role.P:
        // Has pass for today (S1)?
        if (this.pass) {
          return {
            type: "pass",
            allowed: !this.pass.used,
            movement: accessType,
          };
        }

        // They can't access S3
        if (this.controller.gate && this.controller.gate === Gate.S3) {
          return {
            type: "access",
            allowed: false,
            movement: accessType,
          };
        }

        // Did they spent their access already?
        // 1 S1
        // inf S2
        return {
          type: "access",
          allowed: !(await activityDb.hasLeftGates(this.user, [Gate.S1], true)),
          movement: accessType,
        };
    }
  }

  async registerMovement() {
    const accessType = this.getAccessType();
    if (accessType === "ingress") {
      await activityDb.registerIngress(this.user, this.controller);
    } else {
      await activityDb.registerEgress(this.user, this.controller);
    }
    if (this.pass && !this.pass.used) {
      await activityDb.burnPass(this.pass.id);
    }
  }

  private hasValidTimeframe(): boolean {
    let valid = true;
    let now = new Date();
    if (this.user.valid_from) {
      valid = valid && now > new Date(this.user.valid_from);
    }
    if (this.user.valid_to) {
      valid = valid && now < new Date(this.user.valid_to);
    }
    return valid;
  }

  private getAccessType(): "ingress" | "egress" {
    switch (this.user.state) {
      case State.OUTSIDE:
      case State.FIELD:
        return "ingress";
      case State.BACKSTAGE:
        return "egress";
      case State.CHECKPOINT:
        switch (this.controller.gate) {
          case Gate.S1:
          case Gate.S2:
            return "egress";
          case Gate.S3:
            return "ingress";
          case undefined:
            //TODO: Handle this error
            throw new Error();
        }
    }
  }
}

class AccessService {
  async createHandler(
    controller: Controller,
    user: User,
  ): Promise<AccessHandler> {
    const pass = await activityDb.getPass(user);
    return new AccessHandler(user, controller, pass);
  }
}

const accessService = new AccessService();

export { accessService, AccessHandler, AccessInfo };
