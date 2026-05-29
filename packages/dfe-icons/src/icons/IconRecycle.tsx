import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconRecycle = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-recycle" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m12 17-2 2 2 2" /><path d="M10 19h9a2 2 0 0 0 1.75-2.75l-.55-1M8.536 11l-.732-2.732L5.072 9" /><path d="m7.804 8.268-4.5 7.794a2 2 0 0 0 1.506 2.89l1.141.024M15.464 11l2.732.732L18.928 9" /><path d="m18.196 11.732-4.5-7.794a2 2 0 0 0-3.256-.14l-.591.976" /></svg>;
const Memo = memo(IconRecycle);
export default Memo;