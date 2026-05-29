import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconRollercoaster = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-rollercoaster" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 21a5.55 5.55 0 0 0 5.265-3.795L9 15a8.775 8.775 0 0 1 8.325-6H21M20 9v12M8 21v-3M12 21V11M16 9.5V21M15 3h5v3h-5zM6 8l4-3 2 2.5-4 3-1.8-.5z" /></svg>;
const Memo = memo(IconRollercoaster);
export default Memo;