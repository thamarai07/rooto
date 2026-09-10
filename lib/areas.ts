// ---------------------------------------------------------------------------
// Rooto delivery areas — the single source of truth for /areas/* pages.
//
// Every area listed here is a locality Rooto genuinely delivers fresh fruit to
// today. Content is hand-written per area (real roads, landmarks, neighbouring
// localities) — do NOT auto-generate thin duplicates. To add a new area, add a
// real entry with its own `blurb`, `localities`, `nearby` and `faqs`.
// ---------------------------------------------------------------------------

export type AreaFaq = { q: string; a: string }

export type Area = {
  slug: string
  name: string
  /** Postal code(s) covered. */
  pincodes: string[]
  /** 1–2 unique sentences about delivering fruit to this locality. */
  blurb: string
  /** Real sub-localities / roads / landmarks Rooto covers within the area. */
  localities: string[]
  /** Slugs of adjacent areas (for internal linking). */
  nearby: string[]
  /** Area-specific FAQs (used for the FAQ section + FAQPage schema). */
  faqs: AreaFaq[]
  /** primary = one of the core launch areas; nearby = adjacent locality we also cover. */
  tier: 'primary' | 'nearby'
}

export const AREAS: Area[] = [
  {
    slug: 'medavakkam',
    name: 'Medavakkam',
    pincodes: ['600100'],
    tier: 'primary',
    blurb:
      'Medavakkam is home base for Rooto — most orders here reach the doorstep within about an hour. We cover the full stretch from Medavakkam Koot Road to the 100 Feet Road and the residential pockets around Sabari Nagar and Cheran Nagar.',
    localities: [
      'Medavakkam Main Road', 'Medavakkam Koot Road', '100 Feet Road',
      'Sabari Nagar', 'Cheran Nagar', 'Jalladianpet side', 'Nanmangalam border',
    ],
    nearby: ['jalladianpet', 'nanmangalam', 'kovilambakkam', 'pallikaranai', 'perumbakkam', 'santhoshapuram'],
    faqs: [
      {
        q: 'How fast is fruit delivery in Medavakkam?',
        a: 'Medavakkam is our core zone, so most orders are delivered within about an hour. Orders placed late at night are delivered the same day.',
      },
      {
        q: 'Do you deliver near Medavakkam Koot Road and 100 Feet Road?',
        a: 'Yes. We cover Medavakkam Koot Road, the 100 Feet Road stretch and the surrounding nagars including Sabari Nagar and Cheran Nagar.',
      },
    ],
  },
  {
    slug: 'pallikaranai',
    name: 'Pallikaranai',
    pincodes: ['600100'],
    tier: 'primary',
    blurb:
      'We deliver fresh fruit across Pallikaranai, from the 200 Feet Radial Road down to Kamakoti Nagar and the roads bordering the Pallikaranai marsh. It is right next to our Medavakkam base, so delivery is quick.',
    localities: [
      '200 Feet Radial Road', 'Velachery–Pallikaranai Main Road', 'Kamakoti Nagar',
      'Vijayanagaram', 'Torur', 'Nemilichery side',
    ],
    nearby: ['velachery', 'medavakkam', 'perumbakkam', 'kovilambakkam', 'keelkattalai'],
    faqs: [
      {
        q: 'Which parts of Pallikaranai does Rooto deliver to?',
        a: 'We cover the 200 Feet Radial Road, the Velachery–Pallikaranai Main Road, Kamakoti Nagar, Vijayanagaram and the residential streets around the marsh.',
      },
    ],
  },
  {
    slug: 'tambaram',
    name: 'Tambaram',
    pincodes: ['600045', '600059', '600047'],
    tier: 'primary',
    blurb:
      'Rooto delivers fresh fruit across East Tambaram, West Tambaram and Tambaram Sanatorium — including the roads around the railway station, GST Road and Irumbuliyur.',
    localities: [
      'East Tambaram', 'West Tambaram', 'Tambaram Sanatorium', 'GST Road',
      'Irumbuliyur', 'Railway Station Road',
    ],
    nearby: ['chromepet', 'selaiyur', 'camp-road', 'sembakkam', 'bharath-college'],
    faqs: [
      {
        q: 'Do you deliver to both East and West Tambaram?',
        a: 'Yes — we deliver to East Tambaram, West Tambaram and Tambaram Sanatorium, including the areas near the railway station and along GST Road.',
      },
    ],
  },
  {
    slug: 'camp-road',
    name: 'Camp Road (Selaiyur)',
    pincodes: ['600073'],
    tier: 'primary',
    blurb:
      'We deliver along the full Camp Road stretch that links Tambaram to Medavakkam, covering the Rajakilpakkam and Sembakkam lake ends and the colonies on either side.',
    localities: [
      'Camp Road junction', 'Rajakilpakkam', 'Sembakkam lake side',
      'Agharam Road', 'Hasthinapuram border',
    ],
    nearby: ['selaiyur', 'rajakilpakkam', 'sembakkam', 'tambaram', 'medavakkam', 'santhoshapuram'],
    faqs: [
      {
        q: 'Does Rooto deliver along Camp Road in Selaiyur?',
        a: 'Yes. We deliver across the whole Camp Road stretch from the Tambaram end to Rajakilpakkam and Sembakkam, including the residential colonies on both sides.',
      },
    ],
  },
  {
    slug: 'bharath-college',
    name: 'Bharath College Area',
    pincodes: ['600073'],
    tier: 'primary',
    blurb:
      'Rooto delivers fresh fruit to the neighbourhood around Bharath Institute on Agharam Road, Selaiyur — convenient for students, hostels and families near the campus.',
    localities: [
      'Agharam Road', 'Bharath Institute campus surroundings', 'Selaiyur',
      'Hasthinapuram side', 'Camp Road end',
    ],
    nearby: ['selaiyur', 'chromepet', 'tambaram', 'camp-road'],
    faqs: [
      {
        q: 'Do you deliver fruit near Bharath Institute / Bharath College?',
        a: 'Yes, we deliver to the area around Bharath Institute on Agharam Road, Selaiyur, including nearby hostels and apartments.',
      },
    ],
  },
  {
    slug: 'kovilambakkam',
    name: 'Kovilambakkam',
    pincodes: ['600117', '600129'],
    tier: 'primary',
    blurb:
      'Kovilambakkam sits between Medavakkam and Keelkattalai, and Rooto covers the Main Road, Narayanapuram and the residential nagars on the Pallikaranai side.',
    localities: [
      'Kovilambakkam Main Road', 'Narayanapuram', 'Ram Nagar', 'MMDA Colony',
      'Medavakkam border',
    ],
    nearby: ['medavakkam', 'keelkattalai', 'pallikaranai', 'madipakkam', 'nanmangalam'],
    faqs: [
      {
        q: 'Is fruit delivery available in Kovilambakkam?',
        a: 'Yes. We deliver across Kovilambakkam Main Road, Narayanapuram and the surrounding streets, usually within an hour given how close it is to our Medavakkam base.',
      },
    ],
  },
  {
    slug: 'santhoshapuram',
    name: 'Santhoshapuram',
    pincodes: ['600073'],
    tier: 'primary',
    blurb:
      'Rooto delivers fresh fruit across Santhoshapuram along the Medavakkam–Mambakkam Main Road, including the areas near Medavakkam Koot Road.',
    localities: [
      'Medavakkam–Mambakkam Main Road', 'Santhoshapuram junction',
      'Medavakkam Koot Road side', 'Ponniamman Nagar',
    ],
    nearby: ['medavakkam', 'camp-road', 'sembakkam', 'rajakilpakkam'],
    faqs: [
      {
        q: 'Does Rooto deliver to Santhoshapuram?',
        a: 'Yes, we deliver along the Medavakkam–Mambakkam Main Road through Santhoshapuram and the streets around Medavakkam Koot Road.',
      },
    ],
  },
  {
    slug: 'selaiyur',
    name: 'Selaiyur',
    pincodes: ['600073'],
    tier: 'primary',
    blurb:
      'We deliver fresh fruit across Selaiyur — around Selaiyur lake, the Camp Road stretch and the Hasthinapuram border with East Tambaram.',
    localities: [
      'Selaiyur lake area', 'Camp Road', 'Hasthinapuram', 'East Tambaram border',
      'Agharam Road',
    ],
    nearby: ['tambaram', 'camp-road', 'chromepet', 'bharath-college', 'sembakkam'],
    faqs: [
      {
        q: 'Which parts of Selaiyur do you cover?',
        a: 'We cover the Selaiyur lake area, Camp Road, Hasthinapuram and the streets bordering East Tambaram.',
      },
    ],
  },
  {
    slug: 'chromepet',
    name: 'Chromepet',
    pincodes: ['600044'],
    tier: 'primary',
    blurb:
      'Rooto delivers fresh fruit across Chromepet — along GST Road, near the railway station and MIT, and through Hasthinapuram and Radha Nagar.',
    localities: [
      'GST Road', 'Chromepet railway station area', 'MIT (Madras Institute of Technology) side',
      'Hasthinapuram', 'Radha Nagar', 'Bharathi Salai',
    ],
    nearby: ['tambaram', 'selaiyur', 'nanganallur', 'adambakkam', 'pallavaram'],
    faqs: [
      {
        q: 'Do you deliver near Chromepet railway station and MIT?',
        a: 'Yes. We deliver along GST Road, around the Chromepet railway station, the MIT area, Hasthinapuram and Radha Nagar.',
      },
    ],
  },
  {
    slug: 'keelkattalai',
    name: 'Keelkattalai',
    pincodes: ['600117'],
    tier: 'primary',
    blurb:
      'Keelkattalai is a short hop from our Medavakkam base. We deliver around Keelkattalai lake, the Bypass Road and the Rajaji Nagar and Sunnambu Kolathur pockets.',
    localities: [
      'Keelkattalai lake', 'Medavakkam Bypass Road', 'Rajaji Nagar',
      'Sunnambu Kolathur', 'Bhaghyalakshmi Colony',
    ],
    nearby: ['madipakkam', 'medavakkam', 'kovilambakkam', 'pallikaranai'],
    faqs: [
      {
        q: 'Is Rooto fruit delivery available in Keelkattalai?',
        a: 'Yes, we deliver across Keelkattalai including the lake area, the Bypass Road, Rajaji Nagar and Sunnambu Kolathur.',
      },
    ],
  },
  {
    slug: 'madipakkam',
    name: 'Madipakkam',
    pincodes: ['600091'],
    tier: 'primary',
    blurb:
      'Rooto delivers fresh fruit across Madipakkam — along the Main Road, through Ullagaram and Puzhuthivakkam and the colonies off the 100 Feet Bypass Road.',
    localities: [
      'Madipakkam Main Road', 'Ullagaram', 'Puzhuthivakkam', 'Ram Nagar South',
      '100 Feet Bypass Road', 'Bhagyalakshmi Colony',
    ],
    nearby: ['keelkattalai', 'kovilambakkam', 'velachery', 'nanganallur', 'adambakkam'],
    faqs: [
      {
        q: 'Which areas of Madipakkam does Rooto deliver to?',
        a: 'We deliver along Madipakkam Main Road, Ullagaram, Puzhuthivakkam, Ram Nagar South and the streets off the 100 Feet Bypass Road.',
      },
    ],
  },
  {
    slug: 'velachery',
    name: 'Velachery',
    pincodes: ['600042'],
    tier: 'primary',
    blurb:
      'We deliver fresh fruit across Velachery — around the Main Road and bus terminus, the 100 Feet Road, and the residential areas towards Taramani and Guindy.',
    localities: [
      'Velachery Main Road', 'Vijayanagar bus terminus', '100 Feet Road',
      'Taramani side', 'Guindy border', 'Vijayanagaram',
    ],
    nearby: ['pallikaranai', 'madipakkam', 'adambakkam'],
    faqs: [
      {
        q: 'Do you deliver fruit in Velachery?',
        a: 'Yes. We deliver across Velachery including the Main Road, the bus terminus area, the 100 Feet Road and the streets towards Taramani.',
      },
    ],
  },

  // ── Nearby localities we also deliver to ────────────────────────────────
  {
    slug: 'perumbakkam',
    name: 'Perumbakkam',
    pincodes: ['600100'],
    tier: 'nearby',
    blurb:
      'Rooto delivers fresh fruit across Perumbakkam, including the TNHB blocks, the apartments along Perumbakkam Main Road and the stretch towards Global Hospital.',
    localities: ['Perumbakkam Main Road', 'TNHB blocks', 'Global Hospital side', 'Sithalapakkam border'],
    nearby: ['medavakkam', 'pallikaranai', 'sholinganallur'],
    faqs: [
      {
        q: 'Does Rooto deliver to the Perumbakkam apartments and TNHB blocks?',
        a: 'Yes, we deliver to the TNHB blocks and the apartment complexes along Perumbakkam Main Road.',
      },
    ],
  },
  {
    slug: 'sholinganallur',
    name: 'Sholinganallur',
    pincodes: ['600119'],
    tier: 'nearby',
    blurb:
      'We deliver fresh fruit to Sholinganallur along the OMR stretch and the roads connecting to Perumbakkam and Pallikaranai.',
    localities: ['OMR (Rajiv Gandhi Salai)', 'ELCOT SEZ side', 'Sholinganallur junction', 'Karapakkam border'],
    nearby: ['perumbakkam', 'pallikaranai'],
    faqs: [
      {
        q: 'Is fruit delivery available near Sholinganallur on OMR?',
        a: 'Yes, we deliver along the OMR stretch in Sholinganallur and the connecting roads towards Perumbakkam and Pallikaranai.',
      },
    ],
  },
  {
    slug: 'nanmangalam',
    name: 'Nanmangalam',
    pincodes: ['600129'],
    tier: 'nearby',
    blurb:
      'Rooto delivers fresh fruit to Nanmangalam, covering the residential streets near the reserve forest and the Medavakkam and Kovilambakkam borders.',
    localities: ['Nanmangalam Main Road', 'Reserve forest side', 'Ottiyambakkam Road'],
    nearby: ['medavakkam', 'kovilambakkam'],
    faqs: [
      {
        q: 'Does Rooto deliver to Nanmangalam?',
        a: 'Yes, we deliver across Nanmangalam including the streets near the reserve forest and the Medavakkam side.',
      },
    ],
  },
  {
    slug: 'rajakilpakkam',
    name: 'Rajakilpakkam',
    pincodes: ['600073'],
    tier: 'nearby',
    blurb:
      'We deliver fresh fruit across Rajakilpakkam along Camp Road and the roads towards Sembakkam and Santhoshapuram.',
    localities: ['Camp Road', 'Rajakilpakkam junction', 'Sembakkam lake side'],
    nearby: ['camp-road', 'sembakkam', 'santhoshapuram', 'medavakkam'],
    faqs: [
      {
        q: 'Do you deliver fruit in Rajakilpakkam?',
        a: 'Yes, we deliver along Camp Road through Rajakilpakkam and the surrounding residential streets.',
      },
    ],
  },
  {
    slug: 'sembakkam',
    name: 'Sembakkam',
    pincodes: ['600073'],
    tier: 'nearby',
    blurb:
      'Rooto delivers fresh fruit across Sembakkam, around the lake and the colonies between Camp Road and GST Road.',
    localities: ['Sembakkam lake', 'Camp Road side', 'GST Road border', 'MMDA Colony'],
    nearby: ['camp-road', 'selaiyur', 'rajakilpakkam', 'tambaram'],
    faqs: [
      {
        q: 'Is Rooto delivery available in Sembakkam?',
        a: 'Yes, we deliver across Sembakkam including the lake area and the colonies towards Camp Road and GST Road.',
      },
    ],
  },
  {
    slug: 'jalladianpet',
    name: 'Jalladianpet',
    pincodes: ['600100'],
    tier: 'nearby',
    blurb:
      'We deliver fresh fruit to Jalladianpet along Medavakkam Main Road and the streets towards Pallikaranai — one of the quickest routes from our base.',
    localities: ['Medavakkam Main Road', 'Jalladianpet junction', 'Rajeswari Nagar'],
    nearby: ['medavakkam', 'pallikaranai'],
    faqs: [
      {
        q: 'Does Rooto deliver to Jalladianpet?',
        a: 'Yes, Jalladianpet is on Medavakkam Main Road right next to our base, so orders usually arrive within an hour.',
      },
    ],
  },
  {
    slug: 'adambakkam',
    name: 'Adambakkam',
    pincodes: ['600088'],
    tier: 'nearby',
    blurb:
      'Rooto delivers fresh fruit across Adambakkam, covering the areas around Jawaharlal Nehru Road and the borders with Nanganallur and Velachery.',
    localities: ['Jawaharlal Nehru Road', 'Nanganallur border', 'Velachery border', 'Ram Nagar'],
    nearby: ['nanganallur', 'madipakkam', 'velachery', 'chromepet'],
    faqs: [
      {
        q: 'Do you deliver fruit in Adambakkam?',
        a: 'Yes, we deliver across Adambakkam including the Jawaharlal Nehru Road area and the streets bordering Nanganallur and Velachery.',
      },
    ],
  },
  {
    slug: 'nanganallur',
    name: 'Nanganallur',
    pincodes: ['600061'],
    tier: 'nearby',
    blurb:
      'We deliver fresh fruit across Nanganallur, around the main bazaar streets and the colonies towards Adambakkam and Palavanthangal.',
    localities: ['Nanganallur main streets', '13th Main Road', 'Palavanthangal side', 'Adambakkam border'],
    nearby: ['adambakkam', 'madipakkam', 'chromepet'],
    faqs: [
      {
        q: 'Is Rooto fruit delivery available in Nanganallur?',
        a: 'Yes, we deliver across Nanganallur including the main bazaar area and the streets towards Adambakkam and Palavanthangal.',
      },
    ],
  },
]

export const AREA_SLUGS = AREAS.map((a) => a.slug)

export function getArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug)
}

export function areasBySlugs(slugs: string[]): Area[] {
  return slugs
    .map((s) => AREAS.find((a) => a.slug === s))
    .filter((a): a is Area => Boolean(a))
}

// Shared, factual delivery information (same across areas by design — it is
// business policy, not filler). The unique value per page is the local content.
export const DELIVERY_INFO = {
  hours: 'Open 24 hours, every day',
  speed: 'Most orders in about 1 hour; otherwise same day',
  freeAbove: 500,
  feeBelow: 50,
  cod: true,
}
