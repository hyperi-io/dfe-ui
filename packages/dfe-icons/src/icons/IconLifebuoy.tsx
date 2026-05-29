import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLifebuoy = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-lifebuoy" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0M15 15l3.35 3.35M9 15l-3.35 3.35M5.65 5.65 9 9M18.35 5.65 15 9" /></svg>;
const Memo = memo(IconLifebuoy);
export default Memo;