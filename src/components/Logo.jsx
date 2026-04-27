export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-16',
  }
  const s = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-2.5">
      <img src="/medon-logo1.png" alt="Medon" className={`${s} w-auto object-contain`} />
    </div>
  )
}
