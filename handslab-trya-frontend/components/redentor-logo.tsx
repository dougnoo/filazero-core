import Image from "next/image"

interface RedentorLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function RedentorLogo({ className = "", size = "md" }: RedentorLogoProps) {
  // Define sizes for the Redentor logo (adjusted for new aspect ratio)
  const sizes = {
    sm: { height: 24, width: 80 },
    md: { height: 32, width: 106 },
    lg: { height: 40, width: 133 },
  }

  const { height, width } = sizes[size]

  return (
    <div className={`flex items-center ${className}`}>
      <Image 
        src="/redentor-logo.svg" 
        alt="Redentor Seguros" 
        height={height} 
        width={width} 
        className="object-contain" 
      />
    </div>
  )
}
