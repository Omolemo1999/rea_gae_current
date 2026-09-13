import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = { user: null, loading: true };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.loading = false;
    },
    logout(state) {
      state.user = null;
    }
  }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
