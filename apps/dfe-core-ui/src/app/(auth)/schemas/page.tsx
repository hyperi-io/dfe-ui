import { redirect } from 'next/navigation';

export default async function SchemasPage() {
  return redirect('/schemas/meta-schemas');
}
