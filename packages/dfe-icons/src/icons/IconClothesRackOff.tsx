import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconClothesRackOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-clothes-rack-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 5a2 2 0 1 0 4 0 2 2 0 1 0-4 0M12 7v1m0 4v9M9 21h6M7.757 9.243a6 6 0 0 0 3.129 1.653m3.578-.424a6 6 0 0 0 1.779-1.229M3 3l18 18" /></svg>;
const Memo = memo(IconClothesRackOff);
export default Memo;