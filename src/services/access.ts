import { Role, State, User, userDb } from "@/services/db/users";
import { Controller, Gate } from "./db/controllers";
import { activityDb } from "./db/activity";

interface AccessInfo {
  allowed: boolean;
  movement: "ingress" | "egress";
  newState: State
  canHavePass: boolean
}

class AccessHandler {
  private readonly user: User;
  private readonly controller: Controller;
  // whether it has a pass, and it's id
  private readonly pass: number | null;

  constructor(user: User, controller: Controller, pass: number | null) {
    this.user = user;
    this.controller = controller;
    this.pass = pass;
  }

  async getAccessInfo(): Promise<AccessInfo> {
    const accessType = this.getStateTransition();
    switch (this.user.role) {
      case Role.A:
      case Role.X:
        // They can always access
        return {
          allowed: true,
          movement: accessType.movement,
          newState: accessType.newState,
          canHavePass: false
        };
      case Role.B:
        // Has pass for today (S1)?
        if (this.pass) {
          return {
            type: "pass",
            allowed: false,
            movement: accessType.movement,
            newState: accessType.newState,
            canHavePass: false
          };
        }
        // Has valid timeframe?
        if (!this.hasValidTimeframe()) {
          return {
            allowed: false,
            movement: accessType.movement,
            newState: accessType.newState,
            canHavePass: false
          };
        }
        // Did they spent their access already?
        // 1 egress for S1 OR 1 egress for S2
        return {
          allowed: !(await activityDb.hasLeftGates(this.user, [
            Gate.S1,
            Gate.S2,
          ])),
          movement: accessType.movement,
          newState: accessType.newState,
          canHavePass: false
        };
      case Role.C:
        // Has valid timeframe?
        // if (!this.hasValidTimeframe()) {
        //   return {
        //     allowed: false,
        //     movement: accessType.movement,
        //     newState: accessType.newState,
        //     canHavePass: false
        //   };
        // }
        // They can't access S3
        if (this.controller.gate && this.controller.gate === Gate.S3) {
          return {
            allowed: false,
            movement: accessType.movement,
            newState: accessType.newState,
            canHavePass: false
          };
        }
        // Did they spent their TODAY's access already?
        // 1 ingress for S1
        // 1 egress for S2
        return {
          allowed: !(await activityDb.hasLeftGates(this.user, [
            Gate.S1,
            Gate.S2,
          ])),
          movement: accessType.movement,
          newState: accessType.newState,
          canHavePass: true
        };
      case Role.D:
      case Role.E:
        // Has pass for today (S1)?
        if (this.pass) {
          return {
            allowed: false,
            movement: accessType.movement,
            newState: accessType.newState,
            canHavePass: false
          };
        }
        // Has valid timeframe?
        if (!this.hasValidTimeframe()) {
          return {
            allowed: false,
            movement: accessType.movement,
            newState: accessType.newState,
            canHavePass: false
          };
        }

        // They can't access S3
        if (this.controller.gate && this.controller.gate === Gate.S3) {
          return {
            allowed: false,
            movement: accessType.movement,
            newState: accessType.newState,
            canHavePass: false
          };
        }

        // Did they spent their TODAY's access already?
        return {
          allowed: !(await activityDb.hasLeftGates(
            this.user,
            [Gate.S1, Gate.S2],
            true,
          )),
          movement: accessType.movement,
          newState: accessType.newState,
          canHavePass: true
        };
      case Role.P:
        // Has pass for today (S1)?
        if (this.pass) {
          return {
            allowed: false,
            movement: accessType.movement,
            newState: accessType.newState,
            canHavePass: false
          };
        }

        // They can't access S3
        if (this.controller.gate && this.controller.gate === Gate.S3) {
          return {
            allowed: false,
            movement: accessType.movement,
            newState: accessType.newState,
            canHavePass: false
          };
        }

        // Did they spent their access already?
        // 1 S1
        // inf S2
        return {
          allowed: !(await activityDb.hasLeftGates(this.user, [Gate.S1], true)),
          movement: accessType.movement,
          newState: accessType.newState,
          canHavePass: true
        };
    }
  }

  private getStateTransition(): { movement: "ingress" | "egress", newState: State } {
    switch (this.user.state) {
      case State.OUTSIDE:
      case State.FIELD:
        return { movement: "ingress", newState: State.CHECKPOINT };
      case State.BACKSTAGE:
        return { movement: "egress", newState: State.CHECKPOINT };
      case State.CHECKPOINT:
        switch (this.controller.gate) {
          case Gate.S1:
            return { movement: "egress", newState: State.OUTSIDE };
          case Gate.S2:
            return { movement: "egress", newState: State.FIELD };
          case Gate.S3:
            return { movement: "ingress", newState: State.BACKSTAGE };
          case Gate.NONE:
            //TODO: Handle this error
            throw new Error();
        }
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
