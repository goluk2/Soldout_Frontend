import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({

  name: "wishlist",

  initialState: {

    wishlistItems: [],
  },

  reducers: {

    setWishlist: (state, action) => {

      state.wishlistItems = action.payload;
    },

    addToWishlist: (state, action) => {

      state.wishlistItems.push(action.payload);
    },

    removeFromWishlist: (state, action) => {

      state.wishlistItems =
        state.wishlistItems.filter(

          (item) =>
            item.product._id !== action.payload
        );
    },
  },
});

export const {

  setWishlist,

  addToWishlist,

  removeFromWishlist,

} = wishlistSlice.actions;

export default wishlistSlice.reducer;