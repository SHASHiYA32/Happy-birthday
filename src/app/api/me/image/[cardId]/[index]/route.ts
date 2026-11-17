import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sniffImage } from "@/lib/security/validation";

const deny = () => new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Lets a signed-in owner look at the photos on their own cards (settings > your wishes).
 * It runs as the user, not as the service role: row-level security decides whether the
 * card and the file belong to them, so another account's photos can never come back.
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ cardId: string; index: string }> },
) {
  const { cardId, index } = await ctx.params;
  const position = Number(index);
  if (!UUID_RE.test(cardId) || !Number.isInteger(position) || position < 0 || position > 7) return deny();

  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return deny();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return deny();

  const { data: slide } = await supabase
    .from("card_slides")
    .select("image_path")
    .eq("card_id", cardId)
    .eq("position", position)
    .maybeSingle();
  if (!slide?.image_path) return deny();

  const { data: file } = await supabase.storage.from("birthday").download(slide.image_path);
  if (!file) return deny();

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImage(bytes);
  if (!type) return deny();

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": type.mime,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
