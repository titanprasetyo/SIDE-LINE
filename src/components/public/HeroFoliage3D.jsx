import { useState, useEffect, useRef } from "react";
import heroLeavesImg from "../../assets/hero-leaves.png";
import heroLeavesShadowImg from "../../assets/hero-leaves-shadow.png";

/**
 * HeroFoliage3D
 * Komponen animasi dedaunan 3D dan bayangan alami.
 * - Mepet langsung pada garis tepi layar (sudut kanan atas).
 * - Ukuran diperkecil proporsional agar tidak menyentuh atau menutupi foto/konten utama.
 * - Utuh dan rapi tanpa patahan, berayun hidup terhembus angin (3D breeze) + interaksi mouse parallax.
 */
export default function HeroFoliage3D() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const targetX = (e.clientX - centerX) / centerX;
      const targetY = (e.clientY - centerY) / centerY;

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setMouseOffset({
          x: targetX,
          y: targetY,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Parallax transform 3D halus untuk dedaunan (foreground)
  const parallaxLeafStyle = {
    transform: `perspective(800px) rotateX(${mouseOffset.y * -4}deg) rotateY(${mouseOffset.x * 5}deg) translate3d(${mouseOffset.x * -8}px, ${mouseOffset.y * -6}px, 10px)`,
    transition: "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
    transformOrigin: "top right",
  };

  // Parallax untuk bayangan di latar belakang (dinding/kertas)
  const parallaxShadowStyle = {
    transform: `translate3d(${mouseOffset.x * -14}px, ${mouseOffset.y * -10}px, 0px) scale(${1 + Math.abs(mouseOffset.x) * 0.015})`,
    transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
    transformOrigin: "top right",
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none select-none absolute inset-0 overflow-hidden z-20"
      aria-hidden="true"
    >
      {/* =========================================================================
          1. EFEK BAYANGAN SINAR MATAHARI ALAMI DI BACKGROUND (DINDING/KERTAS KREM)
      ========================================================================= */}
      {/* Bayangan Siluet Daun Utama (Mepet Tepi Layar) */}
      <div className="absolute -top-2 sm:-top-4 md:-top-6 -right-5 xs:-right-7 sm:-right-10 md:-right-14 lg:-right-18 xl:-right-22 2xl:-right-24 w-[100px] xs:w-[125px] sm:w-[165px] md:w-[210px] lg:w-[245px] xl:w-[275px] 2xl:w-[310px] pointer-events-none z-0">
        <div style={parallaxShadowStyle} className="w-full">
          <div className="w-full animate-leaf-shadow mix-blend-multiply opacity-40 sm:opacity-50 filter blur-[3.5px] sm:blur-[5px]">
            <img
              src={heroLeavesShadowImg}
              alt=""
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Bayangan Ranting Ambient Lembut */}
      <div className="absolute -top-10 sm:-top-14 -right-10 sm:-right-14 w-[220px] xs:w-[280px] sm:w-[400px] md:w-[520px] lg:w-[620px] 2xl:w-[720px] h-[280px] xs:h-[350px] sm:h-[480px] md:h-[500px] 2xl:h-[600px] pointer-events-none z-0">
        <div style={parallaxShadowStyle} className="w-full h-full">
          <div className="w-full h-full animate-leaf-shadow mix-blend-multiply opacity-25 sm:opacity-35">
            <svg
              viewBox="0 0 650 650"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full filter blur-[7px] sm:blur-[10px] md:blur-[13px]"
            >
              <path
                d="M660,-20 C570,60 490,160 420,290 C360,400 300,520 230,660"
                stroke="#26190B"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M520,120 C440,190 370,280 310,380 C270,450 220,550 170,640"
                stroke="#26190B"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M580,70 C520,80 450,120 400,170 C370,205 390,230 420,225 C470,215 530,150 580,70 Z"
                fill="#26190B"
              />
              <path
                d="M480,240 C410,280 340,350 290,440 C270,475 295,495 325,485 C375,465 430,370 480,240 Z"
                fill="#26190B"
              />
              <circle cx="490" cy="180" r="35" fill="#26190B" />
              <circle cx="410" cy="290" r="40" fill="#26190B" />
            </svg>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. DEDAUNAN UTUH 3D MEPET PADA GARIS LAYAR (SUDUT KANAN ATAS)
      ========================================================================= */}
      <div className="absolute -top-2 xs:-top-3 sm:-top-5 md:-top-7 -right-6 xs:-right-8 sm:-right-12 md:-right-16 lg:-right-20 xl:-right-24 2xl:-right-26 w-[95px] xs:w-[115px] sm:w-[155px] md:w-[195px] lg:w-[225px] xl:w-[250px] 2xl:w-[280px] pointer-events-none z-30">
        <div style={parallaxLeafStyle} className="w-full">
          {/* Ayunan Angin 3D Realistis */}
          <div className="w-full animate-leaf-wind-breeze">
            <img
              src={heroLeavesImg}
              alt="SIDE LINE Foliage"
              className="w-full h-auto object-contain drop-shadow-[0_12px_22px_rgba(20,20,20,0.32)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
