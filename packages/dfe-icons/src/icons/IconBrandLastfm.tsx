import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandLastfm = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-lastfm" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M20 8c-.83-1-1.388-1-2-1s-2 .271-2 2 1.384 2.233 3 3 2.125 1.812 2 3-1 2-3 2-3-1-3.5-2-1.585-4.78-2.497-6a5 5 0 1 0-1 7" /></svg>;
const Memo = memo(IconBrandLastfm);
export default Memo;