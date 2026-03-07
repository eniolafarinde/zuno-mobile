import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getToken, saveToken } from "../utils/token";
import * as AuthAPI from "../api/auth";

type AuthState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; user: AuthAPI.AuthUser };

type AuthContextValue = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  async function bootstrap() {
    const token = await getToken();
    if (!token) {
      setState({ status: "signedOut" });
      return;
    }
    try {
      const me = await AuthAPI.getMe();
      setState({ status: "signedIn", user: normalizeUser(me) });
    } catch {
      await clearToken();
      setState({ status: "signedOut" });
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  async function signIn(email: string, password: string) {
    const { token, user } = await AuthAPI.login(email, password);
    await saveToken(token);
    setState({ status: "signedIn", user });
  }

  async function signUp(email: string, password: string, name?: string) {
    const { token, user } = await AuthAPI.register(email, password, name);
    await saveToken(token);
    setState({ status: "signedIn", user });
  }

  async function signOut() {
    await clearToken();
    setState({ status: "signedOut" });
  }

  async function refreshMe() {
    if (state.status !== "signedIn") return;
    const me = await AuthAPI.getMe();
    setState({ status: "signedIn", user: normalizeUser(me) });
  }

  const value = useMemo<AuthContextValue>(
    () => ({ state, signIn, signUp, signOut, refreshMe }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function normalizeUser(me: any): AuthAPI.AuthUser {
  return {
    id: me.id || me._id,
    email: me.email,
    name: me.name,
    onboardingComplete: Boolean(me.onboardingComplete),
  };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}