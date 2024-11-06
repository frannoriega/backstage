import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { Controller } from "@/services/db/controllers";

class Store {
  private readonly sessionKey = "session";
  private readonly controllerKey = "controller";
  private readonly pkKey = "pk";

  async setSession(value: Session) {
    await AsyncStorage.setItem(this.sessionKey, JSON.stringify(value));
  }

  async getSession(): Promise<Session | null> {
    return this.getItem<Session>(this.sessionKey);
  }

  async setController(value: Controller) {
    await AsyncStorage.setItem(this.controllerKey, JSON.stringify(value));
  }

  async getController(): Promise<Controller | null> {
    return this.getItem<Controller>(this.controllerKey);
  }

  async setPrivateKey(value: string) {
    await AsyncStorage.setItem(this.pkKey, value);
  }

  async getPrivateKey(): Promise<string | null> {
    return await AsyncStorage.getItem(this.pkKey);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }

  private async getItem<T>(key: string): Promise<T | null> {
    const val = await AsyncStorage.getItem(key);
    if (!val) {
      return null;
    }
    return JSON.parse(val);
  }
}

const store = new Store();

export { store };
