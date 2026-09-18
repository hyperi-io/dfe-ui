export const CreateSourceStep = ({ schemaPath }: { schemaPath: string }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2>Create Source</h2>
      <div>Schema Path: {schemaPath}</div>
    </div>
  );
};
