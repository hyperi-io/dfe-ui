import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandShazam = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-shazam" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m10 12 2-2a2.83 2.83 0 0 1 4 0 2.83 2.83 0 0 1 0 4l-3 3" /><path d="m14 12-2 2a2.828 2.828 0 1 1-4-4l3-3" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /></svg>;
const Memo = memo(IconBrandShazam);
export default Memo;