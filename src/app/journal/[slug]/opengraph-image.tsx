import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { JOURNAL_POSTS, getPostBySlug } from "@/lib/journal";

export const alt = "An essay from the Lace by La Luz journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata() {
  return JOURNAL_POSTS.map((p) => ({
    id: p.slug,
    alt: p.title,
    contentType,
    size,
  }));
}

const POST_BACKGROUND: Record<string, string> = {
  "language-of-lace":
    "linear-gradient(135deg, #F5E1E6 0%, #E8C4CE 55%, #F0E6DB 100%)",
  "bali-to-guadalajara":
    "linear-gradient(135deg, #F0E6DB 0%, #DAB46B 55%, #F5E1E6 100%)",
  "one-hundred-years-of-light":
    "linear-gradient(135deg, #8B3A4A 0%, #C19640 55%, #F0E6DB 100%)",
  "a-morning-in-nairobi":
    "linear-gradient(135deg, #E8C4CE 0%, #B05766 55%, #F5E1E6 100%)",
};

const DEFAULT_BG =
  "linear-gradient(135deg, #FFF8F1 0%, #F4DDD0 55%, #F0E6DB 100%)";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const velaBuffer = await readFile(
    path.join(process.cwd(), "public/images/vela-ai-avatar.png")
  );
  const velaSrc = `data:image/png;base64,${velaBuffer.toString("base64")}`;

  const background = POST_BACKGROUND[slug] ?? DEFAULT_BG;
  const title = post?.title ?? "From the Journal";
  const author = post?.author ?? "Lace by La Luz";
  const role = post?.authorRole ?? "Journal";
  const date = post?.date ? formatDate(post.date) : "";
  const category = post?.category ?? "essay";

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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, #C9A96E 50%, transparent 100%)",
            display: "flex",
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 60px 80px 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontSize: 14,
                letterSpacing: "0.32em",
                color: "#FFF8F1",
                textTransform: "uppercase",
                fontWeight: 600,
                display: "flex",
                backgroundColor: "rgba(44,37,39,0.55)",
                padding: "6px 14px",
                borderRadius: 999,
              }}
            >
              Journal · {category}
            </div>
            {date && (
              <div
                style={{
                  fontSize: 14,
                  color: "#FFF8F1",
                  display: "flex",
                  letterSpacing: "0.1em",
                }}
              >
                {date}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: title.length > 30 ? 64 : 78,
              lineHeight: 1.05,
              color: "#FFFFFF",
              display: "flex",
              fontWeight: 500,
              marginBottom: 36,
              textShadow: "0 2px 20px rgba(44,37,39,0.35)",
              maxWidth: 620,
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: 60,
              height: 2,
              backgroundColor: "#C9A96E",
              marginBottom: 24,
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: "#FFF8F1",
              display: "flex",
              flexDirection: "column",
              opacity: 0.95,
            }}
          >
            <div style={{ display: "flex", fontStyle: "italic" }}>
              by {author}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 14,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {role}
            </div>
          </div>
        </div>

        <div
          style={{
            width: 380,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 60px 60px 0",
          }}
        >
          <img
            src={velaSrc}
            alt=""
            width={300}
            height={300}
            style={{ objectFit: "contain" }}
          />
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.3em",
              color: "#FFF8F1",
              textTransform: "uppercase",
              marginTop: 16,
              display: "flex",
              fontWeight: 600,
            }}
          >
            Lace by La Luz
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, #C9A96E 50%, transparent 100%)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
