import { useTheme } from '../context/ThemeContext';

const LoadingSkeleton = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`
      ${darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-white to-gray-50'
      }
      rounded-xl overflow-hidden shadow-lg border
      ${darkMode ? 'border-gray-700' : 'border-gray-200'}
      animate-pulse
    `}>
      {/* Image skeleton */}
      <div className={`
        h-56 w-full
        ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
      `} />
      
      {/* Content skeleton */}
      <div className="p-6">
        {/* Title skeleton */}
        <div className={`
          h-6 w-3/4 rounded mb-3
          ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `} />
        
        {/* Price and store skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className={`
            h-8 w-24 rounded
            ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
          `} />
          <div className={`
            h-6 w-16 rounded-full
            ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
          `} />
        </div>
        
        {/* Button skeleton */}
        <div className={`
          h-12 w-full rounded-full
          ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `} />
      </div>
    </div>
  );
};

const LoadingSkeletonGrid = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton key={index} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
export { LoadingSkeletonGrid };