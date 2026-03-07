import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../slices/productSlice';
import cartReducer from '../slices/cartSlice';
import wishlistReducer from '../slices/wishlistSlice';
import authReducer from '../slices/authSlice';
import userReducer from '../slices/userSlice';
import orderReducer from '../slices/orderSlice';
import addressReducer from '../slices/addressSlice';
import logReducer from '../slices/logSlice';

const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    users: userReducer,
    orders: orderReducer,
    address: addressReducer,
    logs: logReducer,
  },
});

export default store;
