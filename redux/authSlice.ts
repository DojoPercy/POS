import { fetchUsers } from "@/lib/auth";
import { clearAllIndexedDB } from "@/lib/dexie/actions";
import { DecodedToken } from "@/lib/types/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface AuthState {
    user: DecodedToken | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}
const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("token") : null;
const decodedUser = tokenFromStorage ? fetchUsers() : null; // Fetch user details based on token

const initialState: AuthState = {
    user: decodedUser,
    token: tokenFromStorage,
    loading: false,
    error: null,
};
export const fetchUserFromToken = createAsyncThunk(
    "auth/fetchUserFromToken",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null; // No token, return null

           

            const decoded: DecodedToken = fetchUsers(); // Decode JWT
            return decoded;
        } catch (err) {
            return rejectWithValue("Failed to fetch user data");
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (formData: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post("/api/login", formData);
            if (response.status === 200) {
                const token = response.data.token;
                if (!token) throw new Error("Token is missing in the response.");

                localStorage.setItem("token", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                const decoded: DecodedToken = fetchUsers();
                return { token, user: decoded };
            }
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || "Login failed. Please try again.");
        }
    }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => { 
    console.log("Logging out user...");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    const response = await axios.post("/api/logout");
    await clearAllIndexedDB()
    if(response.status === 200){
        console.log("User logged out successfully.");
    }
    

})


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
        },
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload!.token;
                state.user = action.payload!.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            }).addCase(fetchUserFromToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserFromToken.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; // Store decoded user
            })
            .addCase(fetchUserFromToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(logoutUser.fulfilled, (state)=>{
                state.user = null;
                state.token = null;
                
            })
    },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (state: { auth?: AuthState }) => state.auth?.user ?? null;
