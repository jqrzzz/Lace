import { ImageResponse } from "next/og";
import {
  loadVelaDataUrl,
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgGoldStripes,
} from "@/lib/og";

export const alt = "Lace by La Luz — Elegant Veils, Shared with Purpose";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const velaSrc = await loadVelaDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundImage:
            "linear-gradient(135deg, #FFF8F1 0%, #F4DDD0 45%, #F0E6DB 100%)",
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
              fontSize: 18,
              letterSpacing: "0.32em",
              color: "#C9A96E",
              textTransform: "uppercase",
              marginBottom: 28,
              display: "flex",
              fontWeight: 600,
            }}
          >
            Lace by La Luz · est. 2024
          </div>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.05,
              color: "#2C2527",
              display: "flex",
              fontWeight: 500,
            }}
          >
            Elegant Veils,
          </div>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.05,
              color: "#8B3A4A",
              fontStyle: "italic",
              display: "flex",
              fontWeight: 500,
              marginBottom: 36,
            }}
          >
            Shared with Purpose
          </div>
          <div
            style={{
              width: 80,
              height: 2,
              backgroundColor: "#C9A96E",
              opacity: 0.6,
              marginBottom: 32,
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 26,
              color: "#6B5B5D",
              lineHeight: 1.4,
              maxWidth: 520,
              display: "flex",
            }}
          >
            Buy one. Give one. A century of faith, beauty, and sisterhood —
            woven into every veil.
          </div>
        </div>

        <div
          style={{
            width: 460,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 60px 60px 0",
          }}
        >
          <img
            src={velaSrc}
            alt=""
            width={400}
            height={400}
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
