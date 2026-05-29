import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconJumpRope = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-jump-rope" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M6 14V8a3 3 0 1 1 6 0v8a3 3 0 0 0 6 0v-6" /><path d="M16 5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 2 2 0 0 1-2-2zM4 16a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 2 2 0 0 1-2-2z" /></svg>;
const Memo = memo(IconJumpRope);
export default Memo;