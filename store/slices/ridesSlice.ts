import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Ride } from "@/types/ride";

interface RidesState { items: Ride[]; }
const initialState: RidesState = { items: [] };

const slice = createSlice({
  name: "rides",
  initialState,
  reducers: {
    setRides(state, action: PayloadAction<Ride[]>) { state.items = action.payload; },
    addRide(state, action: PayloadAction<Ride>) { state.items.unshift(action.payload); }
  }
});
export const { setRides, addRide } = slice.actions;
export default slice.reducer;
