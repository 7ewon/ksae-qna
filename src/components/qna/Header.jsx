import { MenuIcon } from './icons.jsx'

export function Header() {
  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}logo-ksae.png`} alt="KSAE" className="h-9 w-auto object-contain" />
        <img src={`${import.meta.env.BASE_URL}logo-gbunge.png`} alt="G.BUNG&E" className="h-9 w-auto object-contain" />
      </div>
    </header>
  )
}
