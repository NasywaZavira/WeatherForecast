import { Search, Bell } from 'lucide-react'

export default function Topbar({ location = 'Medan, Indonesia' }) {
  return (
    <div className="flex items-center gap-4 px-8 py-5" style={{borderBottom:'1px solid #347E3A22'}}>
      <h2 className="font-body font-bold text-2xl flex-1" style={{color:'#F3EEE3'}}>{location}</h2>
      <div className="flex items-center gap-2 rounded-full px-5 py-2.5 w-80"
        style={{background:'#0f1f0f', border:'1px solid #347E3A44'}}>
        <Search size={14} style={{color:'#56B988'}} className="shrink-0" />
        <input type="text" placeholder="Search location..."
          className="bg-transparent font-body text-sm outline-none flex-1"
          style={{color:'#F3EEE3'}}
        />
      </div>
      <button className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
        style={{border:'1px solid #347E3A44'}}>
        <Bell size={16} style={{color:'#D3BE94'}} />
      </button>
    </div>
  )
}
