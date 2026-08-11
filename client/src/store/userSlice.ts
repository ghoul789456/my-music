import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { readSession } from "../features/auth/session";
import type { UserInfo } from "../features/auth/types";

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  isLoggedIn: boolean;
  loginPromptOpen: boolean;
}

const session = readSession();

const initialState: UserState = {
  userInfo: null,
  token: session?.token ?? null,
  isLoggedIn: Boolean(session),
  loginPromptOpen: false,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // 登录成功时，同时更新 Redux 状态
    setLoginInfo: (
      state,
      action: PayloadAction<{ user: UserInfo; token: string }>,
    ) => {
      state.userInfo = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.loginPromptOpen = false;
    },

    // 存入从接口获取到的最新用户信息
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },

    // 退出登录清理
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      state.isLoggedIn = false;
      state.loginPromptOpen = false;
    },

    openLoginPrompt: (state) => {
      state.loginPromptOpen = true;
    },

    closeLoginPrompt: (state) => {
      state.loginPromptOpen = false;
    },
  },
});

export const {
  setLoginInfo,
  setUserInfo,
  logout,
  openLoginPrompt,
  closeLoginPrompt,
} = userSlice.actions;
export default userSlice.reducer;
