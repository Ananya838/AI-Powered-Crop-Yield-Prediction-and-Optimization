import { Link, useLocation } from 'react-router-dom'
import { Sprout } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Predict Yield' },
  { to: '/optimize', label: 'Optimize Farm' },
  { to: '/crops', label: 'Crops' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary-700 text-lg">
          <Sprout className="w-6 h-6" />
          CropAI
        </Link>
        <div className="flex gap-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === to
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
