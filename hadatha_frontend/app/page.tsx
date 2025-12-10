import LaunchAppBtn from "@/components/miscellneous/LaunchAppBtn";
import Logo from "@/components/miscellneous/Logo";
import { Button } from "@/components/ui/button";


export default function Home() {
  return (
    <div className="relative bg-black min-h-screen flex flex-col items-center justify-center text-center p-4 overflow-hidden">

      <video
        src="/videos/landing-bg.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center gap-8">
        <Logo />
        <h1 className="text-6xl font-bold tracking-tighter text-white sm:text-7xl">
          Events, Reimagined.
        </h1>
        <h4 className="text-xl text-gray-300 max-w-2xl mx-auto">
          Hadatha is the next-gen platform for discovering and hosting events. Seamlessly mint tickets as NFTs on the Sui blockchain
        </h4>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button className="rounded-full px-12! py-5! min-h-[50px] cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 active:scale-95 hover:scale-x-105 transition-all duration-300">
            Watch Demo
          </Button>
          <LaunchAppBtn />
        </div>
      </div>

    </div>

  );
}
