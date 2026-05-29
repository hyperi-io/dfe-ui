import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBulldozer = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-bulldozer" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M2 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M12 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M19 13v4a2 2 0 0 0 2 2h1M14 19H4M4 15h10" /><path d="M9 11V6h2a3 3 0 0 1 3 3v6" /><path d="M5 15v-3a1 1 0 0 1 1-1h8M19 17h-3" /></svg>;
const Memo = memo(IconBulldozer);
export default Memo;