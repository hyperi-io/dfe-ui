import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandMailgun = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-mailgun" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M17 12a2 2 0 1 0 4 0 9 9 0 1 0-2.987 6.697" /><path d="M7 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0" /><path d="M11 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0" /><path d="M11 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0" /></svg>;
const Memo = memo(IconBrandMailgun);
export default Memo;