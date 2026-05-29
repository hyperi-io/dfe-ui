import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandTesla = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-tesla" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m12 21 3-11c2.359 0 3 0 3 1 0 0 1.18-1.745 2-3-3.077-1.464-6-1-6-1l-2 2-2-2s-2.923-.464-6 1c.82 1.255 2 3 2 3 0-1 .744-1 3-1zM20 5C14.886 3 9.114 3 4 5" /></svg>;
const Memo = memo(IconBrandTesla);
export default Memo;