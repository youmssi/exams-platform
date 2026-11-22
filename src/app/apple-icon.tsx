import { ImageResponse } from "next/og";
import { LOGO_MARK_DATA_URI } from "@/components/brand/mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    // biome-ignore lint/performance/noImgElement: ImageResponse renders plain HTML
    <img src={LOGO_MARK_DATA_URI} width={180} height={180} alt="" />,
    size,
  );
}
