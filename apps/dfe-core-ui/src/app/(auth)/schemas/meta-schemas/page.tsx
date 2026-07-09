import { SchemaListScene } from '@/Schemas/scenes/SchemaList';

export default async function SchemasPage() {
  return <SchemaListScene meta={{ schemaTypes: ['meta'] }} />;
}
