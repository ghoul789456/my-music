import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SongInfo {
  id: number;
  title: string;
  duration: number;
  filePath: string | null;
  coverUrl: string | null;
  playCount: number | null;
  artist?: string;
}

interface PlayerState {
  playlist: SongInfo[];      // 播放队列
  currentIndex: number;      // 当前播放歌曲的下标
  isPlaying: boolean;
  volume: number;
  mode: "loop" | "single" | "shuffle";
  currentTime: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlayerState = {
  playlist: [],
  currentIndex: -1,          // -1 表示当前没有歌曲在播放
  isPlaying: false,
  volume: 0.5,
  mode: "loop",
  currentTime: 0,
  isLoading: false,
  error: null
};

const songSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // 设置整个播放列表并播放第一首
    setPlaylist: (state, action: PayloadAction<SongInfo[]>) => {
      state.playlist = action.payload;
      if (action.payload.length > 0) {
        state.currentIndex = 0;
        state.isPlaying = true;
      } else {
        state.currentIndex = -1;
        state.isPlaying = false;
      }
    },

    // 播放特定歌曲（如果列表中有则跳转索引，没有则插入）
    playSong: (state, action: PayloadAction<SongInfo>) => {
      const index = state.playlist.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.currentIndex = index;
      } else {
        state.playlist.push(action.payload);
        state.currentIndex = state.playlist.length - 1;
      }
      state.isPlaying = true;
      state.currentTime = 0;
    },

    // 下一曲
    nextSong: (state) => {
      const len = state.playlist.length;
      if (len === 0) return;

      if (state.mode === "shuffle") {
        // 随机模式：生成一个不等于当前索引的随机数（除非列表只有一首歌）
        let nextIndex = Math.floor(Math.random() * len);
        if (len > 1 && nextIndex === state.currentIndex) {
          nextIndex = (nextIndex + 1) % len;
        }
        state.currentIndex = nextIndex;
      } else if (state.mode === "single") {
        // 单曲循环：索引不变，但我们需要把时间重置为 0 触发 Audio 重播
        state.currentTime = 0;
      } else {
        // 列表循环
        state.currentIndex = (state.currentIndex + 1) % len;
      }

      state.isPlaying = true;
      state.currentTime = 0;
    },
    // 上一曲
    prevSong: (state) => {
      if (state.playlist.length === 0) return;
      // 循环播放逻辑：如果是第一首，则跳到最后一首
      state.currentIndex = (state.currentIndex - 1 + state.playlist.length) % state.playlist.length;
      state.isPlaying = true;
      state.currentTime = 0;
    },
    // 暂停/播放
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    // 设置音量
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    // 删除播放列表中的歌曲
    removeSong: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index < 0 || index >= state.playlist.length) return;

      state.playlist.splice(index, 1);

      // 如果删掉的是当前播放歌曲之前的歌，索引要往前移位
      if (index < state.currentIndex) {
        state.currentIndex--;
      }
      // 如果删掉的是当前正在播的歌
      else if (index === state.currentIndex) {
        if (state.playlist.length === 0) {
          state.currentIndex = -1;
          state.isPlaying = false;
        } else {
          // 自动播放下一首（现在的 index 已经是原列表的下一首了）
          state.currentIndex = index % state.playlist.length;
        }
      }
    },
    // 设置播放进度
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    // 更换播放模式
    setMode: (state, action: PayloadAction<PlayerState["mode"]>) => {
      state.mode = action.payload;
    },
    // 是否在加载中
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    //是否播放失败
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // 清空播放列表
    clearPlaylist: (state) => {
      state.playlist = [];
      state.currentIndex = -1;
      state.isPlaying = false;
    },
  }
});

export const { 
  setPlaylist, 
  playSong, 
  nextSong, 
  prevSong, 
  togglePlay, 
  setVolume, 
  removeSong,
  setCurrentTime,
  setMode,
  setLoading,
  setError,
  clearPlaylist
} = songSlice.actions;

//方便直接获取当前正在播的那首歌
export const selectCurrentSong = (state: { player: PlayerState }) =>
  state.player.currentIndex !== -1 ? state.player.playlist[state.player.currentIndex] : null;

export default songSlice.reducer;