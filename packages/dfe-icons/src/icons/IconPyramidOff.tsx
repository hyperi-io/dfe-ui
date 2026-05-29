import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPyramidOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-pyramid-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M21.384 17.373a1 1 0 0 0-.013-1.091l-8.54-13.836a1 1 0 0 0-1.664 0l-1.8 2.917m-1.531 2.48-5.209 8.439a1.005 1.005 0 0 0 .386 1.452l8.092 4.054a2 2 0 0 0 1.789 0l5.903-2.958M12 2v6m0 4v10M3 3l18 18" /></svg>;
const Memo = memo(IconPyramidOff);
export default Memo;