import { IconCheck } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const BaseUrlSelector: React.FC<{
  options: string[];
  onChange: (value: string) => void;
  value?: string;
}> = ({ options, onChange, value = '' }) => {
  const [open, setOpen] = useState(false);

  const handleChange = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const isSelected = (option: string) =>
    String(value).trim() === String(option).trim();

  return (
    <div className="relative mt-auto">
      <Button className="mt-auto" onClick={() => setOpen(!open)}>
        Other Base URLs
      </Button>
      {open && (
        <ul className="absolute right-0 z-10 bg-white shadow-md min-w-96 mt-2">
          {options.map((option) => (
            <li key={option} className="w-full">
              <Button
                type="text"
                classNames={{
                  root: 'w-full',
                  content: 'w-full text-left',
                }}
                icon={isSelected(option) ? <IconCheck /> : undefined}
                onClick={() => handleChange(option)}
                disabled={isSelected(option)}
              >
                {option}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
