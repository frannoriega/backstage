import AsyncStorage, { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";

enum Role {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  P = "P",
  S = "S",
  X = "X"
}

interface User {
  role: Role,
  name: string,
  lastname: string,
  email: string
}

class Store {
  private readonly sessionKey = 'session'
  private readonly userKey = 'user'
  private readonly pkKey = 'pk'

  async setSession(value: Session) {
    await AsyncStorage.setItem(this.sessionKey, JSON.stringify(value))
  }

  async getSession(): Promise<Session | null> {
    return this.getItem<Session>(this.sessionKey)
  }

  async setUser(value: User) {
    await AsyncStorage.setItem(this.userKey, JSON.stringify(value))
  }

  async getUser(): Promise<User | null> {
    return this.getItem<User>(this.userKey)
  }

  async setPrivateKey(value: string) {
    await AsyncStorage.setItem(this.userKey, value)
  }

  async getPrivateKey(): Promise<string | null> {
    return await AsyncStorage.getItem(this.pkKey)
  }

  private async getItem<T>(key: string): Promise<T | null> {
    const val = await AsyncStorage.getItem(key)
    if (!val) {
      return null
    }
    return JSON.parse(val)
  }
}

const store = new Store()

export { store };
