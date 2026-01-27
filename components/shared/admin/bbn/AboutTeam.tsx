const AboutTeamSection = () => (
  <section className="w-full max-w-7xl mx-auto mb-20 px-6 lg:px-12">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
      
      {/* Logo Container - Takes up 5 columns on large screens */}
      <div className="lg:col-span-5 flex justify-center lg:justify-end order-2 lg:order-1">
        <div className="relative group w-full max-w-[350px] md:max-w-[450px] lg:max-w-full">
          {/* Decorative Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-pink-600 to-orange-600 opacity-20 blur-3xl rounded-full group-hover:opacity-30 transition duration-1000"></div>
          
          <img 
            src="/images/bbn_logo.jpg" 
            alt="BBN Logo" 
            className="relative w-full aspect-square object-cover rounded-[2rem] shadow-2xl border border-white/10"
          />
        </div>
      </div>

      {/* Text Container - Takes up 7 columns on large screens */}
      <div className="lg:col-span-7 text-center lg:text-left order-1 lg:order-2">
        
        <h1 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tighter mb-8 leading-[1.1] bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 bg-clip-text text-transparent uppercase">
          United by Beauty, <br className="hidden md:block" /> Driven by Purpose
        </h1>
        
        <div className="space-y-8">
          <p className="text-gray-200 text-xl md:text-2xl font-medium leading-tight max-w-2xl mx-auto lg:mx-0">
            BBN is the digital home for the architects of confidence—the makeup artists, 
            hair stylists, and nail tech visionaries who define local excellence.
          </p>
          
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed border-l-4 border-rose-500 pl-6 text-left max-w-2xl mx-auto lg:mx-0">
            We are a movement built to bridge the divide between talent and opportunity. 
            By providing a platform for women-led businesses to showcase their craft, 
            we are turning local skill into economic power. From bustling city centers 
            to the heart of our villages, we empower the individual to uplift the 
            family, and the family to transform the community.
          </p>
        </div>
      </div>
      
    </div>
  </section>
);

export default AboutTeamSection;