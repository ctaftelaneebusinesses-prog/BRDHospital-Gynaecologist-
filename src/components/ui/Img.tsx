import { img, srcSet } from "../../data/images";

interface ImgProps {
  slug: string;
  alt: string;
  className?: string;
  width?: number;
  sizes?: string;
  loading?: "lazy" | "eager";
}

export function Img({ slug, alt, className = "", width = 1080, sizes = "100vw", loading = "lazy" }: ImgProps) {
  const set = srcSet(slug);
  return (
    <img
      src={img(slug, { w: width })}
      srcSet={set || undefined}
      sizes={set ? sizes : undefined}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
    />
  );
}
