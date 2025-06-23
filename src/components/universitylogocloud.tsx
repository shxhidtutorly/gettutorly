"use client"

import { Cloud } from "react-icon-cloud"

const universityLogos = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Harvard_University_logo.svg/400px-Harvard_University_logo.svg.png",
    alt: "Harvard",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/MIT_logo.svg/400px-MIT_logo.svg.png",
    alt: "MIT",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Stanford_University_seal_2003.svg/400px-Stanford_University_seal_2003.svg.png",
    alt: "Stanford",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Yale_University_Shield_1.svg/400px-Yale_University_Shield_1.svg.png",
    alt: "Yale",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Princeton_shield.svg/400px-Princeton_shield.svg.png",
    alt: "Princeton",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Columbia_University_shield.svg/400px-Columbia_University_shield.svg.png",
    alt: "Columbia",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/University_of_Pennsylvania_coat_of_arms.svg/400px-University_of_Pennsylvania_coat_of_arms.svg.png",
    alt: "UPenn",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Caltech_logo.svg/400px-Caltech_logo.svg.png",
    alt: "Caltech",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/University_of_Chicago_shield.svg/400px-University_of_Chicago_shield.svg.png",
    alt: "UChicago",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/University_of_Cambridge_coat_of_arms.svg/400px-University_of_Cambridge_coat_of_arms.svg.png",
    alt: "Cambridge",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Oxford_University_Coat_Of_Arms.svg/400px-Oxford_University_Coat_Of_Arms.svg.png",
    alt: "Oxford",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Imperial_College_London_coat_of_arms.svg/400px-Imperial_College_London_coat_of_arms.svg.png",
    alt: "Imperial College",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/ETH_Z%C3%BCrich_Logo.svg/400px-ETH_Z%C3%BCrich_Logo.svg.png",
    alt: "ETH Zurich",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/University_of_Tokyo_Logo.svg/400px-University_of_Tokyo_Logo.svg.png",
    alt: "University of Tokyo",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/University_of_Melbourne_coat_of_arms.svg/400px-University_of_Melbourne_coat_of_arms.svg.png",
    alt: "University of Melbourne",
  }
]

export function UniversityLogoCloud() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "fixed",
        inset: 0,
        zIndex: 0
      }}
    >
      {/* @ts-ignore */}
      <Cloud
        options={{
          depth: 1.2,
          imageScale: 6,
          tooltip: "native",
          clickToFront: 700,
          reverse: true,
          outlineColour: "#0000",
          maxSpeed: 0.10,
          minSpeed: 0.04,
          freezeActive: false,
          freezeDecel: false,
          wheelZoom: false,
          dragControl: true,
        }}
        containerProps={{
          style: {
            width: "100vw",
            height: "100vh",
            pointerEvents: "auto"
          }
        }}
      >
        {universityLogos.map((logo, i) => (
          <a key={i} href="#" tabIndex={-1}>
            <img
              src={logo.src}
              alt={logo.alt}
              title={logo.alt}
              width={200}
              height={200}
              draggable={false}
              style={{
                objectFit: "contain",
                maxWidth: "200px",
                maxHeight: "200px",
                userSelect: "none",
                pointerEvents: "none"
              }}
            />
          </a>
        ))}
      </Cloud>
    </div>
  )
}
