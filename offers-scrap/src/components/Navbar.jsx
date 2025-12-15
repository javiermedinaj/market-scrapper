import { CirclePercent } from 'lucide-react';

const Navbar = () => {

  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <CirclePercent size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-500">OfertasBA</h1>
              <p className="text-xs text-gray-400">Las mejores ofertas de supermercados</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
