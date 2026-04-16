import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// 引入 Swiper 样式
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import './index.scss'
interface SlideItem {
    src: string;
    label: string;
}

const defaultSlides: SlideItem[] = [
    { src: "https://picsum.photos/700/420?random=11", label: "Mountain Serenity" },
    { src: "https://picsum.photos/700/420?random=22", label: "Ocean Horizon" },
    { src: "https://picsum.photos/700/420?random=33", label: "City Lights" },
    { src: "https://picsum.photos/700/420?random=44", label: "Forest Path" },
    { src: "https://picsum.photos/700/420?random=55", label: "Golden Hour" },
];

export default function SwiperOverlapCarousel() {
    return (
        <div className="carousel-container">
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
                        const opacity = absProgress === 0 ? 0 : absProgress > 1 ? 0.72 : 0.48;
                        const overlay = slide.querySelector(".slide-overlay") as HTMLElement;
                        if (overlay) overlay.style.background = `rgba(0,0,0,${opacity})`;

                        // 可以顺便加一点缩放，如果不想要缩放，把 scale 设为 1
                        const scale = 1 - absProgress * 0.05;
                        slide.style.transform = `scale(${scale})`;
                        slide.style.zIndex =`${Math.round(10 - absProgress)}`;
                    });
                }}
                style={{
                    // 自定义导航箭头样式（可选）
                    "--swiper-navigation-size": "20px",
                    "--swiper-theme-color": "#111",
                } as React.CSSProperties}
            >
                {defaultSlides.map((slide, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                        <div>
                            <img
                                src={slide.src}
                                alt={slide.label}
                            />
                            {/* 遮罩层 */}
                            <div className="slide-overlay"/>
                            {/* 文字（通过 Swiper 的 active class 控制显示） */}
                            <div className="slide-label">
                                {slide.label}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>


        </div>
    );
}