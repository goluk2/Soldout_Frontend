import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiImage,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiUploadCloud,
} from "react-icons/fi";
import { toast } from "react-toastify";

// =====================================================
// DEFAULT TEXT STYLE
// =====================================================

const DEFAULT_TEXT_STYLE = {
  titleColor: "#FFFFFF",
  subtitleColor: "#FFFFFF",
  titleDecoration: "none",
  titleDecorationStyle: "none",
  textPosition: "left",
  verticalPosition: "center",
  overlayOpacity: 0.35,
};

// =====================================================
// EMPTY IMAGE
// =====================================================

const getEmptyImage = () => ({
  file: null,
  preview: "",
  existingUrl: "",
});

// =====================================================
// EMPTY FORM
// =====================================================

const getEmptyForm = () => ({
  title: "",
  subtitle: "",
  images: [
    getEmptyImage(),
    getEmptyImage(),
    getEmptyImage(),
  ],
  buttonText: "",
  buttonLink: "",
  textStyle: {
    ...DEFAULT_TEXT_STYLE,
  },
  isActive: true,
});

// =====================================================
// COMPONENT
// =====================================================

const HeroManagement = () => {
  const [heroes, setHeroes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingHero, setEditingHero] = useState(null);

  const [form, setForm] = useState(
    getEmptyForm()
  );

  // =====================================================
  // FETCH HEROES
  // =====================================================

  const fetchHeroes = async () => {
    try {
      setLoading(true);

      const response =
        await axiosInstance.get("/heroes");

      if (response.data?.success) {
        setHeroes(
          response.data.heroes || []
        );
      } else {
        setHeroes([]);
      }
    } catch (error) {
      console.error(
        "Fetch Heroes Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load heroes"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchHeroes();
  }, []);

  // =====================================================
  // OPEN CREATE
  // =====================================================

  const openCreate = () => {
    setEditingHero(null);

    setForm(getEmptyForm());

    setModalOpen(true);
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEdit = (hero) => {
    setEditingHero(hero);

    const existingImages =
      Array.isArray(hero.images)
        ? hero.images
        : [];

    const imageSlots = [
      getEmptyImage(),
      getEmptyImage(),
      getEmptyImage(),
    ];

    existingImages
      .slice(0, 3)
      .forEach((image, index) => {
        imageSlots[index] = {
          file: null,
          preview: image,
          existingUrl: image,
        };
      });

    setForm({
      title: hero.title || "",

      subtitle:
        hero.subtitle || "",

      images: imageSlots,

      buttonText:
        hero.buttonText || "",

      buttonLink:
        hero.buttonLink || "",

      textStyle: {
        ...DEFAULT_TEXT_STYLE,
        ...(hero.textStyle || {}),
      },

      isActive:
        hero.isActive !== false,
    });

    setModalOpen(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);

    setEditingHero(null);

    setForm(getEmptyForm());
  };

  // =====================================================
  // BASIC FIELD CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (
    index,
    file
  ) => {
    if (!file) return;

    // -------------------------------------------------
    // IMAGE TYPE VALIDATION
    // -------------------------------------------------

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select a valid image file"
      );

      return;
    }

    // -------------------------------------------------
    // IMAGE SIZE VALIDATION
    // -------------------------------------------------

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(
        "Image size must be less than 10MB"
      );

      return;
    }

    // -------------------------------------------------
    // CREATE PREVIEW
    // -------------------------------------------------

    const preview =
      URL.createObjectURL(file);

    setForm((prev) => {
      const images = [
        ...prev.images,
      ];

      // Revoke previous local preview
      if (
        images[index]?.preview &&
        !images[index]?.existingUrl
      ) {
        URL.revokeObjectURL(
          images[index].preview
        );
      }

      images[index] = {
        file,
        preview,
        existingUrl: "",
      };

      return {
        ...prev,
        images,
      };
    });
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (index) => {
    setForm((prev) => {
      const images = [
        ...prev.images,
      ];

      const currentImage =
        images[index];

      // Revoke local preview
      if (
        currentImage?.preview &&
        !currentImage?.existingUrl
      ) {
        URL.revokeObjectURL(
          currentImage.preview
        );
      }

      images[index] =
        getEmptyImage();

      return {
        ...prev,
        images,
      };
    });
  };

  // =====================================================
  // TEXT STYLE CHANGE
  // =====================================================

  const handleTextStyleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      textStyle: {
        ...prev.textStyle,
        [field]: value,
      },
    }));
  };

  // =====================================================
  // SAVE HERO
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =================================================
    // TITLE VALIDATION
    // =================================================

    if (!form.title.trim()) {
      toast.error(
        "Hero title is required"
      );

      return;
    }

    // =================================================
    // BUTTON VALIDATION
    // =================================================

    if (
      form.buttonText.trim() &&
      !form.buttonLink.trim()
    ) {
      toast.error(
        "Button link is required when button text is provided"
      );

      return;
    }

    // =================================================
    // IMAGE COUNT
    // =================================================

    const selectedImages =
      form.images.filter(
        (image) =>
          image.file ||
          image.existingUrl
      );

    if (selectedImages.length > 3) {
      toast.error(
        "Maximum 3 hero images are allowed"
      );

      return;
    }

    try {
      setSaving(true);

      // =================================================
      // FORMDATA
      // =================================================

      const formData =
        new FormData();

      // =================================================
      // BASIC DATA
      // =================================================

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "subtitle",
        form.subtitle.trim()
      );

      formData.append(
        "buttonText",
        form.buttonText.trim()
      );

      formData.append(
        "buttonLink",
        form.buttonLink.trim()
      );

      formData.append(
        "isActive",
        String(form.isActive)
      );

      // =================================================
      // TEXT STYLE
      // =================================================

      formData.append(
        "textStyle",
        JSON.stringify({
          ...form.textStyle,

          overlayOpacity: Number(
            form.textStyle
              .overlayOpacity
          ),
        })
      );

      // =================================================
      // EXISTING IMAGES
      // =================================================
      //
      // Backend expects:
      // existingImages = JSON array
      //
      // Only existing Cloudinary URLs
      // are sent here.
      //
      // New files are sent separately
      // through "images".
      // =================================================

      const existingImages =
        form.images
          .filter(
            (image) =>
              image.existingUrl &&
              !image.file
          )
          .map(
            (image) =>
              image.existingUrl
          );

      formData.append(
        "existingImages",
        JSON.stringify(
          existingImages
        )
      );

      // =================================================
      // NEW IMAGE FILES
      // =================================================

      form.images.forEach(
        (image) => {
          if (image.file) {
            formData.append(
              "images",
              image.file
            );
          }
        }
      );

      // =================================================
      // API REQUEST
      // =================================================

      let response;

      // =================================================
      // UPDATE
      // =================================================

      if (editingHero) {
        response =
          await axiosInstance.put(
            `/heroes/${editingHero._id}`,
            formData
          );
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        response =
          await axiosInstance.post(
            "/heroes",
            formData
          );
      }

      // =================================================
      // SUCCESS
      // =================================================

      if (
        response.data?.success
      ) {
        toast.success(
          response.data.message ||
            "Hero saved successfully"
        );

        setModalOpen(false);

        setEditingHero(null);

        setForm(getEmptyForm());

        await fetchHeroes();
      }
    } catch (error) {
      console.error(
        "Save Hero Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to save hero"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE HERO
  // =====================================================

  const handleDelete = async (
    heroId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this hero?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await axiosInstance.delete(
          `/heroes/${heroId}`
        );

      if (
        response.data?.success
      ) {
        toast.success(
          response.data.message ||
            "Hero deleted successfully"
        );

        await fetchHeroes();
      }
    } catch (error) {
      console.error(
        "Delete Hero Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to delete hero"
      );
    }
  };

  // =====================================================
  // TOGGLE ACTIVE
  // =====================================================

  const toggleActive = async (
    hero
  ) => {
    try {
      const response =
        await axiosInstance.put(
          `/heroes/${hero._id}`,
          {
            isActive:
              !hero.isActive,
          }
        );

      if (
        response.data?.success
      ) {
        toast.success(
          hero.isActive
            ? "Hero deactivated"
            : "Hero activated"
        );

        await fetchHeroes();
      }
    } catch (error) {
      console.error(
        "Toggle Hero Status Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to update hero status"
      );
    }
  };

  // =====================================================
  // DECORATION CLASS
  // =====================================================

  const getDecorationClass = (
    decoration
  ) => {
    switch (decoration) {
      case "underline":
        return "underline";

      case "overline":
        return "overline";

      case "line-through":
        return "line-through";

      default:
        return "";
    }
  };

  // =====================================================
  // HORIZONTAL POSITION
  // =====================================================

  const getHorizontalPosition =
    (position) => {
      switch (position) {
        case "center":
          return "justify-center text-center";

        case "right":
          return "justify-end text-right";

        default:
          return "justify-start text-left";
      }
    };

  // =====================================================
  // VERTICAL POSITION
  // =====================================================

  const getVerticalPosition =
    (position) => {
      switch (position) {
        case "top":
          return "items-start";

        case "bottom":
          return "items-end";

        default:
          return "items-center";
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <FiLoader className="animate-spin" />

          Loading heroes...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Hero Section
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Manage homepage hero banners,
            images and text styling.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
        >
          <FiPlus />

          Add Hero
        </button>

      </div>

      {/* ================================================= */}
      {/* HERO LIST */}
      {/* ================================================= */}

      {heroes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

          <FiImage className="mx-auto text-5xl text-slate-600 mb-4" />

          <h2 className="text-lg font-semibold text-white">
            No Hero Sections
          </h2>

          <p className="text-sm text-slate-400 mt-1 mb-5">
            Create your first homepage
            hero section.
          </p>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
          >
            <FiPlus />

            Create Hero
          </button>

        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {heroes.map((hero) => (
            <div
              key={hero._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
            >

              {/* ================================================= */}
              {/* HERO PREVIEW */}
              {/* ================================================= */}

              <div className="relative h-72 bg-slate-950 overflow-hidden">

                {hero.images?.[0] ? (
                  <img
                    src={hero.images[0]}
                    alt={
                      hero.title ||
                      "Hero"
                    }
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiImage className="text-6xl text-slate-700" />
                  </div>
                )}

                {/* Overlay */}

                <div
                  className="absolute inset-0 bg-black"
                  style={{
                    opacity:
                      hero.textStyle
                        ?.overlayOpacity ??
                      0.35,
                  }}
                />

                {/* Text */}

                <div
                  className={`absolute inset-0 p-7 flex ${getVerticalPosition(
                    hero.textStyle
                      ?.verticalPosition
                  )} ${getHorizontalPosition(
                    hero.textStyle
                      ?.textPosition
                  )}`}
                >
                  <div className="max-w-xl">

                    {hero.title && (
                      <h2
                        className={`text-4xl font-bold leading-tight ${getDecorationClass(
                          hero.textStyle
                            ?.titleDecoration
                        )}`}
                        style={{
                          color:
                            hero.textStyle
                              ?.titleColor ||
                            "#FFFFFF",
                        }}
                      >
                        {hero.title}
                      </h2>
                    )}

                    {hero.subtitle && (
                      <p
                        className="mt-3 text-sm leading-relaxed"
                        style={{
                          color:
                            hero.textStyle
                              ?.subtitleColor ||
                            "#FFFFFF",
                        }}
                      >
                        {
                          hero.subtitle
                        }
                      </p>
                    )}

                    {hero.buttonText && (
                      <span className="inline-flex mt-5 px-5 py-2.5 bg-white text-black text-xs font-bold rounded-lg">
                        {
                          hero.buttonText
                        }
                      </span>
                    )}

                  </div>
                </div>

                {/* Status */}

                <div className="absolute top-4 right-4">

                  <span
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                      hero.isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {hero.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>

              </div>

              {/* ================================================= */}
              {/* DETAILS */}
              {/* ================================================= */}

              <div className="p-5">

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <h3 className="text-lg font-semibold text-white truncate">
                      {
                        hero.title ||
                        "Untitled Hero"
                      }
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      {
                        hero.images
                          ?.length || 0
                      }{" "}
                      / 3 images
                    </p>

                  </div>

                  {/* Actions */}

                  <div className="flex items-center gap-2 shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        toggleActive(
                          hero
                        )
                      }
                      className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                      title={
                        hero.isActive
                          ? "Deactivate"
                          : "Activate"
                      }
                    >
                      {hero.isActive ? (
                        <FiEye />
                      ) : (
                        <FiEyeOff />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEdit(
                          hero
                        )
                      }
                      className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                      title="Edit hero"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          hero._id
                        )
                      }
                      className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                      title="Delete hero"
                    >
                      <FiTrash2 />
                    </button>

                  </div>

                </div>

                {/* Additional Images */}

                {hero.images?.length >
                  1 && (
                  <div className="flex gap-2 mt-4">

                    {hero.images.map(
                      (
                        image,
                        index
                      ) => (
                        <img
                          key={`${image}-${index}`}
                          src={image}
                          alt=""
                          className="w-16 h-12 rounded-lg object-cover border border-slate-700"
                        />
                      )
                    )}

                  </div>
                )}

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ================================================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ================================================= */}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">

            {/* ================================================= */}
            {/* MODAL HEADER */}
            {/* ================================================= */}

            <div className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800 px-6 py-5 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-white">
                  {editingHero
                    ? "Edit Hero"
                    : "Create Hero"}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Configure your homepage
                  hero section.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <FiX />
              </button>

            </div>

            {/* ================================================= */}
            {/* FORM */}
            {/* ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-8"
            >

              {/* ================================================= */}
              {/* CONTENT */}
              {/* ================================================= */}

              <div className="space-y-4">

                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    Hero Content
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Add the content displayed
                    over the hero image.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* TITLE */}

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={
                        form.title
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="New Collection"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* SUBTITLE */}

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Subtitle
                    </label>

                    <input
                      type="text"
                      name="subtitle"
                      value={
                        form.subtitle
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Discover our latest products"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* BUTTON TEXT */}

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Button Text
                    </label>

                    <input
                      type="text"
                      name="buttonText"
                      value={
                        form.buttonText
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Shop Now"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* BUTTON LINK */}

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Button Link
                    </label>

                    <input
                      type="text"
                      name="buttonLink"
                      value={
                        form.buttonLink
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="/products"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                </div>

              </div>

              {/* ================================================= */}
              {/* IMAGES */}
              {/* ================================================= */}

              <div className="space-y-4">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                      Hero Images
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Select up to 3 images.
                      Maximum 10MB per image.
                    </p>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {
                      form.images.filter(
                        (image) =>
                          image.file ||
                          image.existingUrl
                      ).length
                    }{" "}
                    / 3
                  </span>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {form.images.map(
                    (
                      image,
                      index
                    ) => (
                      <div
                        key={index}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-4"
                      >

                        {/* IMAGE TITLE */}

                        <div className="flex items-center justify-between mb-3">

                          <label className="text-xs text-slate-400">
                            Image{" "}
                            {index + 1}
                          </label>

                          {(image.file ||
                            image.existingUrl) && (
                            <button
                              type="button"
                              onClick={() =>
                                removeImage(
                                  index
                                )
                              }
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          )}

                        </div>

                        {/* PREVIEW */}

                        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">

                          {image.preview ? (
                            <img
                              src={
                                image.preview
                              }
                              alt={`Hero ${
                                index + 1
                              }`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">

                              <FiImage className="text-4xl mb-2" />

                              <span className="text-xs">
                                No image
                                selected
                              </span>

                            </div>
                          )}

                        </div>

                        {/* FILE INPUT */}

                        <label className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 cursor-pointer transition">

                          <FiUploadCloud />

                          {image.file
                            ? "Change Image"
                            : image.existingUrl
                            ? "Replace Image"
                            : "Choose File"}

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(
                              e
                            ) => {
                              const file =
                                e.target
                                  .files?.[0];

                              if (file) {
                                handleImageChange(
                                  index,
                                  file
                                );
                              }

                              // Allow selecting
                              // same file again
                              e.target.value =
                                "";
                            }}
                          />

                        </label>

                        {/* FILE NAME */}

                        {image.file && (
                          <p className="text-[10px] text-slate-500 mt-2 truncate">
                            {image.file.name}
                          </p>
                        )}

                        {image.existingUrl &&
                          !image.file && (
                            <p className="text-[10px] text-emerald-500 mt-2">
                              Existing image
                            </p>
                          )}

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* ================================================= */}
              {/* TEXT STYLE */}
              {/* ================================================= */}

              <div className="space-y-5">

                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    Text Design
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Control how hero text
                    looks and where it appears.
                  </p>
                </div>

                {/* COLORS */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* TITLE COLOR */}

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                    <label className="block text-xs text-slate-400 mb-3">
                      Title Color
                    </label>

                    <div className="flex gap-3">

                      <input
                        type="color"
                        value={
                          form
                            .textStyle
                            .titleColor
                        }
                        onChange={(e) =>
                          handleTextStyleChange(
                            "titleColor",
                            e.target
                              .value
                          )
                        }
                        className="w-12 h-10 bg-transparent border-0 cursor-pointer"
                      />

                      <input
                        type="text"
                        value={
                          form
                            .textStyle
                            .titleColor
                        }
                        onChange={(e) =>
                          handleTextStyleChange(
                            "titleColor",
                            e.target
                              .value
                          )
                        }
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 text-sm text-white outline-none"
                      />

                    </div>

                  </div>

                  {/* SUBTITLE COLOR */}

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                    <label className="block text-xs text-slate-400 mb-3">
                      Subtitle Color
                    </label>

                    <div className="flex gap-3">

                      <input
                        type="color"
                        value={
                          form
                            .textStyle
                            .subtitleColor
                        }
                        onChange={(e) =>
                          handleTextStyleChange(
                            "subtitleColor",
                            e.target
                              .value
                          )
                        }
                        className="w-12 h-10 bg-transparent border-0 cursor-pointer"
                      />

                      <input
                        type="text"
                        value={
                          form
                            .textStyle
                            .subtitleColor
                        }
                        onChange={(e) =>
                          handleTextStyleChange(
                            "subtitleColor",
                            e.target
                              .value
                          )
                        }
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 text-sm text-white outline-none"
                      />

                    </div>

                  </div>

                </div>

                {/* DECORATION */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Title Decoration
                    </label>

                    <select
                      value={
                        form
                          .textStyle
                          .titleDecoration
                      }
                      onChange={(e) =>
                        handleTextStyleChange(
                          "titleDecoration",
                          e.target
                            .value
                        )
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
                    >
                      <option value="none">
                        None
                      </option>

                      <option value="underline">
                        Underline
                      </option>

                      <option value="overline">
                        Overline
                      </option>

                      <option value="line-through">
                        Line Through
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Decoration Style
                    </label>

                    <select
                      value={
                        form
                          .textStyle
                          .titleDecorationStyle
                      }
                      onChange={(e) =>
                        handleTextStyleChange(
                          "titleDecorationStyle",
                          e.target
                            .value
                        )
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
                    >
                      <option value="none">
                        None
                      </option>

                      <option value="line">
                        Line
                      </option>

                      <option value="accent">
                        Accent
                      </option>

                      <option value="highlight">
                        Highlight
                      </option>
                    </select>
                  </div>

                </div>

                {/* POSITION */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* HORIZONTAL */}

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Horizontal Position
                    </label>

                    <select
                      value={
                        form
                          .textStyle
                          .textPosition
                      }
                      onChange={(e) =>
                        handleTextStyleChange(
                          "textPosition",
                          e.target
                            .value
                        )
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
                    >
                      <option value="left">
                        Left
                      </option>

                      <option value="center">
                        Center
                      </option>

                      <option value="right">
                        Right
                      </option>
                    </select>
                  </div>

                  {/* VERTICAL */}

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Vertical Position
                    </label>

                    <select
                      value={
                        form
                          .textStyle
                          .verticalPosition
                      }
                      onChange={(e) =>
                        handleTextStyleChange(
                          "verticalPosition",
                          e.target
                            .value
                        )
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
                    >
                      <option value="top">
                        Top
                      </option>

                      <option value="center">
                        Center
                      </option>

                      <option value="bottom">
                        Bottom
                      </option>
                    </select>
                  </div>

                </div>

                {/* OVERLAY */}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <div className="flex items-center justify-between mb-3">

                    <div>
                      <label className="text-xs text-slate-400">
                        Image Overlay
                      </label>

                      <p className="text-[10px] text-slate-600 mt-1">
                        Dark overlay helps
                        text remain readable.
                      </p>
                    </div>

                    <span className="text-xs font-mono text-white">
                      {Math.round(
                        Number(
                          form
                            .textStyle
                            .overlayOpacity
                        ) * 100
                      )}
                      %
                    </span>

                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={
                      form
                        .textStyle
                        .overlayOpacity
                    }
                    onChange={(e) =>
                      handleTextStyleChange(
                        "overlayOpacity",
                        Number(
                          e.target
                            .value
                        )
                      )
                    }
                    className="w-full"
                  />

                </div>

              </div>

              {/* ================================================= */}
              {/* STATUS */}
              {/* ================================================= */}

              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-4">

                <div>

                  <p className="text-sm font-semibold text-white">
                    Hero Status
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Active heroes can appear
                    on the homepage.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        isActive:
                          !prev.isActive,
                      })
                    )
                  }
                  className={`relative w-12 h-6 rounded-full transition ${
                    form.isActive
                      ? "bg-blue-600"
                      : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                      form.isActive
                        ? "left-7"
                        : "left-1"
                    }`}
                  />
                </button>

              </div>

              {/* ================================================= */}
              {/* ACTIONS */}
              {/* ================================================= */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <FiLoader className="animate-spin" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />

                      {editingHero
                        ? "Update Hero"
                        : "Create Hero"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default HeroManagement;