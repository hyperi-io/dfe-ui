import { redirect } from 'next/navigation';

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function SchemasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const resolved = Array.isArray(value) ? value[0] : value;
    if (resolved) {
      query.set(key, resolved);
    }
  });

  const qs = query.toString();
  return redirect(qs ? `/schemas/meta-schemas?${qs}` : '/schemas/meta-schemas');
}
