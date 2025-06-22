// src/components/university-gallery.tsx

"use client";

import React from "react";

const universityLogos = [
  "https://upload.wikimedia.org/wikipedia/commons/0/07/Harvard_University_shield.png",
  "https://upload.wikimedia.org/wikipedia/commons/b/b7/Stanford_University_seal_2003.svg",
  "https://upload.wikimedia.org/wikipedia/commons/c/c3/MIT_seal.png",
  "https://upload.wikimedia.org/wikipedia/commons/f/ff/University_of_Oxford_coat_of_arms.svg",
  "https://upload.wikimedia.org/wikipedia/commons/a/a2/University_of_Cambridge_coat_of_arms.svg",
  "https://upload.wikimedia.org/wikipedia/commons/a/a1/University_of_California%2C_Berkeley_seal.svg",
  "https://upload.wikimedia.org/wikipedia/commons/f/f6/ETH_Zurich_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/e/e7/Yale_University_seal.svg",
  "https://upload.wikimedia.org/wikipedia/commons/e/e7/UCLA_seal.svg",
  "https://upload.wikimedia.org/wikipedia/en/e/e7/IIT_Bombay_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/en/a/a2/Nanyang_Technological_University_logo.svg",
  "https://upload.wikimedia.org/wikipedia/en/a/a2/University_of_Toronto_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/c/c9/Peking_University_seal.svg",
  "https://upload.wikimedia.org/wikipedia/en/0/0b/University_of_Melbourne_logo.svg",
  "https://upload.wikimedia.org/wikipedia/en/c/c9/Seoul_National_University_logo.svg",
  "https://upload.wikimedia.org/wikipedia/en/c/c9/University_of_Edinburgh_logo.svg",
];

export function UniversityGallery() {
  return (
    <div className="my-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-center justify-center">
      {universityLogos.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`University logo ${idx}`}
          className="h-24 w-auto object-contain mx-auto"
        />
      ))}
    </div>
  );
}
