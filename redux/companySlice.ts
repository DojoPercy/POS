import { getCompany } from '@/lib/company';
import {
  getCompanyFromIndexedDB,
  saveCompanyToIndexedDB,
} from '@/lib/dexie/actions';
import { Company } from '@/lib/types/types';
import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  RootState,
} from '@reduxjs/toolkit';

export const getCompanyDetails = createAsyncThunk<Company, string>(
  'company/getCompany',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const cachedCompany = await getCompanyFromIndexedDB(companyId);

      console.log('Cached company from IndexedDB:', cachedCompany);
      if (cachedCompany && cachedCompany.id === companyId) {
        console.log('Returning company details from cache (IndexedDB)');
        return cachedCompany;
      }

      const companyDetails = await getCompany(companyId);
      await saveCompanyToIndexedDB(companyDetails);
      return companyDetails;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch company details'
      );
    }
  }
);

interface CompanyState {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  company: null,
  isLoading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    resetCompanyState: state => {
      state.company = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getCompanyDetails.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCompanyDetails.fulfilled,
        (state, action: PayloadAction<Company>) => {
          state.isLoading = false;
          state.company = action.payload;
        }
      )
      .addCase(getCompanyDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCompanyState } = companySlice.actions;
export default companySlice.reducer;

export const selectCompany = (state: RootState) => state.company;
