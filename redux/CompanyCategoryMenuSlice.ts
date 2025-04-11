import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuCategory } from "@/lib/types/types";

import { createMenuCategory, getMenuCategories } from "@/lib/menu";
import { cp } from "fs";
import { getMenuCategoriesFromIndexedDB, saveMenuCategoryToIndexedDB } from "@/lib/dexie/actions";

export const fetchMenuCategoriesOfCompany = createAsyncThunk(
    "menu/fetchMenuCategoriesOfCompany",
    async (companyId: string) => {
        console.log("Fetching menu categories for company:", companyId);
        const cachedMenuCategories = await getMenuCategoriesFromIndexedDB();
        if (cachedMenuCategories.length > 0) {
            console.log("Using cached menu categories from IndexedDB");
            return cachedMenuCategories;
        }

        
        const categories = await getMenuCategories(companyId);
        await saveMenuCategoryToIndexedDB(categories); 
        return categories;
    }
);

export const addNewMenuCategory = createAsyncThunk<MenuCategory, any>(
    "menu/addNewMenuCategory",
    async (categoryData) => {
    
        const newCategory = await createMenuCategory(categoryData); 
        
       
        await saveMenuCategoryToIndexedDB([newCategory]);
        return newCategory; 
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
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenuCategoriesOfCompany.fulfilled, (state, action: PayloadAction<MenuCategory[]>) => {
                state.categories = action.payload;
                state.status = "succeeded";
            })
            .addCase(addNewMenuCategory.fulfilled, (state, action: PayloadAction<MenuCategory>) => {
                state.categories.push(action.payload); // Add the new category to the state
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
            .addMatcher(
                (action) => action.type.endsWith("/rejected"),
                (state, action) => {
                    state.status = "failed";
                }
            );
    },
});

export default companyCategoryMenuSlice.reducer;
