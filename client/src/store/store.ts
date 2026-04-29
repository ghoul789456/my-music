import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import songSlice from './songSlice'
const store = configureStore({
  reducer: {
    user: userSlice,
    player:songSlice
  },
});
//返回类型，指定state的类型是什么
export type RootState = ReturnType<typeof store.getState>;
//指定useDispatch返回类型，在异步执行时不会报错,给useDispatch钩子用的类型
export type AppDispatch = typeof store.dispatch;
export default store;
