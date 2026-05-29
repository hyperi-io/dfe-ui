import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHelicopter = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-helicopter" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m3 10 1 2h6M12 9a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h7a2 2 0 0 0 2-2c0-3.31-3.13-5-7-5zM13 9V6M5 6h15" /><path d="M15 9.1V13h5.5M15 19v-3M19 19h-8" /></svg>;
const Memo = memo(IconHelicopter);
export default Memo;