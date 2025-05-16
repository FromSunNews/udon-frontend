import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
// import { Button } from '../common/button';

export function MainLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  // Don't render layout components on landing page
  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#181818] overflow-visible [&_:root]:dark">
      <Header />
      {/* Glowing effect at the top */}
      <div className="absolute w-full h-full -mt-[135px] z-0">
        <div className="absolute w-full h-[250px] top-0 left-1/2 -translate-x-1/2 bg-[#1fc3e8] rounded-[548.5px/123.1px] blur-[48.75px]">
          <div className="relative w-full h-52 bg-[#1f6ce8] rounded-[508.19px/103.8px]">
            <div className="relative w-full h-[150px] top-6 bg-white rounded-[430.85px/67px]" />
          </div>
        </div>

        {/* Background frame image */}
        <div className="absolute w-full h-screen top-[135px] left-0 bg-repeat-y">
          {/* This would be the frame-250-1-1.svg */}
          <Image
            className="w-full h-full object-cover"
            alt="Frame background"
            src="/images/supply/bg.gif"
            fill
          />
        </div>

        {/* Vector image overlay */}
        {/* <div className=" z-10"> */}
        {/* This would be the vector.svg */}
        <img
          className="absolute w-full h-auto top-[321px] left-1/2 -translate-x-1/2"
          alt="Vector graphic"
          src="/images/supply/vector-overlay.png"
        />
        {/* </div> */}
      </div>
      <main className="h-min-screen z-10">{children}</main>
      <Footer />
    </div>
  );
}
