import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../slices/productSlice';
import cartReducer from '../slices/cartSlice';
import wishlistReducer from '../slices/wishlistSlice';
import authReducer from '../slices/authSlice';
import userReducer from '../slices/userSlice';
import orderReducer from '../slices/orderSlice';
import addressReducer from '../slices/addressSlice';
import logReducer from '../slices/logSlice';
import couponReducer from "../slices/couponSlice";
import notificationReducer from "../slices/notificationSlice";
import analyticsReducer from "../slices/analyticsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    users: userReducer,
    orders: orderReducer,
    addresses: addressReducer,
    logs: logReducer,
    coupons: couponReducer,
    notifications: notificationReducer,
    analytics: analyticsReducer,
  },
});

export default store;
