import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  currentUser: `User${Math.floor(Math.random() * 1000)}`,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInitialMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setUsername: (state, action) => {
      state.currentUser = action.payload;
    }
  },
});

export const { setInitialMessages, addMessage, setUsername } = chatSlice.actions;

export default chatSlice.reducer;
