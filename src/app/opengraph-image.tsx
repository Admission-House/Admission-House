import { ImageResponse } from "next/og";

export const alt = "Admissions House: find the right college, with a counsellor by your side";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#063B39",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#00DFC2" }}>Admissions House</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>
          Find the right college, with a counsellor by your side
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 32, color: "#C2FDF0" }}>
          Compare fees and placements. Free one-to-one counselling.
        </div>
      </div>
    ),
    size,
  );
}
