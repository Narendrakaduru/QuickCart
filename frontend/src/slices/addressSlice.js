import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/addresses';

// Fetch all addresses
export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(API_URL, config);
      return response.data.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add an address
export const addAddress = createAsyncThunk(
  'address/addAddress',
  async (addressData, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.post(API_URL, addressData, config);
      return response.data.data;
    } catch (error) {
       const message = (error.response && error.response.data && error.response.data.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update an address
export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async ({ id, addressData }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.put(`${API_URL}/${id}`, addressData, config);
      return response.data.data;
    } catch (error) {
       const message = (error.response && error.response.data && error.response.data.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete an address
export const deleteAddress = createAsyncThunk(
  'address/deleteAddress',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.delete(`${API_URL}/${id}`, config);
      return response.data.data;
    } catch (error) {
       const message = (error.response && error.response.data && error.response.data.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  addresses: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
};

export const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    reset: (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
        // fetchAddresses
        .addCase(fetchAddresses.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(fetchAddresses.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.addresses = action.payload;
        })
        .addCase(fetchAddresses.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
        // addAddress
        .addCase(addAddress.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(addAddress.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            
            // If the new address is default, reset others in state
            if (action.payload.isDefault) {
                state.addresses = state.addresses.map(addr => ({...addr, isDefault: false}));
            }
            state.addresses.push(action.payload);
        })
        .addCase(addAddress.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
        // updateAddress
        .addCase(updateAddress.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(updateAddress.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;

            // If updated to default, reset others
            if (action.payload.isDefault) {
                state.addresses = state.addresses.map(addr => ({...addr, isDefault: false}));
            }

            const index = state.addresses.findIndex((addr) => addr._id === action.payload._id);
            if (index !== -1) {
              state.addresses[index] = action.payload;
            }
        })
        .addCase(updateAddress.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
        // deleteAddress
        .addCase(deleteAddress.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(deleteAddress.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.addresses = state.addresses.filter(
                (addr) => addr._id !== action.meta.arg // using the id passed to deleteAddress
            );

            // Handle fallback if default was deleted in UI state immediately
            // Optionally, we could refetch all addresses instead
            if (!state.addresses.find(addr => addr.isDefault) && state.addresses.length > 0) {
                 state.addresses[0].isDefault = true;
            }
        })
        .addCase(deleteAddress.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        });
  }
});

export const { reset } = addressSlice.actions;
export default addressSlice.reducer;
