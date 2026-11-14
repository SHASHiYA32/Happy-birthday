import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasViewerAccess } from "@/lib/security/viewer-session";
import { SLUG_RE, sniffImage } from "@/lib/security/validation";

const deny = () =>
  new NextResponse("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string; index: string }> },
) {
  const { slug, index } = await ctx.params;
  const position = Number(index);
  if (!SLUG_RE.test(slug) || !Number.isInteger(position) || position < 0 || position > 7) return deny();

  // Photos only load as <img>/fetch from our own pages. Typing the URL into the
  // address bar, opening it in a new tab or hotlinking it from elsewhere is refused.
  const dest = request.headers.get("sec-fetch-dest");
  const site = request.headers.get("sec-fetch-site");
  if (dest === "document" || dest === "iframe" || (site && site !== "same-origin")) return deny();

  const admin = createAdminClient();
  const { data: card } = await admin.from("cards").select("id, otp_salt").eq("slug", slug).maybeSingle();
  if (!card || !(await hasViewerAccess(slug, card.otp_salt))) return deny();

  const { data: slide } = await admin
    .from("card_slides")
    .select("image_path")
    .eq("card_id", card.id)
    .eq("position", position)
    .maybeSingle();
  if (!slide?.image_path) return deny();

  const { data: file } = await admin.storage.from("birthday").download(slide.image_path);
  if (!file) return deny();

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImage(bytes);
  if (!type) return deny();

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": type.mime,
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
