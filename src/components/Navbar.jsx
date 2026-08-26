import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            3D Print Shop
          </Link>
          <div className="space-x-6">
            <Link to="/" className="hover:text-blue-600">Početna</Link>
            <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;