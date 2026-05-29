import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCar4wdFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-car-4wd" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 2a3 3 0 0 1 3 3v2a3 3 0 0 1-6 0h-1v10h1a3 3 0 0 1 6 0v2a3 3 0 0 1-6 0h-4a3 3 0 0 1-6 0v-2a3 3 0 0 1 6 0h1V7h-1a3 3 0 1 1-6 0V5a3 3 0 1 1 6 0h4a3 3 0 0 1 3-3" /></svg>;
const Memo = memo(IconCar4wdFilled);
export default Memo;