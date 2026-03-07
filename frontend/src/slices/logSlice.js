import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  logs: [],
  pagination: {},
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get system logs
export const fetchLogs = createAsyncThunk(
  'logs/getAll',
  async ({ page = 1, limit = 50, action = '', status = '' } = {}, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let url = `/api/logs?page=${page}&limit=${limit}`;
      if (action) url += `&action=${action}`;
      if (status) url += `&status=${status}`;

      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.logs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = logSlice.actions;
export default logSlice.reducer;
