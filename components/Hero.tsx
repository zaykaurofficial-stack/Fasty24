import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full pt-24 pb-32 overflow-hidden bg-fasty-black">
      {/* Subtle Background Glow for that premium feel */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-fasty-yellow/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Copy and Call to Actions */}
          <div className="max-w-2xl">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm shadow-lg">
              <span className="w-2 h-2 rounded-full bg-fasty-yellow animate-pulse" />
              <span className="text-xs font-medium text-gray-300">Live in Delhi NCR • 15–20 min guarantee</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
              Premium home <br />
              services, <br />
              <span className="text-fasty-yellow drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">delivered fast.</span>
            </h1>
            
            <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
              India's fastest home services platform. AC repair, RO servicing, instant maid, appliance repair & deep cleaning — verified pros at your door in minutes, not hours.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/categories" className="bg-fasty-yellow text-fasty-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all duration-300 shadow-[0_4px_20px_rgba(255,215,0,0.25)] hover:shadow-[0_4px_30px_rgba(255,215,0,0.4)] hover:-translate-y-1">
                Explore Services
              </Link>
              <Link href="/login" className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:border-white/40 hover:bg-white/5 transition-all duration-300">
                Sign in / Register
              </Link>
            </div>

            {/* Social Proof / Ratings */}
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-10 h-10 rounded-full border-2 border-fasty-black object-cover" />
                <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-10 h-10 rounded-full border-2 border-fasty-black object-cover" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-10 h-10 rounded-full border-2 border-fasty-black object-cover" />
              </div>
              <div className="text-sm">
                <span className="text-white font-bold text-base tracking-wide">4.8★</span>
                <span className="text-gray-400"> from 50,000+ happy homes</span>
              </div>
            </div>
          </div>

          {/* Right Side: Abstract Floating Service Cards (Replaces standard images for a modern look) */}
          <div className="hidden lg:block relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-fasty-yellow/20 to-transparent rounded-3xl blur-3xl transform rotate-6" />
             
             <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                    {/* Mini Card 1 */}
                    <div className="bg-fasty-black/80 rounded-2xl p-5 border border-white/5 hover:border-fasty-yellow/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg">
                        <div className="text-3xl mb-3">❄️</div>
                        <div className="text-white font-bold">AC Repair</div>
                        <div className="text-fasty-yellow text-sm font-medium mt-1">From ₹499</div>
                    </div>
                    {/* Mini Card 2 (Offset) */}
                    <div className="bg-fasty-black/80 rounded-2xl p-5 border border-white/5 hover:border-fasty-yellow/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg translate-y-6">
                        <div className="text-3xl mb-3">💧</div>
                        <div className="text-white font-bold">RO Service</div>
                        <div className="text-fasty-yellow text-sm font-medium mt-1">From ₹399</div>
                    </div>
                    {/* Mini Card 3 */}
                    <div className="bg-fasty-black/80 rounded-2xl p-5 border border-white/5 hover:border-fasty-yellow/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg">
                        <div className="text-3xl mb-3">🧹</div>
                        <div className="text-white font-bold">Instant Maid</div>
                        <div className="text-fasty-yellow text-sm font-medium mt-1">From ₹299</div>
                    </div>
                    {/* Mini Card 4 (Offset) */}
                    <div className="bg-fasty-black/80 rounded-2xl p-5 border border-white/5 hover:border-fasty-yellow/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg translate-y-6">
                        <div className="text-3xl mb-3">🧊</div>
                        <div className="text-white font-bold">Fridge Repair</div>
                        <div className="text-fasty-yellow text-sm font-medium mt-1">From ₹449</div>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}