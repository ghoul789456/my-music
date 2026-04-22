import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  id: number | null;
  username: string;
  email: string;
  avatar: string | null;
}

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  isLoggedIn: boolean;
}

// 1. 核心修改：初始化时解析本地 auth_data
const getInitialAuth = () => {
  const authData = localStorage.getItem("auth_data");
  if (!authData) return { token: null, isLoggedIn: false };

  try {
    const { token, userId, expiry } = JSON.parse(authData);
    // 检查是否过期
    if (Date.now() > expiry) {
      localStorage.removeItem("auth_data");
      return { token: null, isLoggedIn: false };
    }
    return { token, isLoggedIn: true };
  } catch (error) {
    console.error("解析 auth_data 失败", error);
    return { token: null, isLoggedIn: false };
  }
};

const auth = getInitialAuth();

const initialState: UserState = {
  userInfo: null,
  token: auth.token,
  isLoggedIn: auth.isLoggedIn,
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
      localStorage.removeItem("auth_data");
    },
  },
});

export const { setLoginInfo, setUserInfo, logout } = userSlice.actions;
export default userSlice.reducer;
