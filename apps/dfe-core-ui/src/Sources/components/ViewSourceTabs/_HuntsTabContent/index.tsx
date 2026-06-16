import { Card } from 'antd';

export const HuntsTabContent = () => {
  const attrSources = ['source1', 'source2', 'source3'];
  return (
    <div>
      <h4 className="text-lg font-medium">Hunts</h4>
      <p>Hunt specific details and configuration per source.</p>
      <p>Might fold source specific Rules into this tab.</p>

      <p className="text-error">Show other attributed sources per hunt.</p>

      <Card>
        <p>Hunt 1 description</p>

        <ul className="flex gap-2">
          {attrSources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
