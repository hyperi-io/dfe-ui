import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandBaidu = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-baidu" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 9.5a1 1.5 0 1 0 2 0 1 1.5 0 1 0-2 0M14.463 11.596c1.282 1.774 3.476 3.416 3.476 3.416s1.921 1.574.593 3.636S13.64 19.8 13.64 19.8s-1.416-.44-3.06-.088c-1.644.356-3.06.22-3.06.22s-2.055-.22-2.47-2.304 1.918-3.638 2.102-3.858c.182-.222 1.409-.966 2.284-2.394s3.337-2.287 5.027.221M8 4.5a1 1.5 0 1 0 2 0 1 1.5 0 1 0-2 0M14 4.5a1 1.5 0 1 0 2 0 1 1.5 0 1 0-2 0M18 9.5a1 1.5 0 1 0 2 0 1 1.5 0 1 0-2 0" /></svg>;
const Memo = memo(IconBrandBaidu);
export default Memo;