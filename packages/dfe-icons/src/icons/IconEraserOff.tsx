import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconEraserOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-eraser-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m3 3 18 18M19 20H8.5l-4.21-4.3a1 1 0 0 1 0-1.41l5-4.993m2.009-2.01 3-3a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41q-2.125 2.147-2.97 3m-2.02 2.043-4.211 4.256M18 13.3 11.7 7" /></svg>;
const Memo = memo(IconEraserOff);
export default Memo;