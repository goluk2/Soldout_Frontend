import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],        // Home page ke liye
  searchProducts: [],  // Search page ke liye (Infinite scroll)
  loading: false,
  page: 1,             // Current page for infinite scroll
  hasMore: true,       // Kya aur products bache hain?
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    // Naya data purane data ke peeche jodne ke liye
    appendSearchProducts: (state, action) => {
      if (action.payload.length === 0) {
        state.hasMore = false;
      } else {
        state.searchProducts = [...state.searchProducts, ...action.payload];
        state.page += 1;
      }
    },
    // Jab user naya search karega tab puraani list clear karne ke liye
    resetSearchState: (state) => {
      state.searchProducts = [];
      state.page = 1;
      state.hasMore = true;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setProducts, appendSearchProducts, resetSearchState, setLoading } = productSlice.actions;
export default productSlice.reducer;