/**
 * The public data the server-rendered pages are built from.
 *
 * Two pages depend on this: the price list at `/tariff`, whose whole reason for
 * existing is the query «قیمت روز ضایعات», and the front page, whose argument is
 * today's rates. Both need the numbers in the *HTML*, not fetched afterwards —
 * a crawler that receives an empty shell has nothing to rank, and a visitor on
 * a slow connection would watch the one thing they came for arrive last.
 *
 * Both endpoints are public by design. `DOMAIN_API` is the same variable the
 * client-side rewrite uses, so this needs no configuration of its own.
 */

export interface PublicCity {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  /**
   * Whether the service actually runs here. A city that exists in the panel but
   * has not opened yet is still worth showing — somebody in ملایر who lands on
   * the price list should learn that their city is on the list and not yet
   * running, rather than not find it at all — but it must never be presented
   * as available.
   */
  isActive: boolean;
  /** How many prices this city has published; zero is a real, sayable state. */
  materialCount: number;
  /** Where it actually is, for the coverage map. */
  lat: number;
  lng: number;
  /**
   * The service modules this municipality has switched on, as keys into the
   * catalogue. A city that has not opened yet may still carry keys — its panel
   * is configured before its citizens arrive — so the pages must read this
   * together with `isActive` and never on its own.
   */
  services: string[];
  /**
   * What the municipality itself has written for its citizens — shown on the
   * city's own page, above anything the platform says about it.
   */
  announcement?: string;
}

/**
 * One entry of خدمات شهرشهر, exactly as the API defines it.
 *
 * The catalogue is not duplicated here: which services exist, what each is
 * called and what it says are the platform's answer, and a copy in the front
 * end is a copy that goes stale the day a module is added. The only thing this
 * side adds is the drawing of the icon each `icon` names.
 */
export interface PublicService {
  key: string;
  title: string;
  /** A line, for a card. */
  short: string;
  /** A sentence, for somebody deciding whether it is what they need. */
  description: string;
  icon: string;
  color: string;
  /** Where a citizen starts using it, once they are signed in. */
  href: string;
  /** Usable without an account — today only the cemetery register. */
  isPublic: boolean;
}

export interface PublicMaterial {
  _id: string;
  title: string;
  pricePerUnit: number;
  unit: string;
  category: string;
  /** Percentage move since the previous price the city published. */
  change: number;
  city?: string;
}

/** A city with its own price list, for the front page's board. */
export interface BoardCity extends PublicCity {
  materials: PublicMaterial[];
}

const API = process.env.DOMAIN_API || 'http://pasmand-api:3008';

/**
 * Half an hour of cache.
 *
 * A tariff is edited by an operator a few times a month, so per-request fetches
 * would buy nothing; but «نرخ امروز» has to mean today, so it cannot be baked
 * into the image at build time either. Both pages are `force-dynamic` and share
 * this cache entry, which makes the whole site cost two API calls per half hour.
 */
const REVALIDATE = 1800;

async function get<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API}${path}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    // These pages must render whatever happens: an API that is restarting is
    // not a reason to serve nothing at the most important URLs on the domain.
    console.error(`public data ${path} failed:`, (error as Error).message);
    return null;
  }
}

/**
 * The one call both halves of the city question come from.
 *
 * `/api/v1/cities` answers with the cities *and* the service catalogue, so the
 * coverage map and «خدمات این شهر» are built from a single response — and,
 * because `get()` is cached per path, from a single fetch however many
 * components ask.
 */
const getCityPayload = () =>
  get<{ cities: any[]; services?: any[] }>('/api/v1/cities?includeInactive=true');

/**
 * خدمات شهرشهر — the catalogue, in catalogue order.
 *
 * Empty is a state the pages must survive: an API that is restarting takes the
 * services section off the front page and leaves the rest of it standing.
 */
export async function getServices(): Promise<PublicService[]> {
  const payload = await getCityPayload();

  return (payload?.services || [])
    .map((service) => ({
      key: String(service?.key || ''),
      title: String(service?.title || ''),
      short: String(service?.short || ''),
      description: String(service?.description || ''),
      icon: String(service?.icon || ''),
      color: String(service?.color || '#12805c'),
      href: String(service?.href || '/login'),
      isPublic: service?.isPublic === true,
    }))
    .filter((service) => service.key && service.title);
}

/**
 * Every city the panel knows, running first.
 *
 * Not only the active ones: the public price list offers a choice of city, and
 * that choice is only honest if it includes the cities that are coming — each
 * labelled as such by `isActive` and `materialCount`, which the pages use to
 * say «به‌زودی» rather than to hide them.
 */
export async function getCities(): Promise<PublicCity[]> {
  const [payload, materials] = await Promise.all([
    // Including the cities that have not opened yet: the public price pages
    // list them as «به‌زودی», which is the honest answer to somebody in ملایر
    // looking for their city. The app's own picker asks without this flag and
    // still sees only the ones that are running.
    getCityPayload(),
    getMaterials(),
  ]);

  return (payload?.cities || [])
    .map((c) => {
      const id = String(c._id);
      return {
        _id: id,
        name: String(c.name || ''),
        slug: String(c.slug || ''),
        icon: String(c.icon || ''),
        isActive: c?.isActive !== false,
        materialCount: materials.filter((m) => m.city === id).length,
        lat: Number(c.lat),
        lng: Number(c.lng),
        services: Array.isArray(c.services) ? c.services.map(String) : [],
        announcement: String(c.announcement || ''),
      };
    })
    .filter((c) => c.name)
    // Running cities first, then the ones with prices, then by name — the order
    // the chooser shows them in.
    .sort((a, b) =>
      Number(b.isActive) - Number(a.isActive)
      || Number(b.materialCount > 0) - Number(a.materialCount > 0)
      || a.name.localeCompare(b.name, 'fa'));
}

/** One city by its slug, for `/tariff/[city]`. */
export async function getCityBySlug(slug: string): Promise<PublicCity | null> {
  const cities = await getCities();
  return cities.find((c) => c.slug === slug) || null;
}

/** One city's prices, most valuable first. */
export async function getCityMaterials(cityId: string): Promise<PublicMaterial[]> {
  const materials = await getMaterials();
  return materials
    .filter((m) => m.city === cityId)
    .sort((a, b) => b.pricePerUnit - a.pricePerUnit);
}

async function getMaterials(): Promise<PublicMaterial[]> {
  const rows = await get<any[]>('/api/v1/recyclableMaterials');
  return (rows || [])
    .filter((m) => Number(m?.pricePerUnit) > 0)
    .map((m) => ({
      _id: String(m._id),
      title: String(m.title || ''),
      pricePerUnit: Number(m.pricePerUnit),
      unit: String(m.unit || 'kg'),
      category: String(m.category || ''),
      change: Number(m.change || 0),
      city: m.city ? String(m.city) : undefined,
    }));
}

/**
 * One city's price list — the first city, which is what the client-side table
 * also opens on. Sorted by price so the most valuable material leads: مس at
 * ۱۸۰٬۰۰۰ is what makes somebody realise the pile in their yard is worth
 * carrying downstairs.
 */
export async function getPricedCity(
  cities: PublicCity[],
  slug?: string,
): Promise<{ city: PublicCity | null; materials: PublicMaterial[] }> {
  // Asked for one by name, or else the first city that actually has prices to
  // show — landing on an empty list because the default city happens to sort
  // first is not a price page.
  const city = (slug && cities.find((c) => c.slug === slug))
    || cities.find((c) => c.isActive && c.materialCount > 0)
    || cities[0]
    || null;

  if (!city) return { city: null, materials: [] };
  return { city, materials: await getCityMaterials(city._id) };
}

/** Every city that has published prices, each with its own list. */
export async function loadBoard(): Promise<BoardCity[]> {
  const [cities, materials] = await Promise.all([getCities(), getMaterials()]);
  if (!cities.length || !materials.length) return [];

  return cities
    .filter((city) => city.isActive)
    .map((city) => ({
      ...city,
      materials: materials
        .filter((m) => m.city === city._id)
        .sort((a, b) => b.pricePerUnit - a.pricePerUnit),
    }))
    // A city with no published prices has nothing to put on a board.
    .filter((city) => city.materials.length > 0);
}

const UNIT_LABEL: Record<string, string> = { kg: 'کیلوگرم', ton: 'تن', g: 'گرم' };

/**
 * The price list as structured data.
 *
 * Amounts are **تومان** everywhere in this system, and schema.org wants an ISO
 * currency — of which there is only ریال. So the figure is multiplied by ten
 * here rather than published under a code that would understate it tenfold.
 */
export function materialsLd(materials: PublicMaterial[], cityName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `قیمت روز خرید ضایعات و پسماند خشک در ${cityName}`,
    numberOfItems: materials.length,
    itemListElement: materials.map((material, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: `${material.title} — ${cityName}`,
        category: material.category || 'پسماند خشک',
        description: `خرید ${material.title} در ${cityName} با توزین در محل و پرداخت به کیف پول.`,
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'IRR',
          price: material.pricePerUnit * 10,
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            priceCurrency: 'IRR',
            price: material.pricePerUnit * 10,
            unitText: UNIT_LABEL[material.unit] || material.unit,
          },
        },
      },
    })),
  };
}
