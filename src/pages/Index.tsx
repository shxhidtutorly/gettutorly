import React from "react";
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  ElementType,
  ComponentPropsWithoutRef,
  memo,
  useCallback,
} from "react";

import {
  motion,
  AnimatePresence,
  animate,
  useMotionValueEvent,
  useScroll,
  useTransform,
  PanInfo,
} from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useUser } from "@clerk/clerk-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "react-router-dom";
import UserProfileButton from "@/components/auth/UserProfileButton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Brain,
  BookOpenText,
  Sparkles,
  BookOpen,
  BarChart3,
  Zap,
  MessageSquare,
  FileText,
  CheckCircle,
  Star,
  Users,
  Globe,
  Shield,
  Play,
  Check,
  X,
  Calculator,
  Languages,
  PenTool,
  Lightbulb,
  GraduationCap,
  Palette,
  Minus,
  Plus,
  Menu,
} from "lucide-react";
import { Menu as MenuIcon } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Types
type Uniforms = {
  [key: string]: {
    value: number[] | number[][] | number;
    type: string;
  };
};

interface ShaderProps {
  source: string;
  uniforms: {
    [key: string]: {
      value: number[] | number[][] | number;
      type: string;
    };
  };
  maxFps?: number;
}

const universityLogos = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Harvard_University_logo.svg/200px-Harvard_University_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/MIT_logo.svg/200px-MIT_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Stanford_University_seal_2003.svg/200px-Stanford_University_seal_2003.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Yale_University_Shield_1.svg/200px-Yale_University_Shield_1.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Princeton_shield.svg/200px-Princeton_shield.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Columbia_University_shield.svg/200px-Columbia_University_shield.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/University_of_Pennsylvania_coat_of_arms.svg/200px-University_of_Pennsylvania_coat_of_arms.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Caltech_logo.svg/200px-Caltech_logo.svg.png",
];

const UniversityGallery = () => {
  return (
    <div className="university-gallery">
      {/* University gallery content */}
    </div>
  );
};

const CanvasRevealEffect = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) => {
  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors ?? [[0, 255, 255]]}
          dotSize={dotSize ?? 3}
          opacities={
            opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]
          }
          shader={`
            ${reverse ? 'u_reverse_active' : 'false'}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
          center={["x", "y"]}
        />
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      )}
    </div>
  );
};

interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
  center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = "",
  center = ["x", "y"],
}) => {
  const uniforms = useMemo(() => {
    let colorsArray = [
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
    ];
    if (colors.length === 2) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[1],
      ];
    } else if (colors.length === 3) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[2],
        colors[2],
      ];
    }
    return {
      u_colors: {
        value: colorsArray.map((color) => [
          color[0] / 255,
          color[1] / 255,
          color[2] / 255,
        ]),
        type: "uniform3fv",
      },
      u_opacities: {
        value: opacities,
        type: "uniform1fv",
      },
      u_total_size: {
        value: totalSize,
        type: "uniform1f",
      },
      u_dot_size: {
        value: dotSize,
        type: "uniform1f",
      },
      u_reverse: {
        value: shader.includes("u_reverse_active") ? 1 : 0,
        type: "uniform1i",
      },
    };
  }, [colors, opacities, totalSize, dotSize, shader]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }
        float map(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        void main() {
            vec2 st = fragCoord.xy;
            ${
              center.includes("x")
                ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));"
                : ""
            }
            ${
              center.includes("y")
                ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));"
                : ""
            }

            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);

            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            float animation_speed_factor = 0.5;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);

            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);

            float current_timing_offset;
            if (u_reverse == 1) {
                current_timing_offset = timing_offset_outro;
                opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
                opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            } else {
                current_timing_offset = timing_offset_intro;
                opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            }

            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
      maxFps={60}
    />
  );
};

const ShaderMaterial = ({
  source,
  uniforms,
  maxFps = 60,
}: {
  source: string;
  hovered?: boolean;
  maxFps?: number;
  uniforms: Uniforms;
}) => {
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);
  let lastFrameTime = 0;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const timestamp = clock.getElapsedTime();

    lastFrameTime = timestamp;

    const material: any = ref.current.material;
    const timeLocation = material.uniforms.u_time;
    timeLocation.value = timestamp;
  });

  const getUniforms = () => {
    const preparedUniforms: any = {};

    for (const uniformName in uniforms) {
      const uniform: any = uniforms[uniformName];

      switch (uniform.type) {
        case "uniform1f":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1f" };
          break;
        case "uniform1i":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1i" };
          break;
        case "uniform3f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector3().fromArray(uniform.value),
            type: "3f",
          };
          break;
        case "uniform1fv":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" };
          break;
        case "uniform3fv":
          preparedUniforms[uniformName] = {
            value: uniform.value.map((v: number[]) =>
              new THREE.Vector3().fromArray(v)
            ),
            type: "3fv",
          };
          break;
        case "uniform2f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector2().fromArray(uniform.value),
            type: "2f",
          };
          break;
        default:
          console.error(`Invalid uniform type for '${uniformName}'.`);
          break;
      }
    }

    preparedUniforms["u_time"] = { value: 0, type: "1f" };
    preparedUniforms["u_resolution"] = {
      value: new THREE.Vector2(size.width * 2, size.height * 2),
    };
    return preparedUniforms;
  };

  const material = useMemo(() => {
    const materialObject = new THREE.ShaderMaterial({
      vertexShader: `
      precision mediump float;
      in vec2 coordinates;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        float x = position.x;
        float y = position.y;
        gl_Position = vec4(x, y, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
      `,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });

    return materialObject;
  }, [size.width, size.height, source]);

  return (
    <mesh ref={ref as any}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const Shader: React.FC<ShaderProps> = ({ source, uniforms, maxFps = 60 }) => {
  return (
    <Canvas className="absolute inset-0 h-full w-full">
      <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
    </Canvas>
  );
};

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  const defaultColor = color || "hsl(var(--foreground))"

  return (
    <Component 
      className={cn(
        "relative inline-block py-[1px] overflow-hidden rounded-[20px]",
        className
      )} 
      {...props}
    >
      <div
        className={cn(
          "absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0",
          "opacity-20 dark:opacity-70" 
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          "absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0",
          "opacity-20 dark:opacity-70"
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className={cn(
        "relative z-1 border text-foreground text-center text-base py-4 px-6 rounded-[20px]",
        "bg-gradient-to-b from-background/90 to-muted/90 border-border/40",
        "dark:from-background dark:to-muted dark:border-border"
      )}>
        {children}
      </div>
    </Component>
  )
}

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          let targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            disabled && "!block"
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": "0",
              "--active": "0",
              "--glowingeffect-border-width": `${borderWidth}px`,
              "--repeating-conic-gradient-times": "5",
              "--gradient":
                variant === "white"
                  ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                  : `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
                radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
                radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), 
                radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #dd7bbb 0%,
                  #d79f1e calc(25% / var(--repeating-conic-gradient-times)),
                  #5a922c calc(50% / var(--repeating-conic-gradient-times)), 
                  #4c7894 calc(75% / var(--repeating-conic-gradient-times)),
                  #dd7bbb calc(100% / var(--repeating-conic-gradient-times))
                )`,
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)] ",
            className,
            disabled && "!hidden"
          )}
        >
          <div
            className={cn(
              "glow",
              "rounded-[inherit]",
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
              "after:[mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",

        // before styles
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",

        // light mode colors
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // dark mode colors
        "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-950 font-sans md:px-10"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-black dark:text-white max-w-4xl">
          Unlock Your Full Potential with Tutorly
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-sm">
          Discover why students worldwide choose Tutorly to learn smarter, not harder.
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500 ">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

interface BenefitProps {
  text: string
  checked: boolean
}

const Benefit = ({ text, checked }: BenefitProps) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-4 place-content-center rounded-full bg-primary text-sm text-primary-foreground">
          <Check className="size-3" />
        </span>
      ) : (
        <span className="grid size-4 place-content-center rounded-full dark:bg-zinc-800 bg-zinc-200 text-sm dark:text-zinc-400 text-zinc-600">
          <X className="size-3" />
        </span>
      )}
      <span className="text-sm dark:text-zinc-300 text-zinc-600">{text}</span>
    </div>
  )
}

interface PricingCardProps {
  tier: string
  price: string
  bestFor: string
  CTA: string
  benefits: Array<{ text: string; checked: boolean }>
  className?: string
}

export const PricingCard = ({
  tier,
  price,
  bestFor,
  CTA,
  benefits,
  className,
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
    >
      <Card
        className={cn(
          "relative h-full w-full overflow-hidden rounded-2xl border shadow-md transition duration-300",
          "dark:border-zinc-700 dark:bg-gradient-to-br dark:from-zinc-950/60 dark:to-zinc-900/80",
          "border-zinc-200 bg-gradient-to-br from-zinc-50/50 to-zinc-100/80",
          "p-6",
          className
        )}
      >
        <div className="flex flex-col items-center border-b pb-6 dark:border-zinc-700 border-zinc-200">
          <span className="mb-4 inline-block text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            {tier}
          </span>
          <span className="mb-2 inline-block text-4xl font-bold text-zinc-900 dark:text-white">
            {price}
          </span>
          <span className="text-sm font-medium dark:text-zinc-300 text-zinc-600 text-center">
            {bestFor}
          </span>
        </div>

        <div className="space-y-4 py-8">
          {benefits.map((benefit, index) => (
            <Benefit key={index} {...benefit} />
          ))}
        </div>

        <button
          className="w-full rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 px-5 py-3 text-sm font-medium text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          {CTA}
        </button>
      </Card>
    </motion.div>
  );
};


interface Testimonial {
  id: number | string
  name: string
  avatar: string
  description: string
}

interface TestimonialCarouselProps
  extends React.HTMLAttributes<HTMLDivElement> {
  testimonials: Testimonial[]
  showArrows?: boolean
  showDots?: boolean
}

const TestimonialCarousel = React.forwardRef<
  HTMLDivElement,
  TestimonialCarouselProps
>(
  (
    { className, testimonials, showArrows = true, showDots = true, ...props },
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [exitX, setExitX] = React.useState<number>(0)

    const handleDragEnd = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      if (Math.abs(info.offset.x) > 100) {
        setExitX(info.offset.x)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % testimonials.length)
          setExitX(0)
        }, 200)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "h-72 w-full flex items-center justify-center",
          className
        )}
        {...props}
      >
        <div className="relative w-80 h-64">
          {testimonials.map((testimonial, index) => {
            const isCurrentCard = index === currentIndex
            const isPrevCard =
              index === (currentIndex + 1) % testimonials.length
            const isNextCard =
              index === (currentIndex + 2) % testimonials.length

            if (!isCurrentCard && !isPrevCard && !isNextCard) return null

            return (
              <motion.div
                key={testimonial.id}
                className={cn(
                  "absolute w-full h-full rounded-2xl cursor-grab active:cursor-grabbing",
                  "bg-white shadow-xl",
                  "dark:bg-card dark:shadow-[2px_2px_4px_rgba(0,0,0,0.4),-1px_-1px_3px_rgba(255,255,255,0.1)]",
                )}
                style={{
                  zIndex: isCurrentCard ? 3 : isPrevCard ? 2 : 1,
                }}
                drag={isCurrentCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={isCurrentCard ? handleDragEnd : undefined}
                initial={{
                  scale: 0.95,
                  opacity: 0,
                  y: isCurrentCard ? 0 : isPrevCard ? 8 : 16,
                  rotate: isCurrentCard ? 0 : isPrevCard ? -2 : -4,
                }}
                animate={{
                  scale: isCurrentCard ? 1 : 0.95,
                  opacity: isCurrentCard ? 1 : isPrevCard ? 0.6 : 0.3,
                  x: isCurrentCard ? exitX : 0,
                  y: isCurrentCard ? 0 : isPrevCard ? 8 : 16,
                  rotate: isCurrentCard ? exitX / 20 : isPrevCard ? -2 : -4,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                {showArrows && isCurrentCard && (
                  <div className="absolute inset-x-0 top-2 flex justify-between px-4">
                    <span className="text-2xl select-none cursor-pointer text-gray-300 hover:text-gray-400 dark:text-muted-foreground dark:hover:text-primary">
                      &larr;
                    </span>
                    <span className="text-2xl select-none cursor-pointer text-gray-300 hover:text-gray-400 dark:text-muted-foreground dark:hover:text-primary">
                      &rarr;
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-foreground">
                    {testimonial.name}
                  </h3>
                  <p className="text-center text-sm text-gray-600 dark:text-muted-foreground">
                    {testimonial.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
          {showDots && (
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentIndex
                      ? "bg-blue-500 dark:bg-primary"
                      : "bg-gray-300 dark:bg-muted-foreground/30",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },
)
TestimonialCarousel.displayName = "TestimonialCarousel"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  return (
    <section className={cn(
      "bg-black text-foreground",
      "py-12 sm:py-24 md:py-32 px-0",
      className
    )}>
      <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight text-white">
            {title}
          </h2>
          <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl text-gray-400">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(4)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                  />
                ))
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-black sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-black sm:block" />
        </div>
      </div>
    </section>
  )
}

const AnimatedGradientBackground = ({
  startingGap = 125,
  Breathing = false,
  gradientColors = [
    "#0A0A0A",
    "#2979FF", 
    "#FF80AB",
    "#FF6D00",
    "#FFD600",
    "#00E676",
    "#3D5AFE"
  ],
  gradientStops = [35, 50, 60, 70, 80, 90, 100],
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = "",
}: {
  startingGap?: number;
  Breathing?: boolean;
  gradientColors?: string[];
  gradientStops?: number[];
  animationSpeed?: number;
  breathingRange?: number;
  containerStyle?: React.CSSProperties;
  topOffset?: number;
  containerClassName?: string;
}) => {
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `GradientColors and GradientStops must have the same length.
   Received gradientColors length: ${gradientColors.length},
   gradientStops length: ${gradientStops.length}`
    );
  }

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrame: number;
    let width = startingGap;
    let directionWidth = 1;

    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;

      if (!Breathing) directionWidth = 0;
      width += directionWidth * animationSpeed;

      const gradientStopsString = gradientStops
        .map((stop, index) => `${gradientColors[index]} ${stop}%`)
        .join(", ");

      const gradient = `radial-gradient(${width}% ${width+topOffset}% at 50% 20%, ${gradientStopsString})`;

      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }

      animationFrame = requestAnimationFrame(animateGradient);
    };

    animationFrame = requestAnimationFrame(animateGradient);

    return () => cancelAnimationFrame(animationFrame);
  }, [startingGap, Breathing, gradientColors, gradientStops, animationSpeed, breathingRange, topOffset]);

  return (
    <motion.div
      key="animated-gradient-background"
      initial={{
        opacity: 0,
        scale: 1.5,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 2,
          ease: [0.25, 0.1, 0.25, 1],
        },
      }}
      className={`absolute inset-0 overflow-hidden ${containerClassName}`}
    >
      <div
        ref={containerRef}
        style={containerStyle}
        className="absolute inset-0 transition-transform"
      />
    </motion.div>
  );
};

const Navbar = () => {
  const [active, setActive] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const transition = {
    type: "spring",
    mass: 0.5,
    damping: 11.5,
    stiffness: 100,
    restDelta: 0.001,
    restSpeed: 0.001,
  };

  const navigationLinks = [
    { href: "#", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#about", label: "About" },
  ];

  const MenuItem = ({
    setActive,
    active,
    item,
    children,
  }: {
    setActive: (item: string) => void;
    active: string | null;
    item: string;
    children?: React.ReactNode;
  }) => {
    return (
      <div onMouseEnter={() => setActive(item)} className="relative">
        <motion.p
          transition={{ duration: 0.3 }}
          className="cursor-pointer text-white hover:opacity-[0.9]"
        >
          {item}
        </motion.p>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={transition}
          >
            {active === item && (
              <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
                <motion.div
                  transition={transition}
                  layoutId="active"
                  className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
                >
                  <motion.div layout className="w-max h-full p-4">
                    {children}
                  </motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  const Menu = ({
    setActive,
    children,
  }: {
    setActive: (item: string | null) => void;
    children: React.ReactNode;
  }) => {
    return (
      <nav
        onMouseLeave={() => setActive(null)}
        className="relative rounded-full border border-transparent bg-transparent shadow-input flex justify-center space-x-4 px-8 py-3 backdrop-blur-md"
      >
        {children}
      </nav>
    );
  };

  const HoveredLink = ({ children, href, ...rest }: any) => {
    return (
      <a
        href={href}
        {...rest}
        className="text-neutral-700 dark:text-neutral-200 hover:text-black"
      >
        {children}
      </a>
    );
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="fixed top-4 inset-x-0 max-w-2xl mx-auto z-50 hidden md:block">
        <Menu setActive={setActive}>
          {navigationLinks.map((link) => (
            <MenuItem key={link.label} setActive={setActive} active={active} item={link.label}>
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href={link.href}>{link.label}</HoveredLink>
                {link.label === "Features" && (
                  <>
                    <HoveredLink href="#features">AI Chat Tutor</HoveredLink>
                    <HoveredLink href="#features">Smart Notes</HoveredLink>
                    <HoveredLink href="#features">Instant Quizzes</HoveredLink>
                    <HoveredLink href="#features">Smart Flashcards</HoveredLink>
                  </>
                )}
                {link.label === "Pricing" && (
                  <>
                    <HoveredLink href="#pricing">Free Plan</HoveredLink>
                    <HoveredLink href="#pricing">Pro Plan</HoveredLink>
                    <HoveredLink href="#pricing">Team Plan</HoveredLink>
                  </>
                )}
                {link.label === "About" && (
                  <>
                    <HoveredLink href="#about">Our Story</HoveredLink>
                    <HoveredLink href="#about">Careers</HoveredLink>
                    <HoveredLink href="#about">Contact</HoveredLink>
                  </>
                )}
              </div>
            </MenuItem>
          ))}
          <Link to="/signin" className="text-white hover:opacity-[0.9] cursor-pointer flex items-center">Sign In</Link>
<Link to="/signup" className="text-white hover:opacity-[0.9] cursor-pointer flex items-center">Try for free</Link>
        </Menu>
      </div>

      {/* Mobile Navbar */}
      <div className="fixed top-4 inset-x-0 z-50 md:hidden">
        <div className="mx-4">
          <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-full px-4 py-3 flex items-center justify-between">
            <div className="text-white font-semibold">Tutorly</div>
           <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2"
            aria-label="Open navigation menu"
    >
  <MenuIcon className="h-5 w-5 text-black dark:text-white" /> 
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-4"
              >
                <div className="flex flex-col space-y-4">
                  {navigationLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-white hover:text-purple-300 transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <Link
  to="/signin"
  className="block text-white hover:text-purple-300 transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
    onClick={() => setIsMobileMenuOpen(false)}
>
  Sign In
</Link>
<Link
  to="/signup"
  className="block text-white hover:text-purple-300 transition-colors py-2 px-3 rounded-lg hover:bg-white/10 mt-2"
  onClick={() => setIsMobileMenuOpen(false)}
>
  Try for free
</Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon?: string;
  iconPosition?: "left" | "right";
}

interface FaqAccordionProps {
  data: FAQItem[];
  className?: string;
  timestamp?: string;
  questionClassName?: string;
  answerClassName?: string;
}

export function FaqAccordion({
  data,
  className,
  timestamp = "Every day, 9:01 AM",
  questionClassName,
  answerClassName,
}: FaqAccordionProps) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  return (
    <div className={cn("p-4", className)}>
      {timestamp && (
        <div className="mb-4 text-sm text-muted-foreground">{timestamp}</div>
      )}

      <Accordion.Root
        type="single"
        collapsible
        value={openItem || ""}
        onValueChange={(value) => setOpenItem(value)}
      >
        {data.map((item) => (
          <Accordion.Item 
            value={item.id.toString()} 
            key={item.id} 
            className="mb-2 border-b border-slate-700/50 last:border-b-0"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center justify-between gap-x-4 py-4 text-left text-lg font-medium text-white hover:text-purple-300 transition-colors">
                <div
                  className={cn(
                    "relative flex items-center space-x-2 rounded-xl p-2 transition-colors",
                    questionClassName
                  )}
                >
                  {item.icon && (
                    <span
                      className={cn(
                        "absolute bottom-6",
                        item.iconPosition === "right" ? "right-0" : "left-0"
                      )}
                      style={{
                        transform: item.iconPosition === "right" 
                          ? "rotate(7deg)" 
                          : "rotate(-4deg)",
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="font-medium">{item.question}</span>
                </div>

                <span 
                  className={cn(
                    "text-purple-400",
                    openItem === item.id.toString() && "text-purple-300"
                  )}
                >
                  {openItem === item.id.toString() ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content asChild forceMount>
              <motion.div
                initial="collapsed"
                animate={openItem === item.id.toString() ? "open" : "collapsed"}
                variants={{
                  open: { opacity: 1, height: "auto" },
                  collapsed: { opacity: 0, height: 0 },
                }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="ml-0 mt-1 pb-4 md:ml-0">
                  <div
                    className={cn(
                      "relative rounded-lg bg-slate-800/50 px-4 py-3 text-slate-300 text-base",
                      answerClassName
                    )}
                  >
                    {item.answer}
                  </div>
                </div>
              </motion.div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}

const OptimizedLearningPlatform = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pricingToggle, setPricingToggle] = useState<"monthly" | "yearly">("monthly");
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["amazing", "new", "wonderful", "beautiful", "smart"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const testimonials = [
    {
      id: 1,
      name: "Alice Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      description: "I've tried many study apps, but Tutorly's AI tutor feels like having a personal teacher available 24/7. It's truly revolutionized my learning process and made complex topics much easier to grasp."
    },
    {
      id: 2,
      name: "Bob Williams",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      description: "Tutorly transformed my study routine! The AI summaries save me hours, and the quiz generation is incredibly accurate. My grades have seen a significant improvement since I started using it."
    },
    {
      id: 3,
      name: "Charlie Brown",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      description: "The smart flashcards are a game-changer. I retain so much more information now. Highly recommend Tutorly! It adapts to my learning style, making revision efficient and effective."
    },
    {
      id: 4,
      name: "Diana Miller",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      description: "As a busy student, Tutorly's ability to turn lectures into notes and quizzes instantly is a lifesaver. My grades have improved! It's like having a dedicated study assistant always by my side."
    },
    {
      id: 5,
      name: "Eve Davis",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      description: "The multilingual AI feature is fantastic! I can study complex topics in my native language, which makes a huge difference. Tutorly truly breaks down language barriers in education."
    },
    {
      id: 6,
      name: "Frank White",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face",
      description: "Tutorly's math solver is a blessing! It not only gives answers but explains the steps clearly, helping me understand difficult concepts. It's an invaluable tool for STEM students."
    },
    {
      id: 7,
      name: "Grace Lee",
      avatar: "https://images.unsplash.com/photo-1531746020795-81c8555447fd?w=150&h=150&fit=crop&crop=face",
      description: "I love how Tutorly keeps me organized. All my notes, quizzes, and flashcards are in one place, easily accessible. It's the ultimate study hub for any student."
    },
    {
      id: 8,
      name: "Henry Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      description: "The adaptive learning paths are incredible. Tutorly identifies my weak spots and provides targeted practice, ensuring I master every topic. It's truly personalized education."
    },
    {
      id: 9,
      name: "Ivy Chen",
      avatar: "https://images.unsplash.com/photo-1529626465619-b7ee3fdd2cdb?w=150&h=150&fit=crop&crop=face",
      description: "Tutorly has made studying enjoyable again. The interactive features and engaging content keep me motivated and focused. I actually look forward to my study sessions now!"
    },
    {
      id: 10,
      name: "Jack Taylor",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      description: "The customer support is as impressive as the AI. Any questions I had were answered quickly and thoroughly. It's clear they care about their users' success."
    },
  ];

  const faqData = [
    {
      id: 1,
      question: "What can Tutorly help me with?",
      answer: "Tutorly is an AI-powered study assistant that can help you with instant AI tutoring, smart note generation, quiz creation, adaptive flashcards, math problem solving, and multilingual learning support. It's designed to make your study routine more efficient and effective.",
    },
    {
      id: 2,
      question: "How accurate are the AI-generated notes?",
      answer: "Our AI-generated notes are highly accurate, leveraging advanced natural language processing to summarize and extract key information from your documents. While highly reliable, we always recommend reviewing them to ensure they align perfectly with your specific learning needs.",
    },
    {
      id: 3,
      question: "Is Tutorly free to use?",
      answer: "Yes, Tutorly offers a free plan with essential features to get you started. We also have Pro and Team plans with more advanced functionalities and unlimited usage for those who need more comprehensive support.",
    },
    {
      id: 4,
      question: "Can I upload PDF or DOCX files for summarization?",
      answer: "Absolutely! Tutorly supports uploading various document formats, including PDF and DOCX, for AI-powered summarization. Simply upload your file, and our AI will quickly process it to provide concise summaries and key insights.",
    },
    {
      id: 5,
      question: "Are my documents and data secure?",
      answer: "We prioritize your data security and privacy. All uploaded documents and personal data are encrypted and stored securely. We adhere to strict privacy policies and do not share your information with third parties.",
    },
    {
      id: 6,
      question: "What languages does Tutorly support?",
      answer: "Tutorly's multilingual AI supports a wide range of languages, allowing you to learn and interact in your preferred language. Our goal is to make learning accessible to students worldwide.",
    },
    {
      id: 7,
      question: "Can I use Tutorly on mobile devices?",
      answer: "Yes, Tutorly is designed to be fully responsive and accessible across all devices, including smartphones and tablets. You can access your study materials and AI tools anytime, anywhere, directly from your mobile browser.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <UniversityGallery />

      {/* Navbar */}
      <Navbar />
      
      {/* Enhanced Hero Section with Canvas Reveal Effect */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-black dark:via-purple-950 dark:to-black min-h-screen flex items-center">
        {/* Canvas Reveal Effect Background */}
        <div className="absolute inset-0 z-0">
          <CanvasRevealEffect
            animationSpeed={2}
            containerClassName="bg-transparent"
            colors={[
              [147, 51, 234],
              [59, 130, 246],
            ]}
            dotSize={4}
            showGradient={false}
          />
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse" />
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-200">AI-Powered Learning Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-center mb-6 text-white">
                Your Personal
                <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                  &nbsp;
                 {titles.map((title, index) => (
  <motion.span
    key={index}
className="absolute font-semibold text-4xl md:text-5xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent dark:bg-none dark:text-white"    initial={{ opacity: 0, y: -100 }}
    animate={
      titleNumber === index
        ? {
            y: 0,
            opacity: 1,
          }
        : {
            y: titleNumber > index ? -150 : 150,
            opacity: 0,
          }
    }
    transition={{ duration: 0.8, ease: "easeInOut" }} // <--- SMOOTH transition
  >
    {title}
  </motion.span>
))}
                </span>
                <span className="block text-4xl md:text-5xl text-gray-900 dark:text-gray-100">
                  AI Tutor
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-4 font-medium">
                Study Smarter. Learn Faster.
              </p>
              
              <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
                Turn your lectures, notes, and readings into flashcards, summaries, and quizzes — all powered by AI.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
             <RainbowButton
  className="text-lg px-8 py-4 h-auto font-semibold shadow-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
  onClick={() => navigate('/signup')}
  disabled={isLoading}
>
  <Zap className="mr-2 h-5 w-5" />
  Start Learning Free
</RainbowButton>
              
              <button 
                className="text-lg px-8 py-4 h-auto font-semibold bg-transparent border-2 border-white/30 text-white rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="mr-2 h-5 w-5 inline" />
                Watch Demo
              </button>
            </motion.div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500K+</div>
                <p className="text-gray-300">Students Worldwide</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">128+</div>
                <p className="text-gray-300">Countries</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">200+</div>
                <p className="text-gray-300">Top Institutions</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Powerful AI tools designed for modern learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Brain className="h-12 w-12 text-purple-500" />,
                title: "AI Chat Tutor",
                description: "Get instant help from your personal AI tutor, available 24/7 for any subject"
              },
              {
                icon: <FileText className="h-12 w-12 text-blue-500" />,
                title: "Smart Notes",
                description: "Transform any document into organized, AI-enhanced study notes"
              },
              {
                icon: <Zap className="h-12 w-12 text-green-500" />,
                title: "Instant Quizzes",
                description: "Generate personalized quizzes from your study materials automatically"
              },
              {
                icon: <BookOpen className="h-12 w-12 text-red-500" />,
                title: "Smart Flashcards",
                description: "Create adaptive flashcards that focus on what you need to learn"
              },
              {
                icon: <Calculator className="h-12 w-12 text-orange-500" />,
                title: "Math Solver",
                description: "Step-by-step solutions for complex math problems with explanations"
              },
              {
                icon: <Languages className="h-12 w-12 text-pink-500" />,
                title: "Multilingual AI",
                description: "Learn in your preferred language with global AI support"
              }
            ].map((feature, i) => (
              <li key={i} className="min-h-[14rem] list-none">
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                  />
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                      <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                        {feature.icon}
                      </div>
                      <div className="space-y-3">
                        <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                          {feature.title}
                        </h3>
                        <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                          {feature.description}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Tutorly? Section with Timeline */}
      <Timeline data={[
        {
          title: "24/7 AI Tutoring",
          content: (
            <div>
              <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
                Get instant, personalized help anytime, anywhere, making learning accessible and flexible. Our AI tutor never sleeps and is always ready to help you understand complex concepts.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Instant Responses</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Get answers to your questions in seconds, not hours</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "Smart Study Tools",
          content: (
            <div>
              <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
                Effortlessly generate flashcards and quizzes from your materials, saving you valuable study time. Transform any document into interactive learning content.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Auto Flashcards</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300">Generate from any text</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900/20 dark:to-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Smart Quizzes</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300">Adaptive difficulty</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "AI Summaries",
          content: (
            <div>
              <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
                Quickly grasp key concepts from any PDF or document with AI-powered summarization.
              </p>
              <div className="mb-8">
                <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
                  ✅ PDF document processing
                </div>
                <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
                  ✅ Key concept extraction
                </div>
                <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
                  ✅ Multi-language support
                </div>
                <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
                  ✅ Instant summarization
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Smart Processing</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Upload any document and get instant, intelligent summaries</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: "Personalized Learning",
          content: (
            <div>
              <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
                Experience a study journey uniquely adapted to your needs and learning style for maximum retention. Join a vibrant network of learners from over 20 countries.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Adaptive Learning</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300">Tailored to your pace</p>
                </div>
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">Global Community</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300">20+ countries</p>
                </div>
              </div>
            </div>
          ),
        },
      ]} />

      {/* University Logos Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 relative inline-block pb-2">
            Loved by thousands of students across top universities and schools worldwide
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-70" />
          </h2>
          <div className="relative w-full max-w-4xl mx-auto aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {universityLogos.map((logo, index) => {
                  const angle = (index / universityLogos.length) * 2 * Math.PI;
                  const radius = 200; // Adjust radius as needed for visual balance
                  const x = radius * Math.cos(angle);
                  const y = radius * Math.sin(angle);

                  return (
                    <motion.img
                      key={index}
                      src={logo}
                      alt={`University Logo ${index + 1}`}
                      className="absolute w-16 h-16 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 0.7, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      style={{
                        left: `calc(50% + ${x}px - 32px)`, // 32px is half of w-16
                        top: `calc(50% + ${y}px - 32px)`,  // 32px is half of h-16
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Testimonials Section */}
<section className="bg-black text-foreground py-12 sm:py-24 md:py-32 px-0">
  <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center sm:gap-16">
    <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
      <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight text-white">
        Trusted by Students worldwide
      </h2>
      <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl text-gray-400">
        Join thousands of Students who are already building the future with our AI platform
      </p>
    </div>
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <TestimonialCarousel 
        testimonials={testimonials}
        className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto"
        showArrows={false}
        showDots={true}
      />
    </div>
    {/* Swipe indicator */}
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm animate-pulse">
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Swipe for more</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
</section>
      
      {/* Pricing Section */}
      <section className="relative overflow-hidden bg-black text-white py-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-base text-gray-400 md:text-lg mb-8">
              Start free, upgrade when you're ready
            </p>

            <div className="inline-flex bg-zinc-800 p-1 rounded-lg">
              <button
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  pricingToggle === "monthly" 
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => setPricingToggle("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  pricingToggle === "yearly" 
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => setPricingToggle("yearly")}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <motion.div
              initial={{ filter: "blur(2px)" }}
              whileInView={{ filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.25 }}
            >
              <Card className="relative h-full w-full overflow-hidden border border-zinc-700 bg-gradient-to-br from-zinc-950/50 to-zinc-900/80 p-6">
                <div className="flex flex-col items-center border-b pb-6 border-zinc-700">
                  <span className="mb-6 inline-block text-zinc-50">Free</span>
                  <span className="mb-3 inline-block text-4xl font-medium text-white">$0/mo</span>
                  <span className="bg-gradient-to-br from-zinc-200 to-zinc-500 bg-clip-text text-center text-transparent">
                    Perfect for getting started
                  </span>
                </div>
                <div className="space-y-4 py-9">
                  {[
                    { text: "5 AI summaries/month", checked: true },
                    { text: "Basic flashcards", checked: true },
                    { text: "Community support", checked: true },
                    { text: "Unlimited AI features", checked: false },
                    { text: "Advanced quiz generation", checked: false },
                    { text: "Priority support", checked: false },
                  ].map((benefit, index) => (
                    <Benefit key={index} {...benefit} />
                  ))}
                </div>
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-600" variant="ghost">
                  Get Started Free
                </Button>
              </Card>
            </motion.div>

            <motion.div
              initial={{ filter: "blur(2px)" }}
              whileInView={{ filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.35 }}
            >
              <Card className="relative h-full w-full overflow-hidden border border-zinc-600 bg-gradient-to-br from-zinc-900/50 to-zinc-800/80 p-6 ring-2 ring-purple-500/20">
                <div className="flex flex-col items-center border-b pb-6 border-zinc-700">
                  <span className="mb-6 inline-block text-zinc-50">Pro</span>
                  <span className="mb-3 inline-block text-4xl font-medium text-white">
                    {pricingToggle === "monthly" ? "$9.99/mo" : "$7.99/mo"}
                  </span>
                  <span className="bg-gradient-to-br from-zinc-200 to-zinc-500 bg-clip-text text-center text-transparent">
                    Best for serious students
                  </span>
                </div>
                <div className="space-y-4 py-9">
                  {[
                    { text: "Unlimited AI features", checked: true },
                    { text: "Advanced quiz generation", checked: true },
                    { text: "Priority support", checked: true },
                    { text: "Export options", checked: true },
                    { text: "Team collaboration", checked: false },
                    { text: "Admin dashboard", checked: false },
                  ].map((benefit, index) => (
                    <Benefit key={index} {...benefit} />
                  ))}
                </div>
                <RainbowButton className="w-full h-auto py-3">
                  Upgrade to Pro
                </RainbowButton>
              </Card>
            </motion.div>

            <motion.div
              initial={{ filter: "blur(2px)" }}
              whileInView={{ filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.45 }}
            >
              <Card className="relative h-full w-full overflow-hidden border border-zinc-700 bg-gradient-to-br from-zinc-950/50 to-zinc-900/80 p-6">
                <div className="flex flex-col items-center border-b pb-6 border-zinc-700">
                  <span className="mb-6 inline-block text-zinc-50">Team</span>
                  <span className="mb-3 inline-block text-4xl font-medium text-white">
                    {pricingToggle === "monthly" ? "$19.99/mo" : "$15.99/mo"}
                  </span>
                  <span className="bg-gradient-to-br from-zinc-200 to-zinc-500 bg-clip-text text-center text-transparent">
                    For study groups & classes
                  </span>
                </div>
                <div className="space-y-4 py-9">
                  {[
                    { text: "Everything in Pro", checked: true },
                    { text: "Team collaboration", checked: true },
                    { text: "Admin dashboard", checked: true },
                    { text: "Custom integrations", checked: true },
                    { text: "Dedicated account manager", checked: true },
                    { text: "SLA", checked: true },
                  ].map((benefit, index) => (
                    <Benefit key={index} {...benefit} />
                  ))}
                </div>
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-600" variant="ghost">
                  Contact Sales
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <FaqAccordion
              data={faqData}
              className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50"
              questionClassName="text-white"
              answerClassName="text-slate-300"
              timestamp="" // Remove timestamp as per request
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Gradient Background */}
        <AnimatedGradientBackground
          startingGap={125}
          Breathing={true}
          gradientColors={[
            "#0A0A0A",
            "#9333EA", // Purple to match hero
            "#3B82F6", // Blue to match hero  
            "#6366F1", // Indigo to match hero
            "#8B5CF6", // Violet
            "#A855F7", // Purple variant
            "#7C3AED"  // Purple variant
          ]}
          gradientStops={[35, 50, 60, 70, 80, 90, 100]}
          animationSpeed={0.02}
          breathingRange={5}
          topOffset={0}
          containerClassName="opacity-80"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-200">Transform Your Learning Today</span>
              </div>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Ready to Transform Your Learning?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-200 mb-8"
            >
              Join over 500,000 students who are already studying smarter with AI
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
           <RainbowButton
  className="text-xl px-12 py-4 h-auto font-semibold shadow-xl"
  onClick={() => navigate('/signup')}
  disabled={isLoading}
>
  <Zap className="mr-2 h-6 w-6" />
  {isLoading ? "Loading..." : "Start Your Free Journey"}
</RainbowButton>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-200 mt-4 text-sm"
            >
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <div className="text-white text-center">
                <Play className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Demo Video Coming Soon!</p>
                <p className="text-sm opacity-75">See Tutorly in action</p>
              </div>
            </div>
            <button
              className="w-full h-auto py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
              onClick={() => setIsVideoPlaying(false)}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OptimizedLearningPlatform;

