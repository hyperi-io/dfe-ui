import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFish = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-fish" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M16.69 7.44A6.97 6.97 0 0 0 15 12a6.97 6.97 0 0 0 1.699 4.571" /><path d="M2 9.504c7.715 8.647 14.75 10.265 20 2.498C16.75 4.241 9.715 5.86 2 14.506M18 11v.01" /><path d="M11.5 10.5q-1 1.5 0 3" /></svg>;
const Memo = memo(IconFish);
export default Memo;