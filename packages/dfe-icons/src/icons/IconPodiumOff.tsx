import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPodiumOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-podium-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 8h7l-.621 2.485A2 2 0 0 1 16.439 12H16m-4 0H7.561a2 2 0 0 1-1.94-1.515L5 8h3M7 8V7m.864-3.106A3 3 0 0 1 10 3M8 12l1 9M15.599 15.613 15 21M7 21h10M3 3l18 18" /></svg>;
const Memo = memo(IconPodiumOff);
export default Memo;