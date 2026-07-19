/**
 * Contact locations.
 *
 * Seeded from lead.txt (two Bengaluru records). These are placeholders pending
 * business confirmation — do NOT treat as final. `needsConfirmation: true`
 * surfaces a visible note in the UI until Varixa Global confirms which address
 * is customer-facing and which (if any) is the Shiprocket pickup location.
 */
export interface ContactLocation {
  label: string;
  addressLines: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  mapsUrl: string;
  active: boolean;
  needsConfirmation: boolean;
}

function mapsLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const contactLocations: ContactLocation[] = [
  {
    label: "Bengaluru — Magadi Road",
    addressLines: ["42, 13th Main, 1st Cross, K P Agrahara", "near Mani Store, Mariyappana Palya"],
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560023",
    country: "India",
    phone: "+919740835597",
    mapsUrl: mapsLink(
      "42, 13th main, 1st cross K P Agrahara, Magadi Rd, Mariyappana Palya, Bengaluru 560023",
    ),
    active: true,
    needsConfirmation: true,
  },
  {
    label: "Bengaluru — Austin Town",
    addressLines: ["1, 1709, opp to BDA Complex", "Austin Town, Neelasandra"],
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560047",
    country: "India",
    phone: "+917892492882",
    mapsUrl: mapsLink("1709, opp to BDA Complex, Austin Town, Neelasandra, Bengaluru 560047"),
    active: true,
    needsConfirmation: true,
  },
];

export const primaryContact = contactLocations[0];
