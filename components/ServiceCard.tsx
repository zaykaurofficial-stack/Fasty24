'use client';
import { useState } from 'react';
import Image from 'next/image';

interface ServiceCardProps {
  id: string;
  name: string;
  description?: string;
  image: string;
  categoryName?: string;
  options?: { label: string; price: number; duration: number }[];
  included?: string[];
  excluded?: string[];
  partsUsed?: string[];
}

export default function ServiceCard({ 
  id, 
  name, 
  description, 
  image, 
  categoryName = 'Service', 
  options = [], 
  included = [],
  excluded = [],
  partsUsed = []
}: ServiceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col h-full bg-[#1c1c1c] border border-white/5 rounded-3xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 shadow-xl cursor-pointer">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image src={image} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-transparent to-transparent" />
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">{categoryName}</span>
          <h3 className="text-lg font-bold text-white mt-1 mb-2">{name}</h3>
          <p className="text-xs text-gray-400 mb-4 line-clamp-2">{description}</p>

          <div className="space-y-2 mb-4">
            {options?.slice(0, 2).map((opt, idx) => (
              <div key={idx} className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg">
                <span className="text-xs text-gray-200 font-medium">{opt.label}</span>
                <span className="text-sm font-bold text-white">₹{opt.price}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true); }} 
              className="text-xs text-gray-500 hover:text-white underline"
            >
              View Details
            </button>
            <button className="bg-yellow-500 text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white transition-colors">
              ADD
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 p-6 rounded-3xl max-w-sm w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">{name}</h2>
            
            {/* Included */}
            {included.length > 0 && (
              <div className="mb-4">
                <h4 className="text-yellow-500 font-bold text-sm mb-2">✓ What's included:</h4>
                <ul className="text-gray-400 text-xs space-y-1">
                  {included.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
            )}

            {/* Excluded */}
            {excluded.length > 0 && (
              <div className="mb-4">
                <h4 className="text-red-500 font-bold text-sm mb-2">✕ What's excluded:</h4>
                <ul className="text-gray-400 text-xs space-y-1">
                  {excluded.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
            )}

            {/* Parts */}
            {partsUsed.length > 0 && (
              <div className="mb-6">
                <h4 className="text-blue-500 font-bold text-sm mb-2">⚙ Parts used:</h4>
                <p className="text-gray-400 text-xs">{partsUsed.join(', ')}</p>
              </div>
            )}

            <button onClick={() => setIsModalOpen(false)} className="w-full bg-white text-black py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}