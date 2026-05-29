import { ImageResponse } from "next/og";
import { getProductBySlug, listProducts } from "@/lib/lace/queries";
import { variantGradient } from "@/lib/products";
import {
  loadVelaDataUrl,
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgGoldStripes,
} from "@/lib/og";

export const alt = "A handcrafted veil from Lace by La Luz";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateImageMetadata() {
  const products = await listProducts();
  return products.map((p) => ({
    id: p.slug,
    alt: `${p.name} — ${p.tagline}`,
    contentType,
    size,
  }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const velaSrc = await loadVelaDataUrl();

  const name = product?.name ?? "Veil";
  const tagline = product?.tagline ?? "Hand-finished Bali lace";
  const collection = product?.collection ?? "Lace by La Luz";
  const style = product?.style ?? "";
  const price = product?.price ?? 49;
  const swatches = product?.variants?.slice(0, 4) ?? [];
  const background = variantGradient(product?.variants ?? [], 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundImage: background,
          position: "relative",
        }}
      >
        <OgGoldStripes />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 0 0 96px",
          }}
        >
          <div
            style={{
              fontSize: 16,
              letterSpacing: "0.32em",
              color: "#C9A96E",
              textTransform: "uppercase",
              marginBottom: 20,
              display: "flex",
              fontWeight: 600,
            }}
          >
            {collection} Collection{style ? ` · ${style}` : ""}
          </div>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.0,
              color: "#2C2527",
              display: "flex",
              fontWeight: 500,
              marginBottom: 20,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#6B5B5D",
              lineHeight: 1.4,
              maxWidth: 540,
              fontStyle: "italic",
              display: "flex",
              marginBottom: 36,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              width: 80,
              height: 2,
              backgroundColor: "#C9A96E",
              opacity: 0.6,
              marginBottom: 28,
              display: "flex",
            }}
          />
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 24 }}>
            <div
              style={{
                fontSize: 48,
                color: "#8B3A4A",
                display: "flex",
                fontWeight: 500,
              }}
            >
              ${price}
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
              {swatches.map((v) => (
                <div
                  key={v.color}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: v.colorHex,
                    border: "1px solid #E8DED8",
                    display: "flex",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                fontSize: 14,
                letterSpacing: "0.2em",
                color: "#6B5B5D",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {swatches.length} color{swatches.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div
          style={{
            width: 460,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 60px 60px 0",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 360,
              height: 360,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 248, 241, 0.55)",
              border: "1px solid rgba(201, 169, 110, 0.35)",
              boxShadow: "0 8px 32px rgba(44, 37, 39, 0.08)",
            }}
          >
            <img
              src={velaSrc}
              alt=""
              width={320}
              height={320}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.3em",
              color: "#8B3A4A",
              textTransform: "uppercase",
              marginTop: 18,
              display: "flex",
              fontWeight: 600,
            }}
          >
            Buy one · Give one
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
