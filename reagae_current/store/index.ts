import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import ridesReducer from "./slices/ridesSlice";
import bookingsReducer from "./slices/bookingsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      rides: ridesReducer,
      bookings: bookingsReducer
    }
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
