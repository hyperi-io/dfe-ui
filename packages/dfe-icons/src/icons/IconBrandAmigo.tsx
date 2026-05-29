import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandAmigo = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-amigo" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 12a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /><path d="m9.591 3.635-7.13 14.082c-1.712 3.38 1.759 5.45 3.69 3.573l1.86-1.81c3.142-3.054 4.959-2.99 8.039.11l1.329 1.337c2.372 2.387 5.865.078 4.176-3.225L14.36 3.635c-1.114-2.18-3.666-2.18-4.77 0" /></svg>;
const Memo = memo(IconBrandAmigo);
export default Memo;