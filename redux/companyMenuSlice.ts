import { createMenuItem, getMenuItems } from "@/lib/menu";
import { MenuItem } from "@/lib/types/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MenuState {
    menuItems: MenuItem[];
    isLoading: boolean;
    error: string | null;
}

const initialState: MenuState = {
    menuItems: [],
    isLoading: false,
    error: null,
};


export const getMenuItemsPerCompany = createAsyncThunk<MenuItem[], string>(
    "menu/getMenuItemsPerCompany",
    async (companyId) => {
        return await getMenuItems(companyId);
    }
);


export const addNewMenuItem = createAsyncThunk<MenuItem, MenuItem>(
    "menu/addNewMenuItem",
    async (menuItemData) => {
        return await createMenuItem(menuItemData);
    }
);


const companyMenuSlice = createSlice({
    name: "menu",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getMenuItemsPerCompany.fulfilled, (state, action: PayloadAction<MenuItem[]>) => {
                state.menuItems = action.payload;
            })
            .addCase(addNewMenuItem.fulfilled, (state, action: PayloadAction<MenuItem>) => {
                state.menuItems.push(action.payload);
            })
            .addMatcher(
                (action): action is { type: string } => action.type.endsWith("/pending"),
                (state) => {
                    state.isLoading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action): action is { type: string } => action.type.endsWith("/fulfilled"),
                (state) => {
                    state.isLoading = false;
                }
            )
            .addMatcher(
                (action): action is { type: string; payload: string } => action.type.endsWith("/rejected"),
                (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                }
            );
    },
});

// Export reducer
export default companyMenuSlice.reducer;
