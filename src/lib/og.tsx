import { readFile } from "fs/promises";
import path from "path";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

let velaSrcCache: string | null = null;

/**
 * Read the Vela PNG once per process and return the base64 data URL. Caching
 * avoids re-reading + re-encoding the asset for every OG route hit (we have
 * 11 of them as of writing, and Next prerenders each per slug).
 */
export async function loadVelaDataUrl(): Promise<string> {
  if (velaSrcCache) return velaSrcCache;
  const buffer = await readFile(
    path.join(process.cwd(), "public/images/vela-ai-avatar.png"),
  );
  velaSrcCache = `data:image/png;base64,${buffer.toString("base64")}`;
  return velaSrcCache;
}

/**
 * Gold accent stripes that sit flush against the top and bottom of every
 * OG card. Two absolute-positioned children — drop inside the OG root flex
 * container so Satori can resolve them.
 */
export function OgGoldStripes() {
  const stripe = {
    position: "absolute" as const,
    left: 0,
    right: 0,
    height: 4,
    backgroundImage:
      "linear-gradient(90deg, transparent 0%, #C9A96E 50%, transparent 100%)",
    display: "flex",
  };
  return (
    <>
      <div style={{ ...stripe, top: 0 }} />
      <div style={{ ...stripe, bottom: 0 }} />
    </>
  );
}
