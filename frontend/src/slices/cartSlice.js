import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Get user from localStorage based on JWT auth (mocking for simplicity)
const API_URL = "/api/v1/cart";

// Fetch user cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(API_URL, config);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message,
      );
    }
  },
);

export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ productId, quantity, action }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        API_URL,
        { productId, quantity, action },
        config,
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message,
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null,
    isLoading: false,
    isError: false,
    message: "",
  },
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addMatcher(
        (action) => action.type === "orders/createOrder/fulfilled",
        (state) => {
          if (state.cart) {
            state.cart = { ...state.cart, items: [] };
          }
        },
      )
      .addMatcher(
        (action) => action.type === "auth/logout/fulfilled",
        (state) => {
          state.cart = null;
          state.isLoading = false;
          state.isError = false;
          state.message = "";
        },
      );
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
