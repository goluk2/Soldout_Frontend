import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get("/cart");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    items: [],
    cartCount: 0,
    grandTotal: 0,
    loading: false,
  },

  reducers: {
    clearCart(state) {
      state.items = [];
      state.cartCount = 0;
      state.grandTotal = 0;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;

        state.items = action.payload.items || [];

        state.cartCount =
          action.payload.items?.length || 0;

        state.grandTotal =
          action.payload.grandTotal || 0;
      })

      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;