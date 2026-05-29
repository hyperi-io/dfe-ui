import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHomeSignal = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-home-signal" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M15 22v-2M18 22v-4M21 22v-6M19 12.494V12h2l-9-9-9 9h2v7a2 2 0 0 0 2 2h4" /><path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" /></svg>;
const Memo = memo(IconHomeSignal);
export default Memo;