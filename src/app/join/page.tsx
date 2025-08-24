// app/join/page.tsx
import JoinClient from "./JoinClient";

type SP = Record<string, string | string[] | undefined>;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};
  const raw = sp.code;
  const initialCode = Array.isArray(raw) ? raw[0] : raw ?? "";
  return <JoinClient initialCode={initialCode} />;
}
