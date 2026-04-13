export default function HeroBanner() {
  return (
    <div className="mb-20 bg-white flex flex-col md:flex-row overflow-hidden border border-zinc-100">
      <div className="flex-1 flex flex-col justify-center p-10 md:p-16 lg:p-24 order-2 md:order-1">
        <h1 className="font-sans text-4xl md:text-5xl lg:text-[4rem] font-semibold text-black leading-[1.05] tracking-tight">
          Абсолютный<br />минимум.
        </h1>
        <p className="mt-6 text-zinc-500 max-w-sm text-sm md:text-base leading-relaxed">
          Чистые линии, нейтральные оттенки и премиальные материалы. Откройте для себя эстетику повседневности.
        </p>
        <div className="mt-10">
          <a 
            href="#catalog" 
            className="inline-flex bg-black text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors rounded"
          >
            В каталог
          </a>
        </div>
      </div>
      <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative order-1 md:order-2 bg-[#f9f9f9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1434389678243-7ef26fce43ee?q=80&w=2000&auto=format&fit=crop" 
          alt="Minimalist fashion"
          className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply opacity-90"
        />
      </div>
    </div>
  )
}