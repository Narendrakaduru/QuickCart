import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  coupons: [],
  validCoupon: null, // For currently applied coupon during checkout
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all coupons (Admin)
export const fetchCoupons = createAsyncThunk(
  'coupons/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const { page = 1, limit = 10 } = params;
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`/api/coupons?page=${page}&limit=${limit}`, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create coupon (Admin)
export const createCoupon = createAsyncThunk(
  'coupons/create',
  async (couponData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post('/api/coupons', couponData, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update coupon (Admin)
export const updateCoupon = createAsyncThunk(
  'coupons/update',
  async ({ id, couponData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`/api/coupons/${id}`, couponData, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete coupon (Admin)
export const deleteCoupon = createAsyncThunk(
  'coupons/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(`/api/coupons/${id}`, config);
      return { id, data: response.data };
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Validate coupon (User)
export const validateCoupon = createAsyncThunk(
  'coupons/validate',
  async ({ code, purchaseAmount }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post('/api/coupons/validate', { code, purchaseAmount }, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    resetCouponStatus: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearAppliedCoupon: (state) => {
      state.validCoupon = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Coupon
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.coupons.unshift(action.payload.data);
      })
      // Update Coupon
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.isSuccess = true;
        const index = state.coupons.findIndex(c => c._id === action.payload.data._id);
        if (index !== -1) {
          state.coupons[index] = action.payload.data;
        }
      })
      // Delete Coupon
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(c => c._id !== action.payload.id);
      })
      // Validate Coupon
      .addCase(validateCoupon.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.validCoupon = action.payload.data;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.validCoupon = null;
      });
  },
});

export const { resetCouponStatus, clearAppliedCoupon } = couponSlice.actions;
export default couponSlice.reducer;
