import { renderAppIcon } from "@/lib/icon";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  return renderAppIcon(size === "512" ? 512 : 192);
}
