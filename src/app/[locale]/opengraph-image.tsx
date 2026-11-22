import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { LOGO_MARK_DATA_URI } from "@/components/brand/mark";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Exams";

/** Shared-link preview: clean, neutral, readable at thumbnail size. */
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "share" });
  const [regular, bold] = await Promise.all(
    ["Geist-Regular.ttf", "Geist-Bold.ttf"].map((file) =>
      readFile(join(process.cwd(), "src/assets/fonts", file)),
    ),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#ffffff",
        color: "#0a0a0a",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* biome-ignore lint/performance/noImgElement: ImageResponse renders plain HTML */}
        <img src={LOGO_MARK_DATA_URI} width={96} height={96} alt="" />
        <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2 }}>
          Exams
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          {t("title")}
        </span>
        <span style={{ fontSize: 32, color: "#737373" }}>{t("subtitle")}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "2px solid #e5e5e5",
          paddingTop: 28,
          fontSize: 26,
          color: "#737373",
        }}
      >
        <span>{t("points")}</span>
        <span>exams.mrvin100.de</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
