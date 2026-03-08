import { useEffect, useState } from 'react';

interface Props {
  offset?: number;
}

/**
 * Hook to set the height of a component (currently table or tree height) based on the window height and an offset
 * @param offset - The offset to subtract from the window height to get the component height
 * @returns { componentHeight, setComponentHeight } - The component height and the function to set the component height
 */
export const useSetComponentHeight = ({ offset = 397 }: Props = {}) => {
  const [componentHeight, setComponentHeight] = useState(
    window.innerHeight - offset,
  );

  useEffect(() => {
    const handleResize = () => {
      setComponentHeight(window.innerHeight - offset);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [offset]);

  return { componentHeight, setComponentHeight };
};
