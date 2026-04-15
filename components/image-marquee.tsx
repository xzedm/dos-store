"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "./image-marquee.module.css";

type ImageMarqueeProps = {
  images: string[];
  speed?: number;
  className?: string;
  imageClassName?: string;
  alt?: string;
};

export default function ImageMarquee({
  images,
  speed = 32,
  className = "",
  imageClassName = "",
  alt = "Gallery image",
}: ImageMarqueeProps) {
  const marqueeStyle = {
    "--marquee-duration": `${speed}s`,
  } as CSSProperties;

  if (images.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Image carousel"
      className={`${styles.container} ${className}`.trim()}
      style={marqueeStyle}
    >
      <div className={styles.edgeFadeLeft} aria-hidden="true" />
      <div className={styles.edgeFadeRight} aria-hidden="true" />

      <div className={styles.track}>
        {[0, 1].map((groupIndex) => (
          <ul
            key={groupIndex}
            className={styles.group}
            aria-hidden={groupIndex === 1}
          >
            {images.map((imageUrl, index) => (
              <li key={`${imageUrl}-${groupIndex}-${index}`} className={styles.itemWrap}>
                <figure className={styles.item}>
                  <Image
                    src={imageUrl}
                    alt={`${alt} ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 72vw, 20rem"
                    className={`${styles.image} ${imageClassName}`.trim()}
                    loading="lazy"
                    placeholder="empty"
                  />
                </figure>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}