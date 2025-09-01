import React from "react";

interface FullScreenLoaderProps {
  message?: string;
  customImage?: string;
}

export default function FullScreenLoader({ 
  message = "Buscando vuelos disponibles...",
  customImage
}: FullScreenLoaderProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      {/* Imagen personalizada o spinner por defecto */}
      {customImage ? (
        <div className="relative mb-6">
          <img 
            src={customImage} 
            alt="Loading" 
            className="w-[200px] h-[200px] object-contain"
          />
        </div>
      ) : (
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Mensaje */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500 text-sm">Esto puede tomar unos segundos</p>
      </div>
    </div>
  );
}

