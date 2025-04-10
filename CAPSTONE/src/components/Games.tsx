export default function Games() {
  return (
    <div className="flex justify-center items-center flex-col">
      <div className="text-[20pt] md:text-[30pt] text-white font-bold text-center mb-10">
        Games
      </div>
      <div className="w-[90%] md:w-[70%] h-auto grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white items-center">
        <div className="w-[100%] bg-[#11131f] h-[300px] md:h-[300px] hover:shadow-amber-500 hover:shadow-2xl hover:-translate-y-4 hover:duration-75 cursor-pointer rounded-4xl hover:delay-100 hover:inset-shadow-sm hover:inset-shadow-amber-500">
          <img
            src="https://cdn2.unrealengine.com/s05-keyart-1920x1080-logo-1920x1080-8eefea7d608b.png?resize=1&w=1920"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 1
          </p>
        </div>
        <div className="w-[100%] bg-[#11131f] h-[300px] md:h-[300px] hover:shadow-amber-500 hover:shadow-2xl hover:-translate-y-4 hover:duration-75 cursor-pointer rounded-4xl hover:delay-100 hover:inset-shadow-sm hover:inset-shadow-amber-500">
          <img
            src="https://www.ji-cloud.cn/ueditor/php/upload/image/20230414/1681454294321103.jpg"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 2
          </p>
        </div>
        <div className="w-[100%] bg-[#11131f] h-[300px] md:h-[300px] hover:shadow-amber-500 hover:shadow-2xl hover:-translate-y-4 hover:duration-75 cursor-pointer rounded-4xl hover:delay-100 hover:inset-shadow-sm hover:inset-shadow-amber-500">
          <img
            src="https://p.qpic.cn/mwegame/0/c6057c02143ad52ad201fd1c9a0a1540/"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 3
          </p>
        </div>
        <div className="w-[100%] bg-[#11131f] h-[300px] md:h-[300px] hover:shadow-amber-500 hover:shadow-2xl hover:-translate-y-4 hover:duration-75 cursor-pointer rounded-4xl hover:delay-100 hover:inset-shadow-sm hover:inset-shadow-amber-500">
          <img
            src="https://images6.alphacoders.com/125/1250786.jpg"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 4
          </p>
        </div>
        <div className="w-[100%] bg-[#11131f] h-[300px] md:h-[300px] hover:shadow-amber-500 hover:shadow-2xl hover:-translate-y-4 hover:duration-75 cursor-pointer rounded-4xl hover:delay-100 hover:inset-shadow-sm hover:inset-shadow-amber-500">
          <img
            src="https://wallpapers.com/images/hd/fall-guys-fun-skins-l7pnkwqhyrmtivot.jpg"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 5
          </p>
        </div>
        <div className="w-[100%] bg-[#11131f] h-[300px] md:h-[300px] hover:shadow-amber-500 hover:shadow-2xl hover:-translate-y-4 hover:duration-75 cursor-pointer rounded-4xl hover:delay-100 hover:inset-shadow-sm hover:inset-shadow-amber-500">
          <img
            src="https://assets.nintendo.com/image/upload/q_auto/f_auto/ncom/software/switch/70010000042975/937afd0c84319831009b44c93369faf0a2c926a454809f73523df9bfb6cf6233"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 6
          </p>
        </div>
      </div>
      <img
        src="https://i.pinimg.com/originals/e5/b4/0d/e5b40df80fba2da8cace9fb997a3e960.png"
        alt="image"
        className="absolute top-420 right-0 w-[50%] md:w-[30%] md:top-450"
      />
    </div>
  );
}
