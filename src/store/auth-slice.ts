import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/lib/types";
import {
  clearSession,
  getStoredUser,
  getToken,
  storeSession,
  updateStoredUser,
} from "@/lib/token";

interface AuthState {
  user: User | null;
  token: string | null;
  /** True once we've read localStorage on the client — guards wait for this. */
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrate(state) {
      state.token = getToken();
      state.user = getStoredUser();
      state.hydrated = true;
    },
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
      storeSession(action.payload.token, action.payload.user);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      updateStoredUser(action.payload);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      clearSession();
    },
  },
});

export const { hydrate, setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
