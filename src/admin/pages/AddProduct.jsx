import { useState } from "react";

import axiosInstance from "../../api/axios";

import { toast } from "react-toastify";

const AddProduct = () => {

  const [loading, setLoading] =
    useState(false);

  const [productData, setProductData] =
    useState({

      name: "",

      description: "",

      category: "",

      brand: "",
      highlights: [""],

        specifications: {
    brand: "",
    fabric: "",
    fit: "",
    sleeve: "",
    neck: "",
    pattern: "",
    occasion: "",
    closure: "",
    washCare: "Machine Wash",
    country: "India",
  },
     
    });

  const [variants, setVariants] =
    useState([

      {
        color: "",

        images: {
        front: null,
        back: null,
        left: null,
        right: null,
      },

        sizes: [

          {
            size: "",

            stock: "",

            price: "",
          },
        ],
      },
    ]);

  // PRODUCT CHANGE
  const handleProductChange = (e) => {

    setProductData({

      ...productData,

      [e.target.name]: e.target.value,
    });
  };

const handleSpecificationChange = (field, value) => {
  setProductData({
    ...productData,
    specifications: {
      ...productData.specifications,
      [field]: value,
    },
  });
};


  // VARIANT CHANGE
  const handleVariantChange = (
    index,
    field,
    value
  ) => {

    const updatedVariants = [...variants];

    updatedVariants[index][field] = value;

    setVariants(updatedVariants);
  };

  // SIZE CHANGE
  const handleSizeChange = (
    variantIndex,
    sizeIndex,
    field,
    value
  ) => {

    const updatedVariants = [...variants];

    updatedVariants[
      variantIndex
    ].sizes[sizeIndex][field] = value;

    setVariants(updatedVariants);
  };

  // IMAGE CHANGE
  const handleImageChange = (
    variantIndex,
    side,
    file,
    
  ) => {

    const updatedVariants = [...variants];

    updatedVariants[variantIndex].images[side] =
      file;

    setVariants(updatedVariants);
  };

  // ADD VARIANT
  const addVariant = () => {

    setVariants([

      ...variants,

      {
        color: "",

        images: {
    front: null,
    back: null,
    left: null,
    right: null,
  },

        sizes: [
          {
            size: "",

            stock: "",

            price: "",
          },
        ],
      },
    ]);
  };

  // ADD SIZE
  const addSize = (variantIndex) => {

    const updatedVariants = [...variants];

    updatedVariants[variantIndex].sizes.push({
      size: "",

      stock: "",

      price: "",
    });

    setVariants(updatedVariants);
  };

  // REMOVE VARIANT
  const removeVariant = (index) => {

    const updatedVariants =
      variants.filter(
        (_, i) => i !== index
      );

    setVariants(updatedVariants);
  };

  // REMOVE SIZE
  const removeSize = (
    variantIndex,
    sizeIndex
  ) => {

    const updatedVariants = [...variants];

    updatedVariants[
      variantIndex
    ].sizes = updatedVariants[
      variantIndex
    ].sizes.filter(
      (_, i) => i !== sizeIndex
    );

    setVariants(updatedVariants);
  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    for (const [vIndex, variant] of variants.entries()) {
  if (!variant.color?.trim()) {
    toast.error(`Variant ${vIndex + 1}: Color is required`);
    return;
  }

  if (!Array.isArray(variant.sizes) || variant.sizes.length === 0) {
    toast.error(`Variant ${vIndex + 1}: At least one size is required`);
    return;
  }

  for (const sizeObj of variant.sizes) {
    const price = Number(sizeObj.price);
    const stock = Number(sizeObj.stock);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error(
        `Variant ${vIndex + 1} (${variant.color}): Price must be greater than 0`
      );
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      toast.error(
        `Variant ${vIndex + 1} (${variant.color}): Stock cannot be negative`
      );
      return;
    }

    if (!sizeObj.size?.trim()) {
      toast.error(
        `Variant ${vIndex + 1} (${variant.color}): Size is required`
      );
      return;
    }
  }
}

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append(
        "name",
        productData.name
      );

      formData.append(
        "description",
        productData.description
      );

      formData.append(
        "category",
        productData.category
      );

      formData.append(
        "brand",
        productData.brand
      );


      formData.append(
  "highlights",
  JSON.stringify(productData.highlights)
);

formData.append(
  "specifications",
  JSON.stringify(productData.specifications)
);

      // PREPARE VARIANTS
      const finalVariants = variants.map(
        (variant) => ({
          color: variant.color,

          sizes: variant.sizes.map(
            (size) => ({
              size: size.size,

              stock: Number(
                size.stock
              ),

              price: Number(
                size.price
              ),
            })
          ),
        })
      );

      formData.append(
        "variants",
        JSON.stringify(finalVariants)
      );

      // IMAGES
      variants.forEach(
        (variant, index) => {

         Object.entries(variant.images).forEach(
  ([side, image]) => {
    if (image) {
      formData.append(
        `variant_${index}_${side}`,
        image
      );
    }
  }
);
        }
      );

      const response =
        await axiosInstance.post(

          "/products/add",

          formData,

          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      toast.success(
        response.data.message
      );

      // RESET
      setProductData({

        name: "",

        description: "",

        category: "",

        brand: "",
        highlights: [""],
          specifications: {
    brand: "",
    fabric: "",
    fit: "",
    sleeve: "",
    neck: "",
    pattern: "",
    occasion: "",
    closure: "",
    washCare: "Machine Wash",
    country: "India",
  },
        promoType: "none",
promoText: "",
promoBanner: false,
promoEndTime: "",
      });

      setVariants([
        {
          color: "",

          images: {
      front: null,
      back: null,
      left: null,
      right: null,
    },

          sizes: [
            {
              size: "",

              stock: "",

              price: "",
            },
          ],
        },
      ]);

      setLoading(false);

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );

      setLoading(false);
    }
  };



const handleHighlightChange = (index, value) => {
  const updatedHighlights = [...productData.highlights];
  updatedHighlights[index] = value;

  setProductData({
    ...productData,
    highlights: updatedHighlights,
  });
};

const addHighlight = () => {
  setProductData({
    ...productData,
    highlights: [...productData.highlights, ""],
  });
};

const removeHighlight = (index) => {
  const updatedHighlights =
    productData.highlights.filter((_, i) => i !== index);

  setProductData({
    ...productData,
    highlights: updatedHighlights,
  });
};

  return (

    <div className="max-w-7xl mx-auto">

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <h1 className="text-4xl font-bold mb-8">
          Add Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* BASIC INFO */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={productData.name}
              onChange={handleProductChange}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none"
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={productData.category}
              onChange={handleProductChange}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none"
              required
            />

            <input
              type="text"
              name="brand"
              placeholder="Brand"
              value={productData.brand}
              onChange={handleProductChange}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none"
            />



          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={productData.description}
            onChange={handleProductChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none h-[140px]"
            required
          />



          {/* VARIANTS */}

          <div className="space-y-8">

            {
              variants.map(
                (variant, variantIndex) => (

                  <div
                    key={variantIndex}
                    className="border border-slate-700 rounded-2xl p-6 bg-slate-950"
                  >

                    <div className="flex items-center justify-between mb-6">

                      <h2 className="text-2xl font-bold">
                        Variant {variantIndex + 1}
                      </h2>

                      {
                        variants.length > 1 && (

                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(
                                variantIndex
                              )
                            }
                            className="bg-red-500 px-4 py-2 rounded-lg"
                          >
                            Remove
                          </button>
                        )
                      }

                    </div>

                    {/* COLOR */}

                    <input
                      type="text"
                      placeholder="Color"
                      value={variant.color}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          "color",
                          e.target.value
                        )
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none mb-5"
                      required
                    />

                    {/* IMAGES */}

                    <div className="grid grid-cols-2 gap-4 mb-6">

  {["front", "back", "left", "right"].map((side) => (
    <div key={side}>
      <label className="block mb-2 font-semibold capitalize">
        {side} Image
      </label>

      <input
        type="file"
        onChange={(e) =>
          handleImageChange(
            variantIndex,
            side,
            e.target.files[0]
          )
        }
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3"
      />

      {variant.images[side] && (
        <img
          src={URL.createObjectURL(
            variant.images[side]
          )}
          alt={side}
          className="w-24 h-24 mt-3 rounded-xl object-cover"
        />
      )}
    </div>
  ))}

</div>

                    {/* PREVIEW */}

                    {/* <div className="flex gap-3 flex-wrap mb-6">

                      {
                        variant.images.length >
                          0 &&

                        [...variant.images].map(
                          (
                            image,
                            imgIndex
                          ) => (

                            <img
                              key={imgIndex}
                              src={URL.createObjectURL(
                                image
                              )}
                              alt=""
                              className="w-24 h-24 object-cover rounded-xl border border-slate-700"
                            />
                          )
                        )
                      }

                    </div> */}

                    {/* SIZES */}

                    <div className="space-y-5">

                      {
                        variant.sizes.map(
                          (
                            size,
                            sizeIndex
                          ) => (

                            <div
                              key={sizeIndex}
                              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
                            >

                              <input
                                type="text"
                                placeholder="Size"
                                value={size.size}
                                onChange={(e) =>
                                  handleSizeChange(
                                    variantIndex,
                                    sizeIndex,
                                    "size",
                                    e.target.value
                                  )
                                }
                                className="bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none"
                                required
                              />

                              <input
                                type="number"
                                min="0"
                                placeholder="Stock"
                                value={size.stock}
                                onChange={(e) =>
                                  handleSizeChange(
                                    variantIndex,
                                    sizeIndex,
                                    "stock",
                                    e.target.value
                                  )
                                }
                                className="bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none"
                                required
                              />

                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="Price"
                                value={size.price}
                                onChange={(e) =>
                                  handleSizeChange(
                                    variantIndex,
                                    sizeIndex,
                                    "price",
                                    e.target.value
                                  )
                                }
                                className="bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none"
                                required
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeSize(
                                    variantIndex,
                                    sizeIndex
                                  )
                                }
                                className="bg-red-500 hover:bg-red-600 p-4 rounded-xl"
                              >
                                Remove Size
                              </button>

                            </div>
                          )
                        )
                      }

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        addSize(
                          variantIndex
                        )
                      }
                      className="mt-5 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl"
                    >
                      Add Size
                    </button>

                  </div>
                )
              )
            }

          </div>

          {/* ADD VARIANT */}

          <button
            type="button"
            onClick={addVariant}
            className="bg-green-600 hover:bg-green-700 px-6 py-4 rounded-xl font-bold"
          >
            Add New Variant
          </button>

          {/* SUBMIT */}


{/* PRODUCT SPECIFICATIONS */}

<div className="space-y-5 border border-slate-700 rounded-2xl p-6 bg-slate-950">

  <h2 className="text-2xl font-bold">
    Product Specifications
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

   

    <input
      type="text"
      placeholder="Fabric"
      value={productData.specifications.fabric}
      onChange={(e) =>
        handleSpecificationChange("fabric", e.target.value)
      }
      className="bg-slate-800 border border-slate-700 rounded-xl p-4"
      required
    />

    <input
      type="text"
      placeholder="Fit"
      value={productData.specifications.fit}
      onChange={(e) =>
        handleSpecificationChange("fit", e.target.value)
      }
      className="bg-slate-800 border border-slate-700 rounded-xl p-4"
      required
    />

    <input
      type="text"
      placeholder="Sleeve"
      value={productData.specifications.sleeve}
      onChange={(e) =>
        handleSpecificationChange("sleeve", e.target.value)
      }
      className="bg-slate-800 border border-slate-700 rounded-xl p-4"
     required
    />

    <input
      type="text"
      placeholder="Neck / Collar"
      value={productData.specifications.neck}
      onChange={(e) =>
        handleSpecificationChange("neck", e.target.value)
      }
      className="bg-slate-800 border border-slate-700 rounded-xl p-4"
    required
    />

    <input
      type="text"
      placeholder="Pattern"
      value={productData.specifications.pattern}
      onChange={(e) =>
        handleSpecificationChange("pattern", e.target.value)
      }
      className="bg-slate-800 border border-slate-700 rounded-xl p-4"
    required
    />

    <input
      type="text"
      placeholder="Occasion"
      value={productData.specifications.occasion}
      onChange={(e) =>
        handleSpecificationChange("occasion", e.target.value)
      }
      className="bg-slate-800 border border-slate-700 rounded-xl p-4"
    required
    />

    <input
      type="text"
      placeholder="Closure"
      value={productData.specifications.closure}
      onChange={(e) =>
        handleSpecificationChange("closure", e.target.value)
      }
      className="bg-slate-800 border border-slate-700 rounded-xl p-4"
    required
    />

    <input
      type="text"
      placeholder="Wash Care"
      value={productData.specifications.washCare}
      onChange={(e) =>
        handleSpecificationChange("washCare", e.target.value)
      }
      className="bg-slate-800 border border-slate-700 rounded-xl p-4"
    />

    <input
      type="text"
      placeholder="Country"
      value={productData.specifications.country}
      onChange={(e) =>
        handleSpecificationChange("country", e.target.value)
      }
      className="bg-slate-800 border border-slate-700 rounded-xl p-4"
    />

  </div>

</div>

<div className="space-y-4">

  <h2 className="text-xl font-bold">
    Product Highlights
  </h2>

  {productData.highlights.map((highlight, index) => (
    <div
      key={index}
      className="flex gap-4"
    >
      <input
        type="text"
        placeholder="Highlight"
        value={highlight}
        onChange={(e) =>
          handleHighlightChange(
            index,
            e.target.value
          )
        }
        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none"
      />

      <button
        type="button"
        onClick={() => removeHighlight(index)}
        className="bg-red-500 px-4 rounded-xl"
      >
        X
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={addHighlight}
    className="bg-green-600 px-5 py-3 rounded-xl"
  >
    Add Highlight
  </button>

</div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-xl py-5 font-bold text-xl"
          >

            {
              loading
                ? "Uploading..."
                : "Add Product"
            }

          </button>

        </form>

      </div>

    </div>
  );
};

export default AddProduct;