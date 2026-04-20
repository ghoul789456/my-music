import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import img1 from "../../assets/1.png";
import img2 from "../../assets/2.png";
import img3 from "../../assets/3.png";
import img4 from "../../assets/4.png";
import img5 from "../../assets/5.png";

// 引入 Swiper 样式
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import styles from "./index.module.scss";

interface SlideItem {
  src: string;
  label: string;
}

const defaultSlides: SlideItem[] = [
  {
    src: img1,
    label: "Mountain Serenity",
  },
  { src: img2, label: "Ocean Horizon" },
  { src: img3, label: "City Lights" },
  { src: img4, label: "City Lights" },
  { src: img5, label: "City Lights" },
];

export default function SwiperOverlapCarousel() {
  return (
    <div className={styles.carouselContainer}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={-40} // 关键：负间距实现重叠效果
        slidesPerView={1.4} // 露出两侧的一部分
        centeredSlides={true}
        loop={true}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        watchSlidesProgress={true}
        // 自定义过渡逻辑，模拟原生的阴影和缩放
        onProgress={(swiper) => {
          swiper.slides.forEach((slide) => {
            const progress = (slide as any).progress;
            const absProgress = Math.abs(progress);

            // 越远越暗
            const opacity =
              absProgress === 0 ? 0 : absProgress > 1 ? 0.72 : 0.48;
            // slide-overlay 是全局类名，querySelector 可以正常找到
            const overlay = slide.querySelector(
              ".slide-overlay",
            ) as HTMLElement;
            if (overlay) overlay.style.background = `rgba(0,0,0,${opacity})`;

            // 可以顺便加一点缩放，如果不想要缩放，把 scale 设为 1
            const scale = 1 - absProgress * 0.05;
            slide.style.transform = `scale(${scale})`;
            slide.style.zIndex = `${Math.round(10 - absProgress)}`;
          });
        }}
        style={
          {
            // 自定义导航箭头样式（可选）
            "--swiper-navigation-size": "20px",
            "--swiper-theme-color": "#111",
          } as React.CSSProperties
        }
      >
        {defaultSlides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div>
              <img src={slide.src} alt={slide.label} />
              {/* 遮罩层：保持全局类名，供 JS querySelector 查找 */}
              <div className="slide-overlay" />
              {/* 文字（通过 Swiper 的 active class 控制显示） */}
              <div className="slide-label">{slide.label}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
