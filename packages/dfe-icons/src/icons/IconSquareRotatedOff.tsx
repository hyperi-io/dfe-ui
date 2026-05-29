import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSquareRotatedOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-square-rotated-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m16.964 16.952-3.462 3.461c-.782.783-2.222.783-3 0l-6.911-6.91c-.783-.783-.783-2.223 0-3l3.455-3.456m2-2 1.453-1.452c.782-.783 2.222-.783 3 0l6.911 6.91c.783.783.783 2.223 0 3l-1.448 1.45M3 3l18 18" /></svg>;
const Memo = memo(IconSquareRotatedOff);
export default Memo;