interface CerosityLogoProps {
  size?: number;
  className?: string;
}

export function CerosityLogo({ size = 24, className = "" }: CerosityLogoProps) {
  return (
    <img
      src="/favicon.png"
      alt="Cerosity Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}