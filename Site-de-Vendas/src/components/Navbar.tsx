import { Link } from 'react-router-dom';
import { ShoppingCart, LayoutDashboard, Store } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <Store className="text-blue-500" />
          <span>Market<span className="text-blue-500">Place</span></span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-blue-400 transition-colors">Marketplace</Link>
          <Link to="/admin" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <LayoutDashboard size={18} />
            Admin
          </Link>
          <Link to="/cart" className="relative hover:text-blue-400 transition-colors">
            <ShoppingCart size={24} />
            {/* Badge for cart count could go here */}
          </Link>
        </div>
      </div>
    </nav>
  );
}
