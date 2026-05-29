import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandBebo = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-bebo" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 17.5a3.5 3.5 0 0 0 3.5-3.5c0-1.838-1.159-3.002-3.005-3.372-.746-.15-1.37-.745-1.37-1.506 0-1.142.934-2.095 2.058-1.894C16.793 7.873 19 10.286 19 14a7 7 0 1 1-14 0V4.75a1.75 1.75 0 1 1 3.5 0V14a3.5 3.5 0 0 0 3.5 3.5" /></svg>;
const Memo = memo(IconBrandBebo);
export default Memo;