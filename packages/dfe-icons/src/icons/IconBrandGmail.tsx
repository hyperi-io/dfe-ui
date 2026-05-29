import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandGmail = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-gmail" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M16 20h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3zM5 20h3V4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1M16 4l-4 4-4-4" /><path d="m4 6.5 8 7.5 8-7.5" /></svg>;
const Memo = memo(IconBrandGmail);
export default Memo;