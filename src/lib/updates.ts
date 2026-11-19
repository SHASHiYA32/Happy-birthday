/**
 * Announce something new on the home page.
 *
 * To push an update: change `id` (any new string) and the text. Every visitor sees the
 * notification once, the next time they open the home page, and never again for that id.
 */
export const LATEST_UPDATE = {
  id: "2026-11-fixes",
  title: "Cards now match their theme",
  description:
    "Fixed a bug where Valentine, Vesak and Christmas cards opened as birthday cards. Each card now shows its own look, music and link preview.",
  cta: "Make a card",
  href: "/create",
};

export const UPDATE_STORAGE_KEY = "veloura:last-update";
