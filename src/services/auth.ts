import { supabase } from "@/utils/supabase";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { Session } from "@supabase/supabase-js";

enum Reason {
  NULL_USER,
  UNKNOWN,
  CANCELLED,
  IN_PROGRESS,
  NO_PLAY_SERVICES,
  NO_SESSION,
  SUPABASE_AUTH_ERROR,
  NO_ID_TOKEN
}

class SignInError extends Error {
  reason: Reason
  message: string
  cause: any

  constructor(
    reason: Reason,
    message: string,
    cause?: any
  ) {
    super()
    this.reason = reason,
      this.message = message,
      this.cause = cause
  }
}

class Auth {

  async signIn(): Promise<Session> {
    try {
      // TODO: Check if this is needed
      await GoogleSignin.hasPlayServices()
      const { data: userInfo } = await GoogleSignin.signIn();
      if (!userInfo) {
        throw new SignInError(Reason.NULL_USER, "User was null upon signin")
      }
      if (userInfo.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.idToken || "",
        });
        if (error || !data.session) {
          // TODO(fran): Handle this gracefully
          throw new SignInError(Reason.SUPABASE_AUTH_ERROR, `An error occurred ${error}`, error);
        }
        return data.session
      } else {
        throw new SignInError(Reason.NO_ID_TOKEN, "No ID token was provided")
      }
    } catch (error: any) {
      if ('code' in error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          throw new SignInError(Reason.CANCELLED, "Sign in cancelled")
        } else if (error.code === statusCodes.IN_PROGRESS) {
          throw new SignInError(Reason.IN_PROGRESS, "Sign in already in progress")
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new SignInError(Reason.NO_PLAY_SERVICES, "Play Services not available")
        }
      }
      if (error instanceof SignInError) {
        throw error
      }
      throw new SignInError(Reason.UNKNOWN, "An unknown error has occurred", error)
    }
  }
}

const auth = new Auth()

export { auth }
export { SignInError, Reason }
