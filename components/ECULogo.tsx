import Image from 'next/image'

interface ECULogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function ECULogo({ size = 'md', className = '' }: ECULogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20', 
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  return (
    <div className={`${sizeClasses[size]} bg-white rounded-2xl shadow-lg flex items-center justify-center p-2 ${className}`}>
      <Image 
        src="/ecu-logo.png" 
        alt="ECU Logo" 
        width={80}
        height={80}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  )
}