import { createMenuCategory, getMenuCategories } from "@/lib/menu";
import { MenuCategory } from "@/lib/types/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const fetchMenuCategoriesOfCompany = createAsyncThunk(
    "expenses/fetchMenuCategoriesOfCompany",
    async (companyId: string) => {
        return await getMenuCategories(companyId);
    }
)

export const addNewMenuCategory = createAsyncThunk<MenuCategory, { companyId: string; name: string; description?: string }>(
    "menu/addNewMenuCategory",
    async (categoryData) => {
        return await createMenuCategory(categoryData);
    }
);

interface MenuCategoryState {
    categories: MenuCategory[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: MenuCategoryState = {
    categories: [],
    status: "idle",
    error: null,
};

const companyCategoryMenuSlice = createSlice({
    name: "companyCategoryMenu",
    initialState: initialState,
    reducers: {},
    extraReducers: 
       (builder) => {
        builder
            .addCase(fetchMenuCategoriesOfCompany.fulfilled, (state, action)=> {
            state.categories = action.payload;
        })
        .addCase(addNewMenuCategory.fulfilled, (state, action: PayloadAction<MenuCategory>) => {
            state.categories.push(action.payload);
        })
        .addMatcher(
            (action) => action.type.endsWith("/pending"),
            (state) => {
                state.status = "loading";
            }
        )
        .addMatcher(
            (action) => action.type.endsWith("/fulfilled"),
            (state) => {
                state.status = "succeeded";
            }
        )
       }})

    

       export default companyCategoryMenuSlice.reducer;