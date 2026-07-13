import { SearchIcon } from './icons.jsx'

export function SearchInput({ value, onChange }) {
  return (
    <div className="search-bar">
      <SearchIcon className="h-5 w-5 shrink-0 text-black" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="검색어를 입력해주세요."
        className="w-full text-[15px] text-fg outline-none placeholder:text-fg-faint"
      />
    </div>
  )
}
