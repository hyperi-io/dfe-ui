import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconParachute = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-parachute" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M22 12a10 10 0 1 0-20 0" /><path d="M22 12c0-1.66-1.46-3-3.25-3-1.8 0-3.25 1.34-3.25 3 0-1.66-1.57-3-3.5-3s-3.5 1.34-3.5 3c0-1.66-1.46-3-3.25-3C3.45 9 2 10.34 2 12M2 12l10 10-3.5-10M15.5 12 12 22l10-10" /></svg>;
const Memo = memo(IconParachute);
export default Memo;