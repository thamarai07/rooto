import Image from "next/image";
import Link from "next/link";
import { getFestivals, type Festival } from "@/lib/festivals.api";

// Homepage festival banner.
// Now CMS-driven: shows the first active festival that has a banner image and
// links to its page. Falls back to the original static banner if no festival
// (or no banner image) is configured — so the homepage never looks empty.

export default async function MainBanner() {
  let festival: Festival | null = null;
  try {
    const festivals = await getFestivals();
    festival =
      festivals.find((f) => f.banner_image) || festivals[0] || null;
  } catch {
    festival = null;
  }

  // ── Dynamic festival banner ───────────────────────────────────────────────
  if (festival && festival.banner_image) {
    const desktop = festival.banner_image;
    const mobile = festival.mobile_image || festival.banner_image;
    return (
      <Link
        href={`/festival/${festival.slug}`}
        className="block w-full overflow-hidden rounded-xl"
      >
        <picture>
          <source media="(max-width: 767px)" srcSet={mobile} />
          <img
            src={desktop}
            alt={festival.name}
            className="h-auto w-full object-cover"
          />
        </picture>
      </Link>
    );
  }

  // ── Fallback: original static banner (unchanged) ──────────────────────────
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
