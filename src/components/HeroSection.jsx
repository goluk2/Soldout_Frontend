
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

const HeroSection = () => {
  const [heroes, setHeroes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchHeroes = async () => {
    try {
      const response = await axiosInstance.get("/heroes");
      setHeroes(response.data.heroes || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  useEffect(() => {
    if (heroes.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((previous) =>
        previous === heroes.length - 1 ? 0 : previous + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroes.length]);

  const previousSlide = () => {
    setActiveIndex((previous) =>
      previous === 0 ? heroes.length - 1 : previous - 1
    );
  };

  const nextSlide = () => {
    setActiveIndex((previous) =>
      previous === heroes.length - 1 ? 0 : previous + 1
    );
  };

  if (!heroes.length) {
    return (
      <section className="mx-auto mt-4 max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[380px] items-center bg-[#f5f5f5] px-8 sm:min-h-[500px] lg:px-16">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              New Season
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-6xl text-gray-900">
              Elevate Your <br /> Everyday Style
            </h1>
            <p className="mt-4 max-w-md text-sm text-gray-600">
              Discover premium men’s clothing crafted for comfort, style and confidence.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-black px-6 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-gray-800 transition"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const hero = heroes[activeIndex];

  return (
    <section className="mx-auto mt-4 max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div className="relative min-h-[390px] overflow-hidden rounded-xl bg-gray-100 sm:min-h-[500px] lg:min-h-[560px]">
        
        {/* 1. CRISP & CLEAR BACKGROUND IMAGE */}
        <img
          src={hero.image}
          alt={hero.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* 2. SUBTLE GRADIENT (Sirf text ke peeche halka shade taaki image clear rahe) */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/70 via-white/40 to-transparent sm:w-2/3" />

        {/* 3. CONTENT AREA */}
        <div className="relative z-10 flex min-h-[390px] items-center px-6 sm:min-h-[500px] sm:px-12 lg:min-h-[560px] lg:px-16">
          <div className="max-w-md sm:max-w-lg">
            <span className="mb-3 block text-xl font-bold uppercase tracking-[0.2em] text-orange-700">
              New Season
            </span>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>

            <p className="mt-3 max-w-md text-sm sm:text-base font-medium text-amber-300 leading-relaxed">
              {hero.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={hero.buttonLink || "/shop"}
                className="bg-black px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-gray-800 shadow-sm"
              >
                {hero.buttonText || "Shop Now"}
              </Link>

              <Link
                to="/shop"
                className="border-2 border-black bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-black hover:text-white"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </div>

        {/* 4. NAVIGATION ARROWS */}
        {heroes.length > 1 && (
          <>
            <button
              onClick={previousSlide}
              className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow-md transition hover:bg-white"
              aria-label="Previous slide"
            >
              <FiArrowLeft size={16} />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow-md transition hover:bg-white"
              aria-label="Next slide"
            >
              <FiArrowRight size={16} />
            </button>

            {/* DOT INDICATORS */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {heroes.map((item, index) => (
                <button
                  key={item._id || index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index
                      ? "w-6 bg-black"
                      : "w-2 bg-black/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSection;