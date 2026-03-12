import Image from "next/image"

interface AmbevSaudeLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function AmbevSaudeLogo({ className = "", size = "md" }: AmbevSaudeLogoProps) {
  // Define sizes for different variants
  const sizes = {
    sm: { height: 20, width: 80, textClass: "text-base" },
    md: { height: 24, width: 96, textClass: "text-lg" },
    lg: { height: 32, width: 128, textClass: "text-xl" },
  }

  const { height, width, textClass } = sizes[size]

  return (
    <div className={`relative flex items-end ${className}`}>
      <Image src="/ambev-logo.png" alt="Ambev" height={height} width={width} className="object-contain" />
      <span
        className={`${textClass} text-black font-normal ml-2`}
        style={{
          position: "relative",
          bottom: "-3px", // Fine-tuned positioning to align with bottom of logo
          lineHeight: 1,
        }}
      >
        Saúde
      </span>
    </div>
  )
}
