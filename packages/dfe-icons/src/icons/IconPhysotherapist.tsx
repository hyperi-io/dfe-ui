import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPhysotherapist = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-physotherapist" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m9 15-1-3 4-2 4 1h3.5M3 19a1 1 0 1 0 2 0 1 1 0 1 0-2 0M11 6a1 1 0 1 0 2 0 1 1 0 1 0-2 0M12 17v-7M8 20h7l1-4 4-2M18 20h3" /></svg>;
const Memo = memo(IconPhysotherapist);
export default Memo;