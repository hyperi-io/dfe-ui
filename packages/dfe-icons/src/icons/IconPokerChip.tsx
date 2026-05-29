import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPokerChip = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-poker-chip" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /><path d="M7 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0M12 3v4M12 17v4M3 12h4M17 12h4M18.364 5.636l-2.828 2.828M8.464 15.536l-2.828 2.828M5.636 5.636l2.828 2.828M15.536 15.536l2.828 2.828" /></svg>;
const Memo = memo(IconPokerChip);
export default Memo;