"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import { universityLogos } from "@/data/university-logos";

const universityLogos = [
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Harvard-University-Logo.png",
    alt: "Harvard University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Stanford-University-Logo.png",
    alt: "Stanford University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Columbia-University-Logo.png",
    alt: "Columbia University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Chicago-University-Logo.png",
    alt: "University of Chicago",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Florida-University-Logo.png",
    alt: "University of Florida",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Brown-Unversity-Logo.png",
    alt: "Brown University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Georgetown-University-Logo.png",
    alt: "Georgetown University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Northeastern-University-Logo.png",
    alt: "Northeastern University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Ohio-State-University-Logo.png",
    alt: "Ohio State University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Oregon-State-University-Logo-1.png",
    alt: "Oregon State University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Pittsburgh-University-Logo.png",
    alt: "University of Pittsburgh",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/South-Carolina.png",
    alt: "University of South Carolina",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Melbourne-University-Logo.png",
    alt: "University of Melbourne",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Otago-University-Logo.png",
    alt: "University of Otago",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Auckland-University-Logo.png",
    alt: "University of Auckland",
  },
];

export function UniversityLogoCloud() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-[#000000] py-16 px-4 w-full">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center text-2xl sm:text-3xl font-bold text-white mb-10"
      >
        Loved by students from top global universities
      </motion.h2>

      <div
        ref={ref}
        className="mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 max-w-7xl"
      >
        {universityLogos.map((logo, i) => (
          <motion.div
            key={logo.alt}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
            className="flex items-center justify-center w-full h-28 bg-white rounded-md shadow hover:scale-105 transition-transform"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              title={logo.alt}
              className="object-contain max-h-20 max-w-[80%]"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
