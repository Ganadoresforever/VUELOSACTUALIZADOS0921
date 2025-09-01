import { FaPlane, FaSearch } from "react-icons/fa";

interface FlightLoaderProps {
  message?: string;
  showPlane?: boolean;
}

export default function FlightLoader({ 
  message = "Buscando vuelos disponibles...", 
  showPlane = true 
}: FlightLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      {/* Icono principal con animación */}
      <div className="relative">
        {showPlane ? (
          <div className="relative">
            {/* Avión principal */}
            <FaPlane className="w-16 h-16 text-blue-600 animate-bounce" />
            
            {/* Aviones secundarios con diferentes delays */}
            <FaPlane className="absolute -top-4 -left-4 w-8 h-8 text-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <FaPlane className="absolute -top-2 -right-2 w-6 h-6 text-blue-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
            <FaPlane className="absolute -bottom-2 -left-2 w-5 h-5 text-blue-200 animate-bounce" style={{ animationDelay: '0.6s' }} />
          </div>
        ) : (
          <div className="relative">
            {/* Lupa principal */}
            <FaSearch className="w-16 h-16 text-blue-600 animate-pulse" />
            
            {/* Puntos de búsqueda */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-ping" />
            <div className="absolute top-2 -left-2 w-3 h-3 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
            <div className="absolute -bottom-2 right-2 w-2 h-2 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
          </div>
        )}
      </div>

      {/* Mensaje principal */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-700">{message}</h3>
        <p className="text-gray-500 text-sm">Esto puede tomar unos segundos</p>
      </div>

      {/* Barra de progreso animada */}
      <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse">
          <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse" 
               style={{ 
                 animation: 'shimmer 2s infinite',
                 background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                 backgroundSize: '200% 100%'
               }} />
        </div>
      </div>

      {/* Indicadores de estado */}
      <div className="flex space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* Texto de estado */}
      <div className="text-xs text-gray-400 space-y-1 text-center">
        <p>✓ Verificando disponibilidad</p>
        <p>✓ Calculando precios</p>
        <p className="text-blue-500 font-medium">🔄 Generando opciones de vuelo...</p>
      </div>
    </div>
  );
}

