import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  href?: string;
};

export function BrandLogo({ className = "", href }: BrandLogoProps) {
  const image = (
    <Image
      className={`brand-logo ${className}`.trim()}
      src="/brand/logo-horizontal-onDark.svg"
      alt="EasyClub"
      width={272}
      height={64}
    />
  );

  return href ? (
    <a className="logo" href={href} aria-label="EasyClub, strona główna">
      {image}
    </a>
  ) : (
    image
  );
}

export function BrandMark({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Image
      className={`brand-mark-image ${className}`.trim()}
      src={dark ? "/brand/mark-mono-graphite.svg" : "/brand/mark-mono-white.svg"}
      alt=""
      aria-hidden="true"
      width={64}
      height={64}
    />
  );
}
