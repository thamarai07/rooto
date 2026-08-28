"use client";

import Image from "next/image";
import Link from "next/link";

export default function MainBanner() {
  const images = [
    "/krishna-jayanthi-mobile.png",
    "/krishna-jayanthi-tab.png",
    "/krishna-jayanthi-desk.png",
  ];

  images.forEach((path) => {
    console.log("Checking:", path);

    const img = new window.Image();


    img.src = path;
  });

  return (
    <Link href="/festival/krishna-jayanthi" className="block w-full overflow-hidden rounded-xl">
      <div className="block md:hidden">
        <Image
          src="/krishna-jayanthi-mobile.png"
          alt="Krishna Jayanthi Special Pack"
          width={900}
          height={1000}
          priority
          className="h-auto w-full object-cover"
        />
      </div>

      <div className="hidden md:block lg:hidden">
        <Image
          src="/krishna-jayanthi-tab.png"
          alt="Krishna Jayanthi Special Pack"
          width={1600}
          height={700}
          priority
          className="h-auto w-full object-cover"
        />
      </div>

      <div className="hidden lg:block">
        <Image
          src="/krishna-jayanthi-desk.png"
          alt="Krishna Jayanthi Special Pack"
          width={1920}
          height={450}
          priority
          className="h-auto w-full object-cover"
        />
      </div>
    </Link>
  );
}