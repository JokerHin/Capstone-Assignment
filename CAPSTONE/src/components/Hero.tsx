const Hero = () => {
  return (
    <div
      className="items-center h-[900px] md:[700px] bg-primary flex flex-col md:flex-row justify-center w-full transition-all duration-500 ease-in-out "
      style={{
        background:
          "linear-gradient(180deg, #000000, #1a0e04, #2a1608, #3b1d0b, #4d240d, #5f2b0e, #72320e, #86390d)",
      }}
    >
      <div className="w-full md:w-[40%] h-auto items-center transition-all duration-500 animate-slide-in-left sm:mt-10">
        <p className="text-[30pt] md:text-[50pt] w-full transition-all duration-500 animate-slide-in-left bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white md:text-4xl lg:text-7xl font-sans relative font-bold tracking-tight">
          The Codyssey
        </p>
        <p className="text-[#ff8800] font-bold text-[20pt] md:text-[35pt] w-full text-left transition-all duration-500 animate-slide-in-left">
          The Journey Through the Object Realm
        </p>
        <p className="text-white transition-all duration-500 animate-slide-in-left">
          Make Your Game More Fun and Engaging with Our Game Development
          Platform.
        </p>
        <div className="w-full text-center flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-10 transition-all duration-500 animate-slide-in-left">
          <button className="text-white rounded-2xl border border-white p-4 w-full md:w-[30%] hover:text-black hover:bg-white font-bold cursor-pointer transition active:scale-80 duration-500 animate-slide-in-left">
            Get Start
          </button>
          <button className="text-[#ff8800] border border-white p-4 bg-white rounded-2xl w-full md:w-[30%] hover:bg-[#ff8800] hover:text-white font-bold cursor-pointer transition active:scale-80 duration-500 animate-slide-in-left">
            Join Us
          </button>
        </div>
      </div>
      <div className="w-full md:w-[40%] items-center flex justify-center transition-all duration-500 animate-slide-in-right mt-10 md:mt-0">
        <img
          className="w-[60%] md:w-[80%] h-auto transition-all duration-500 animate-slideDown"
          src="https://www.pngall.com/wp-content/uploads/15/Fall-Guy-Transparent.png"
          alt="image"
        />
      </div>
    </div>
  );
};

export default Hero;
