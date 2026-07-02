import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-fasty-black overflow-hidden">
      
      {/* Left Side: Brand Image & Social Proof */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-12">
        {/* Main Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80" 
            alt="Happy customers" 
            fill 
            className="object-cover opacity-60"
            priority
          />
          {/* Dark Gradient Overlay to make text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-fasty-black via-fasty-black/60 to-transparent" />
        </div>

        {/* Text Content over the image */}
        <div className="relative z-10 max-w-lg mb-8">
          <div className="mb-8">
           <Link href="/" className="flex items-center gap-2 mb-8 group">
  <span className="bg-fasty-yellow text-fasty-black font-bold text-lg px-4 py-1.5 rounded-lg shadow-sm">
    Fasty
  </span>
  <span className="font-bold text-fasty-yellow text-lg tracking-tight">24</span>
</Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Join 50,000+ <br /> happy homes
          </h1>
          <p className="text-lg text-gray-300 font-medium">
            Book trusted professionals in minutes. OTP-secured, transparent pricing, and absolute peace of mind.
          </p>
        </div>
      </div>

      {/* Right Side: Login/OTP Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-fasty-yellow/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="bg-fasty-yellow text-fasty-black font-extrabold text-2xl px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                Fasty
              </span>
              <span className="font-bold text-fasty-yellow text-2xl tracking-tight">24</span>
            </Link>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400 font-medium">Sign in with your mobile number</p>
          </div>

          {/* Glassmorphism Form Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
            <form className="space-y-6">
              
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-medium text-lg">🇮🇳</span>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full pl-12 pr-4 py-4 bg-fasty-black/50 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-fasty-yellow/50 focus:ring-1 focus:ring-fasty-yellow/50 transition-all placeholder:text-gray-500"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full bg-fasty-yellow text-fasty-black font-extrabold text-lg py-4 rounded-xl shadow-[0_4px_20px_rgba(255,215,0,0.2)] hover:shadow-[0_4px_30px_rgba(255,215,0,0.4)] hover:-translate-y-1 hover:bg-yellow-400 transition-all duration-300"
              >
                Continue with OTP
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                By continuing, you agree to Fasty-24's{' '}
                <a href="#" className="text-fasty-yellow hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-fasty-yellow hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>

          {/* Back Navigation */}
          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-fasty-yellow font-medium transition-colors group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}