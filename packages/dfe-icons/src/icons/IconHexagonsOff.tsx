import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHexagonsOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-hexagons-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 18v-5l4-2 4 2v5l-4 2zM8 11V8m1.332-2.666L12 4l4 2v5M12 13l.661-.331M15.345 11.328 16 11l4 2v3m-1.334 2.667L16 20l-4-2M3 3l18 18" /></svg>;
const Memo = memo(IconHexagonsOff);
export default Memo;