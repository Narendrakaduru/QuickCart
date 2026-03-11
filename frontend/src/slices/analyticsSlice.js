import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchSearchAnalytics = createAsyncThunk(
  'analytics/fetchSearch',
  async (days = 7, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { days }
      };

      const { data } = await axios.get('/api/v1/analytics/search', config);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    searchAnalytics: null,
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetAnalytics: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSearchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchAnalytics = action.payload;
      })
      .addCase(fetchSearchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
