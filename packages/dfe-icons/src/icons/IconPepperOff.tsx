import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPepperOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-pepper-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12.59 12.59C11.82 14.008 10.055 15 8 15c-2.761 0-5-1.79-5-4a8 8 0 0 0 13.643 5.67m1.64-2.357A8 8 0 0 0 19 11a3 3 0 0 0-5.545-1.59" /><path d="M16 8c0-2 2-4 4-4M3 3l18 18" /></svg>;
const Memo = memo(IconPepperOff);
export default Memo;