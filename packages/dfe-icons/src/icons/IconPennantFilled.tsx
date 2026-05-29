import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPennantFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-pennant" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M10 2a1 1 0 0 1 .993.883L11 3v.35l8.406 3.736c.752.335.79 1.365.113 1.77l-.113.058L11 12.649V20h1a1 1 0 0 1 .117 1.993L12 22H8a1 1 0 0 1-.117-1.993L8 20h1V3a1 1 0 0 1 1-1" /></svg>;
const Memo = memo(IconPennantFilled);
export default Memo;