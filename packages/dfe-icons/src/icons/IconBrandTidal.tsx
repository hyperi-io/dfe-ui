import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandTidal = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-tidal" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m5.333 6 3.334 3.25L12 6l3.333 3.25L18.667 6 22 9.25l-3.333 3.25-3.334-3.25L12 12.5l3.333 3.25L12 19l-3.333-3.25L12 12.5 8.667 9.25 5.333 12.5 2 9.25z" /></svg>;
const Memo = memo(IconBrandTidal);
export default Memo;