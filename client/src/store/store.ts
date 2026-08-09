import { configureStore, type Middleware } from "@reduxjs/toolkit";
import userSlice, { openLoginPrompt } from "./userSlice";
import songSlice, {
  nextSong,
  prevSong,
  setCurrentIndex,
  setPlaylist,
  togglePlay,
} from "./songSlice";

const playbackAuthMiddleware: Middleware = (api) => (next) => (action) => {
  const state = api.getState() as {
    user: { isLoggedIn: boolean };
    player: { isPlaying: boolean };
  };

  const startsPlayback =
    setPlaylist.match(action) ||
    nextSong.match(action) ||
    prevSong.match(action) ||
    setCurrentIndex.match(action) ||
    (togglePlay.match(action) && !state.player.isPlaying);

  if (startsPlayback && !state.user.isLoggedIn) {
    api.dispatch(openLoginPrompt());
    return action;
  }

  return next(action);
};

const store = configureStore({
  reducer: {
    user: userSlice,
    player:songSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(playbackAuthMiddleware),
});
//返回类型，指定state的类型是什么
export type RootState = ReturnType<typeof store.getState>;
//指定useDispatch返回类型，在异步执行时不会报错,给useDispatch钩子用的类型
export type AppDispatch = typeof store.dispatch;
export default store;
