import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSkateboarding = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-skateboarding" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M16 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0M5.5 15H9l.75-1.5M14 19v-5l-2.5-3L14 7" /><path d="m8 8 3-1h4l1 3h3" /><path fill="currentColor" d="M17.5 21a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" /><path d="M3 18c0 .552.895 1 2 1h14c1.105 0 2-.448 2-1" /><path fill="currentColor" d="M6.5 21a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" /></svg>;
const Memo = memo(IconSkateboarding);
export default Memo;