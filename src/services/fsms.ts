import { Gate } from "./db/controllers";
import { Pass, Role, State, User, UserState } from "./db/users";

export function createFsm(user: User): RoleFsm {
  switch (user.role) {
    case Role.A:
    case Role.X:
      return new RoleXFsm(user)
    case Role.B:
      return new RoleBFsm(user)
    case Role.C:
    case Role.D:
    case Role.E:
      return new RoleCFsm(user)
    case Role.P:
      return new RolePFsm(user)
  }
}

export interface AccessInfo {
  movement: 'ingress' | 'egress' | 'denied',
  pass: boolean,
  state?: UserState
}

const denied: AccessInfo = { movement: 'denied', pass: false }

export abstract class RoleFsm {
  protected readonly user: User

  constructor(user: User) {
    this.user = user
  }

  canAccess(gate: Gate): AccessInfo {
    if (!this.user.enabled) {
      return denied
    }
    return this.getAccess(gate)
  }

  protected abstract getAccess(gate: Gate): AccessInfo

  protected getDates(): { today: Date, tomorrow: Date } {
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
}

export class RoleXFsm extends RoleFsm {
  constructor(user: User) {
    super(user)
  }

  getAccess(gate: Gate): AccessInfo {
    switch (this.user.state.state) {
      case State.OUTSIDE:
        if (gate === Gate.S1) {
          return {
            movement: 'ingress',
            pass: false,
            state: {
              state: State.CHECKPOINT,
              updated_at: new Date(),
              s1_pass: this.user.state.s1_pass,
              s2_pass: this.user.state.s2_pass
            }
          }
        } else {
          return denied
        }
      case State.CHECKPOINT:
        switch (gate) {
          case Gate.S1:
            return {
              movement: 'egress',
              pass: false,
              state: {
                state: State.OUTSIDE,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass
              }
            }
          case Gate.S2:
            return {
              movement: 'egress',
              pass: false,
              state: {
                state: State.FIELD,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass
              }
            }
          case Gate.S3:
            return {
              movement: 'ingress',
              pass: false,
              state: {
                state: State.BAND,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass
              }
            }
          default:
            return denied
        }
      case State.BAND:
        switch (gate) {
          case Gate.S3:
            return {
              movement: 'egress',
              pass: false,
              state: {
                state: State.CHECKPOINT,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass
              }
            }
          case Gate.S4:
            return {
              movement: 'ingress',
              pass: false,
              state: {
                state: State.BACKSTAGE,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass
              }
            }
          default:
            return denied
        }
      case State.BACKSTAGE:
        if (gate === Gate.S4) {
          return {
            movement: 'egress',
            pass: false,
            state: {
              state: State.BAND,
              updated_at: new Date(),
              s1_pass: this.user.state.s1_pass,
              s2_pass: this.user.state.s2_pass
            }
          }
        } else {
          return denied
        }
      case State.FIELD:
        if (gate === Gate.S2) {
          return {
            movement: 'ingress',
            pass: false,
            state: {
              state: State.CHECKPOINT,
              updated_at: new Date(),
              s1_pass: this.user.state.s1_pass,
              s2_pass: this.user.state.s2_pass
            }
          }
        } else {
          return denied
        }
    }
  }

}

export class RoleBFsm extends RoleFsm {

  constructor(user: User) {
    super(user)
  }

  getAccess(gate: Gate): AccessInfo {
    const { today, tomorrow } = this.getDates()
    if (this.user.valid_from && new Date(this.user.valid_from) > tomorrow) {
      return denied
    }

    if (this.user.valid_to && new Date(this.user.valid_to) < today) {
      return denied
    }

    switch (this.user.state.state) {
      case State.OUTSIDE: {
        if (gate != Gate.S1) {
          return denied
        }
        let pass = this.user.state.s1_pass
        if (this.user.state.updated_at > today) {
          if (this.user.state.s1_pass == Pass.NONE) {
            pass = Pass.IN_PROGRESS
          } else {
            return denied
          }
        }
        return {
          movement: 'ingress',
          pass: pass !== this.user.state.s1_pass,
          state: {
            state: State.CHECKPOINT,
            updated_at: new Date(),
            s1_pass: pass,
            s2_pass: this.user.state.s2_pass
          }
        }
      }
      case State.CHECKPOINT:
        switch (gate) {
          case Gate.S1:
            return {
              movement: 'egress',
              pass: false,
              state: {
                state: State.OUTSIDE,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass === Pass.IN_PROGRESS ? Pass.USED : this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass
              }
            }
          case Gate.S2:
            return {
              movement: 'egress',
              pass: false,
              state: {
                state: State.FIELD,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass === Pass.IN_PROGRESS ? Pass.USED : this.user.state.s2_pass
              }
            }
          case Gate.S3:
            return {
              movement: 'ingress',
              pass: false,
              state: {
                state: State.BAND,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass,
              }
            }
          case Gate.S4:
            return denied
        }
      case State.BAND:
        if (gate === Gate.S3) {
          return {
            movement: 'egress',
            pass: false,
            state: {
              state: State.CHECKPOINT,
              updated_at: new Date(),
              s1_pass: this.user.state.s1_pass,
              s2_pass: this.user.state.s2_pass
            }
          }
        } else {
          return denied
        }
      case State.BACKSTAGE:
        return denied
      case State.FIELD: {
        if (gate != Gate.S2) {
          return denied
        }
        let pass = this.user.state.s2_pass
        if (this.user.state.updated_at > today) {
          if (this.user.state.s2_pass == Pass.NONE) {
            pass = Pass.IN_PROGRESS
          } else {
            return denied
          }
        }
        return {
          movement: 'ingress',
          pass: pass !== this.user.state.s2_pass,
          state: {
            state: State.CHECKPOINT,
            updated_at: new Date(),
            s1_pass: this.user.state.s1_pass,
            s2_pass: pass
          }
        }
      }
    }
  }
}

export class RoleCFsm extends RoleFsm {
  constructor(user: User) {
    super(user)
  }

  getAccess(gate: Gate): AccessInfo {
    const { today } = this.getDates()
    switch (this.user.state.state) {
      case State.OUTSIDE: {
        if (gate != Gate.S1) {
          return denied
        }
        let pass = this.user.state.s1_pass
        if (this.user.state.updated_at > today) {
          if (this.user.state.s1_pass == Pass.NONE) {
            pass = Pass.IN_PROGRESS
          } else {
            return denied
          }
        }
        return {
          movement: 'ingress',
          pass: pass !== this.user.state.s1_pass,
          state: {
            state: State.CHECKPOINT,
            updated_at: new Date(),
            s1_pass: pass,
            s2_pass: this.user.state.s2_pass
          }
        }
      }
      case State.CHECKPOINT:
        switch (gate) {
          case Gate.S1:
            return {
              movement: 'egress',
              pass: false,
              state: {
                state: State.OUTSIDE,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass === Pass.IN_PROGRESS ? Pass.USED : this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass
              }
            }
          case Gate.S2:
            return {
              movement: 'egress',
              pass: false,
              state: {
                state: State.FIELD,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass === Pass.IN_PROGRESS ? Pass.USED : this.user.state.s2_pass
              }
            }
          case Gate.S3:
          case Gate.S4:
            return denied
        }
      case State.BAND:
      case State.BACKSTAGE:
        return denied
      case State.FIELD: {
        if (gate != Gate.S2) {
          return denied
        }
        let pass = this.user.state.s2_pass
        if (this.user.state.updated_at > today) {
          if (this.user.state.s2_pass == Pass.NONE) {
            pass = Pass.IN_PROGRESS
          } else {
            return denied
          }
        }
        return {
          movement: 'ingress',
          pass: pass !== this.user.state.s2_pass,
          state: {
            state: State.CHECKPOINT,
            updated_at: new Date(),
            s1_pass: this.user.state.s1_pass,
            s2_pass: pass
          }
        }
      }
    }
  }
}

export class RolePFsm extends RoleFsm {
  constructor(user: User) {
    super(user)
  }

  getAccess(gate: Gate): AccessInfo {
    switch (this.user.state.state) {
      case State.OUTSIDE:
        if (gate === Gate.S1) {
          return {
            movement: 'ingress',
            pass: false,
            state: {
              state: State.CHECKPOINT,
              updated_at: new Date(),
              s1_pass: this.user.state.s1_pass,
              s2_pass: this.user.state.s2_pass
            }
          }
        } else {
          return denied
        }
      case State.CHECKPOINT:
        switch (gate) {
          case Gate.S1:
            return {
              movement: 'ingress',
              pass: false,
              state: {
                state: State.OUTSIDE,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass
              }
            }
          case Gate.S2:
            return {
              movement: 'egress',
              pass: false,
              state: {
                state: State.FIELD,
                updated_at: new Date(),
                s1_pass: this.user.state.s1_pass,
                s2_pass: this.user.state.s2_pass
              }
            }
          case Gate.S3:
          case Gate.S4:
            return denied
        }
      case State.BACKSTAGE:
      case State.BAND:
        return denied
      case State.FIELD:
        if (gate === Gate.S2) {
          return {
            movement: 'ingress',
            pass: false,
            state: {
              state: State.CHECKPOINT,
              updated_at: new Date(),
              s1_pass: this.user.state.s1_pass,
              s2_pass: this.user.state.s2_pass
            }
          }
        } else {
          return denied
        }
    }
  }
}
