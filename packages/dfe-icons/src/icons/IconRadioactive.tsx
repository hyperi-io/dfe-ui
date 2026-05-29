import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconRadioactive = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-radioactive" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m13.5 14.6 3 5.19A9 9 0 0 0 21 12h-6a3 3 0 0 1-1.5 2.6M13.5 9.4l3-5.19a9 9 0 0 0-9 0l3 5.19a3 3 0 0 1 3 0M10.5 14.6l-3 5.19A9 9 0 0 1 3 12h6a3 3 0 0 0 1.5 2.6" /></svg>;
const Memo = memo(IconRadioactive);
export default Memo;