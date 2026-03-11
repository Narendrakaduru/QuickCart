import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/v1/users';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, thunkAPI) => {
    try {
      const { page = 1, limit = 10 } = params;
      const url = `${API_URL}?page=${page}&limit=${limit}`;
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(url, config);
      console.log('Fetched Users:', response.data.data);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(API_URL, userData, config);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`${API_URL}/${id}`, userData, config);
      return response.data.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`${API_URL}/${id}`, config);
      return id;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch recently viewed (Sync with backend on login)
export const fetchRecentlyViewed = createAsyncThunk(
  'users/fetchRecentlyViewed',
  async (_, thunkAPI) => {
    try {
      const { getState } = thunkAPI;
      const { auth: { token } } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/recently-viewed`, config);
      
      // Update local storage to match database truth
      if (response.data && response.data.data) {
         localStorage.setItem('recentlyViewed', JSON.stringify(response.data.data));
      }

      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.error) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Sync single viewed product to backend
export const syncRecentlyViewed = createAsyncThunk(
  'users/syncRecentlyViewed',
  async (productId, thunkAPI) => {
    try {
      const { getState } = thunkAPI;
      const { auth: { token } } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${API_URL}/recently-viewed`, { productId }, config);
      return response.data;
    } catch {
       // Failing silently in background
      return thunkAPI.rejectWithValue('Sync failed');
    }
  }
);

const initialState = {
  users: [],
  user: null,
  addresses: [],
  addressStatus: 'idle',
  addressError: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
  // Recently Viewed State - Hybrid storage strategy
  recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewed')) || [],
  recentlyViewedStatus: 'idle',
};

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = '';
    },
    addRecentlyViewedLocal: (state, action) => {
      const product = action.payload;
      if (!product || !product._id) return;

      // Filter out if already exists
      let updatedHistory = state.recentlyViewed.filter(p => p._id !== product._id);
      
      // Unshift to front
      updatedHistory.unshift(product);
      
      // Limit to 15 items locally
      if (updatedHistory.length > 15) {
        updatedHistory.pop();
      }
      
      state.recentlyViewed = updatedHistory;
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedHistory));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Fetch Recently Viewed
      .addCase(fetchRecentlyViewed.pending, (state) => {
        state.recentlyViewedStatus = 'loading';
      })
      .addCase(fetchRecentlyViewed.fulfilled, (state, action) => {
        state.recentlyViewedStatus = 'succeeded';
        state.recentlyViewed = action.payload.data;
      })
      .addCase(fetchRecentlyViewed.rejected, (state) => {
        state.recentlyViewedStatus = 'failed';
        // Keep local storage copy on failure
      });
  },
});

export const { reset, addRecentlyViewedLocal } = userSlice.actions;
export default userSlice.reducer;
