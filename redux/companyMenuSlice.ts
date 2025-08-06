// redux/slices/menuSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem } from '@/lib/types/types';
import { getMenuItems, updateMenuItem } from '@/lib/menu';
import {
  getMenuItemsFromIndexedDB,
  saveMenuItemsToIndexedDB,
} from '@/lib/dexie/actions';

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
  'menu/getMenuItemsPerCompany',
  async (companyId, { rejectWithValue }) => {
    try {
      const cachedMenuItems = await getMenuItemsFromIndexedDB();
      if (cachedMenuItems.length > 0) {
        console.log('Using cached menu items from IndexedDB', cachedMenuItems);
        return cachedMenuItems;
      }

      const fetchedMenuItems = await getMenuItems(companyId);
      await saveMenuItemsToIndexedDB(fetchedMenuItems);

      return fetchedMenuItems;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch menu items');
    }
  }
);

export const updateMenuItemData = createAsyncThunk<MenuItem, MenuItem>(
  'menu/updateMenuItem',
  async (menuItem, { rejectWithValue }) => {
    try {
      const updatedMenuItem = await updateMenuItem(menuItem);
      await saveMenuItemsToIndexedDB([updatedMenuItem]);
      console.log('Updated menu item in IndexedDB:', updatedMenuItem);
      return updatedMenuItem;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update menu item');
    }
  }
);

const companyMenuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(
        getMenuItemsPerCompany.fulfilled,
        (state, action: PayloadAction<MenuItem[]>) => {
          state.menuItems = action.payload;
          state.isLoading = false;
          state.error = null;
        }
      )
      .addCase(
        updateMenuItemData.fulfilled,
        (state, action: PayloadAction<MenuItem>) => {
          state.menuItems = state.menuItems.map(item =>
            item.id === action.payload.id ? action.payload : item
          );
          state.isLoading = false;
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is { type: string } =>
          action.type.endsWith('/pending'),
        state => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is { type: string } =>
          action.type.endsWith('/fulfilled'),
        state => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        (action): action is { type: string; payload?: any } =>
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error =
            typeof action.payload === 'string'
              ? action.payload
              : 'An error occurred';
        }
      );
  },
});

export default companyMenuSlice.reducer;
