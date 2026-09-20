import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Booking } from "@/types/booking";

interface BookingsState { items: Booking[]; }
const initialState: BookingsState = { items: [] };

const slice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setBookings(state, action: PayloadAction<Booking[]>) { state.items = action.payload; },
    updateBooking(state, action: PayloadAction<Booking>) {
      const i = state.items.findIndex((b) => b.id === action.payload.id);
      if (i >= 0) state.items[i] = action.payload;
    }
  }
});
export const { setBookings, updateBooking } = slice.actions;
export default slice.reducer;
