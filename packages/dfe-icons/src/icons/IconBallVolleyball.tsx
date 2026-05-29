import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBallVolleyball = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-ball-volleyball" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /><path d="M12 12a8 8 0 0 0 8 4M7.5 13.5A12 12 0 0 0 16 20" /><path d="M12 12a8 8 0 0 0-7.464 4.928M12.951 7.353a12 12 0 0 0-9.88 4.111" /><path d="M12 12a8 8 0 0 0-.536-8.928M15.549 15.147a12 12 0 0 0 1.38-10.611" /></svg>;
const Memo = memo(IconBallVolleyball);
export default Memo;