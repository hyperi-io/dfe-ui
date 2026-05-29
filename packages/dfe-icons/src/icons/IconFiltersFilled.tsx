import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFiltersFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-filters" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19.396 11.056a6 6 0 0 1-5.647 10.506q.206-.21.396-.44a8 8 0 0 0 1.789-6.155 8.02 8.02 0 0 0 3.462-3.911M4.609 11.051a7.99 7.99 0 0 0 9.386 4.698 6 6 0 1 1-9.534-4.594z" /><path d="M12 2a6 6 0 1 1-6 6l.004-.225A6 6 0 0 1 12 2" /></svg>;
const Memo = memo(IconFiltersFilled);
export default Memo;