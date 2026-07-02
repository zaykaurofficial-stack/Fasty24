import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-fasty-black border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      {/* Subtle background glow at the top of the footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-fasty-yellow/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div>
           <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
  <span className="bg-fasty-yellow text-fasty-black font-bold text-lg px-4 py-1.5 rounded-lg shadow-sm">
    Fasty
  </span>
  <span className="font-bold text-fasty-yellow text-lg tracking-tight">24</span>
</Link> 
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              India's fastest home services platform. Verified professionals at your doorstep in 15–20 minutes.
            </p>
            <div className="flex gap-3">
              {['X', 'In', 'Fb', 'Yt'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-fasty-yellow hover:border-fasty-yellow/50 hover:bg-fasty-yellow/10 transition-all duration-300 hover:-translate-y-1">
                  <span className="text-xs font-bold">{social}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Popular Services</h4>
            <ul className="space-y-4">
              {['AC Repair & Services', 'RO Repair & Servicing', 'Instant Maid', 'Fridge Services', 'Bathroom Cleaning'].map((link) => (
                <li key={link}>
                  <Link href="/categories" className="text-gray-400 hover:text-fasty-yellow text-sm transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-fasty-yellow/30 group-hover:bg-fasty-yellow group-hover:scale-150 transition-all" /> 
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
            <ul className="space-y-4">
              {['All Services', 'Become a Partner', 'Careers', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-gray-400 hover:text-fasty-yellow text-sm transition-colors duration-200">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Contact</h4>
            <div className="space-y-5 text-sm">
              <div>
                <p className="text-fasty-yellow font-bold mb-1 uppercase tracking-wider text-xs">Phone</p>
                <a href="tel:+919999999999" className="text-gray-300 hover:text-white transition-colors text-base">+91 99999 99999</a>
              </div>
              <div>
                <p className="text-fasty-yellow font-bold mb-1 uppercase tracking-wider text-xs">Email</p>
                <a href="mailto:hello@fasty24.com" className="text-gray-300 hover:text-white transition-colors text-base">hello@fasty24.com</a>
              </div>
              <div>
                <p className="text-fasty-yellow font-bold mb-1 uppercase tracking-wider text-xs">Cities</p>
                <p className="text-gray-400 leading-relaxed">Delhi NCR • Mumbai • Bangalore • Hyderabad • Pune</p>
              </div>
            </div>
          </div>

        </div>

        {/* Trust Banner inside Footer */}
        <div className="relative bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl p-6 text-center mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80')] bg-cover bg-center opacity-10 mix-blend-luminosity" />
          <p className="relative text-gray-300 font-medium text-sm md:text-base z-10">
            <span className="text-white font-bold">500+ verified professionals</span> • Background checked • OTP-secured jobs
          </p>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Fasty-24. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-fasty-yellow text-sm font-bold bg-fasty-yellow/10 px-4 py-2 rounded-full border border-fasty-yellow/20 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
            <span className="animate-pulse">⚡</span> 15-20 min service guarantee
          </div>
        </div>
      </div>
    </footer>
  );
}