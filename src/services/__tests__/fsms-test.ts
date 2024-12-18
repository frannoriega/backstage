import { Gate } from "../db/controllers"
import { Pass, Role, State, User, UserState } from "../db/users"
import { AccessInfo, createFsm } from "../fsms"

class FsmTester {
  private user: User
  private movements: { gate: Gate, expected: AccessInfo }[]

  constructor(user: User) {
    this.user = user
    this.movements = []
  }

  useGate(gate: Gate, expected: AccessInfo): FsmTester {
    this.movements.push({ gate, expected })
    return this
  }

  validate(): void {
    for (const { gate, expected } of this.movements) {
      const fsm = createFsm(this.user)
      const res = fsm.canAccess(gate)
      expect(res.movement).toEqual(expected.movement)
      expect(res.pass).toEqual(expected.pass)
      expect(res.state?.state).toEqual(expected.state?.state)
      expect(res.state?.s1_pass).toEqual(expected.state?.s1_pass)
      expect(res.state?.s2_pass).toEqual(expected.state?.s2_pass)
      if (expected.state) {
        this.user.state = expected.state
      }
    }
  }
}


describe("The Role A/X FSM", () => {
  test("doesn't work on disabled users", () => {
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.A,
      email: 'email@example.com',
      phone: '123456',
      enabled: false,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }

    new FsmTester(user)
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .validate()

  })

  test("works on complex scenarios", () => {
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.A,
      email: 'email@example.com',
      phone: '123456',
      enabled: true,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }

    new FsmTester(user)
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .useGate(Gate.S1, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'egress', pass: false, state: { state: State.OUTSIDE, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .useGate(Gate.S1, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S3, { movement: 'ingress', pass: false, state: { state: State.BAND, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S4, { movement: 'ingress', pass: false, state: { state: State.BACKSTAGE, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'egress', pass: false, state: { state: State.BAND, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S3, { movement: 'egress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'egress', pass: false, state: { state: State.OUTSIDE, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .validate()
  })
})

describe("The Role B FSM", () => {
  afterEach(() => {
    jest.useFakeTimers().clearAllTimers()
  })

  test("doesn't work on disabled users", () => {
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.B,
      email: 'email@example.com',
      phone: '123456',
      enabled: false,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }

    new FsmTester(user)
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .validate()

  })

  test("works on complex scenarios", () => {
    const date = new Date()
    date.setHours(18)
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.B,
      email: 'email@example.com',
      phone: '123456',
      enabled: true,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }
    jest
      .useFakeTimers()
      .setSystemTime(date);
    new FsmTester(user)
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .useGate(Gate.S1, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'egress', pass: false, state: { state: State.OUTSIDE, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .useGate(Gate.S1, { movement: 'ingress', pass: true, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'ingress', pass: true, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.IN_PROGRESS } })
      .useGate(Gate.S3, { movement: 'ingress', pass: false, state: { state: State.BAND, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.IN_PROGRESS } })
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'egress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.IN_PROGRESS } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.USED } })
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .validate()
  })

  test("doesn't allowed invalid timeframes", () => {
    const yesterday = new Date()
    yesterday.setHours(18)
    yesterday.setUTCDate(yesterday.getUTCDay() - 1)
    const today = new Date()
    today.setHours(12)
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.B,
      email: 'email@example.com',
      phone: '123456',
      enabled: true,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      },
      valid_from: yesterday,
      valid_to: today
    }
    const date = new Date()
    date.setHours(18)
    jest
      .useFakeTimers()
      .setSystemTime(date)
    new FsmTester(user)
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
    .validate()
  })

  test("allows valid timeframes", () => {
    const tomorrow = new Date()
    tomorrow.setHours(12)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const today = new Date()
    today.setHours(18)
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.B,
      email: 'email@example.com',
      phone: '123456',
      enabled: true,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      },
      valid_from: today,
      valid_to: tomorrow
    }
    const date = new Date()
    date.setHours(17)
    jest
      .useFakeTimers()
      .setSystemTime(date)
    new FsmTester(user)
      .useGate(Gate.S1, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .validate()
  })

  test("works with S1 passes", () => {
    const date = new Date()
    date.setHours(18)
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.B,
      email: 'email@example.com',
      phone: '123456',
      enabled: true,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }
    jest
      .useFakeTimers()
      .setSystemTime(date);
    new FsmTester(user)
      .useGate(Gate.S1, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'egress', pass: false, state: { state: State.OUTSIDE, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'ingress', pass: true, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'egress', pass: false, state: { state: State.OUTSIDE, updated_at: new Date(), s1_pass: Pass.USED, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .validate()
  })

  test("works with S2 passes", () => {
    const date = new Date()
    date.setHours(18)
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.B,
      email: 'email@example.com',
      phone: '123456',
      enabled: true,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }
    jest
      .useFakeTimers()
      .setSystemTime(date);
    new FsmTester(user)
      .useGate(Gate.S1, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'ingress', pass: true, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.IN_PROGRESS } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.USED } })
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .validate()
  })
})

describe("The Role C FSM", () => {
  afterEach(() => {
    jest.useFakeTimers().clearAllTimers()
  })

  test("doesn't work on disabled users", () => {
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.C,
      email: 'email@example.com',
      phone: '123456',
      enabled: false,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }

    new FsmTester(user)
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .validate()

  })

  test("works on complex scenarios", () => {
    const date = new Date()
    date.setHours(18)
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.C,
      email: 'email@example.com',
      phone: '123456',
      enabled: true,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }
    jest
      .useFakeTimers()
      .setSystemTime(date);
    new FsmTester(user)
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .useGate(Gate.S1, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'egress', pass: false, state: { state: State.OUTSIDE, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .useGate(Gate.S1, { movement: 'ingress', pass: true, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'ingress', pass: true, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.IN_PROGRESS } })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.USED } })
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .validate()
  })

  test("works with S1 passes", () => {
    const date = new Date()
    date.setHours(18)
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.C,
      email: 'email@example.com',
      phone: '123456',
      enabled: true,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }
    jest
      .useFakeTimers()
      .setSystemTime(date);
    new FsmTester(user)
      .useGate(Gate.S1, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'egress', pass: false, state: { state: State.OUTSIDE, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'ingress', pass: true, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.IN_PROGRESS, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'egress', pass: false, state: { state: State.OUTSIDE, updated_at: new Date(), s1_pass: Pass.USED, s2_pass: Pass.NONE } })
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .validate()
  })

  test("works with S2 passes", () => {
    const date = new Date()
    date.setHours(18)
    const user: User = {
      id: 1,
      name: 'Test',
      lastname: 'Test',
      dni: 1111111,
      role: Role.C,
      email: 'email@example.com',
      phone: '123456',
      enabled: true,
      group: 'group',
      photo_url: 'photo',
      state: {
        state: State.OUTSIDE,
        updated_at: new Date(),
        s1_pass: Pass.NONE, s2_pass: Pass.NONE
      }
    }
    jest
      .useFakeTimers()
      .setSystemTime(date);
    new FsmTester(user)
      .useGate(Gate.S1, { movement: 'ingress', pass: false, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.NONE } })
      .useGate(Gate.S2, { movement: 'ingress', pass: true, state: { state: State.CHECKPOINT, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.IN_PROGRESS } })
      .useGate(Gate.S2, { movement: 'egress', pass: false, state: { state: State.FIELD, updated_at: new Date(), s1_pass: Pass.NONE, s2_pass: Pass.USED } })
      .useGate(Gate.S1, { movement: 'denied', pass: false })
      .useGate(Gate.S2, { movement: 'denied', pass: false })
      .useGate(Gate.S3, { movement: 'denied', pass: false })
      .useGate(Gate.S4, { movement: 'denied', pass: false })
      .validate()
  })
})

