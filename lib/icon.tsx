import { ImageResponse } from "next/og";

/** Icono de la app: llama minimalista sobre fondo oscuro. */
export function renderAppIcon(size: number) {
  const s = size;
  return new ImageResponse(
    (
      <div
        style={{
          width: s,
          height: s,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0e11",
        }}
      >
        <svg width={s * 0.56} height={s * 0.56} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.5c.6 3-1.2 4.7-2.8 6.4C7.6 10.6 6 12.4 6 15a6 6 0 0 0 12 0c0-2.2-1-3.9-2.2-5.3-.3 1.4-1.1 2.4-2.3 2.8.6-3.6-.4-7.4-1.5-10Z"
            fill="#F0A25A"
          />
          <path d="M12 21a3 3 0 0 1-3-3c0-1.6 1.3-2.6 2.2-3.7.3 1 .9 1.6 1.7 1.8.1-.6.5-1.1 1-1.5.6.9 1.1 1.9 1.1 3.4a3 3 0 0 1-3 3Z" fill="#FBD9A8" />
        </svg>
      </div>
    ),
    { width: s, height: s },
  );
}
