import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { LOGO_MARK_DATA_URI } from "@/components/brand/mark";
import { palette } from "@/components/brand/palette";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Exams";

/** Shared-link preview in the landing's identity: warm paper, editorial serif, readable as a thumbnail. */
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "share" });
  const [regular, bold, serif] = await Promise.all(
    ["Geist-Regular.ttf", "Geist-Bold.ttf", "InstrumentSerif-Regular.ttf"].map(
      (file) => readFile(join(process.cwd(), "src/assets/fonts", file)),
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
        padding: "72px 80px",
        background: palette.background,
        color: palette.foreground,
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* biome-ignore lint/performance/noImgElement: ImageResponse renders plain HTML */}
        <img src={LOGO_MARK_DATA_URI} width={72} height={72} alt="" />
        <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5 }}>
          Exams
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <span
          style={{
            fontFamily: "Instrument Serif",
            fontSize: 88,
            lineHeight: 1.02,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {t("title")}
        </span>
        <span style={{ fontSize: 30, color: palette.muted }}>
          {t("subtitle")}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: `2px solid ${palette.foreground}`,
          paddingTop: 24,
          fontSize: 24,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: palette.muted,
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
        { name: "Instrument Serif", data: serif, weight: 400, style: "normal" },
      ],
    },
  );
}
