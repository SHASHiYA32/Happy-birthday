/**
 * Announce something new on the home page.
 *
 * To push an update: change `id` (any new string) and the text. Every visitor sees the
 * notification once, the next time they open the home page, and never again for that id.
 */
export const LATEST_UPDATE = {
  id: "2026-11-occasions",
  title: "New: Christmas, Vesak & Valentine's cards",
  description: "Not only birthdays any more. You can now make a sealed card for any of them.",
  cta: "Make one",
  href: "/create",
};

export const UPDATE_STORAGE_KEY = "veloura:last-update";
