import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/v1/wishlist';

// Fetch wishlist
export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.get(API_URL, config);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Toggle wishlist item
export const toggleWishlist = createAsyncThunk('wishlist/toggleWishlist', async (productId, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.post(`${API_URL}/toggle`, { productId }, config);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlist: [],
    isLoading: false,
    isError: false,
    message: ''
  },
  reducers: {
    clearWishlist: (state) => {
      state.wishlist = [];
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })
      .addMatcher(
        (action) => action.type === 'auth/logout/fulfilled',
        (state) => {
          state.wishlist = [];
          state.isLoading = false;
          state.isError = false;
          state.message = '';
        }
      );
  }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
