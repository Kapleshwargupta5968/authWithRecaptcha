import { createSlice } from "@reduxjs/toolkit";

const clearAuthState = (state) => {
    state.loading = false;
    state.user = null;
    state.isAuthenticated = false;
    
    localStorage.removeItem("hasSession");
    localStorage.removeItem("user");
};

const userFromStorage = localStorage.getItem("user");
const hasSessionFromStorage = localStorage.getItem("hasSession");

const initialState = {
    user: userFromStorage ? JSON.parse(userFromStorage) : null,
    error: null,
    loading: false,
    isAuthenticated: hasSessionFromStorage === "true"
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        authStart: (state) => {
            state.loading = true;
            state.error = null;
            state.isAuthenticated = false;
        },
        authSuccess: (state, action) => {
            state.loading = false;
            if (action.payload?.user) {
                state.user = action.payload.user;
                localStorage.setItem("user", JSON.stringify(action.payload.user));
            }
            state.isAuthenticated = true;
            state.error = null;

            localStorage.setItem("hasSession", "true");
        },
        authFailure: (state, action) => {
            clearAuthState(state);
            state.error = action.payload;
        },
        logout: (state) => {
            clearAuthState(state);
            state.error = null;
        }
    }
});

export const { authStart, authSuccess, authFailure, logout } = authSlice.actions;
export default authSlice.reducer;