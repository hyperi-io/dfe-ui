import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandAmd = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-amd" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M16 16V9c0-.566-.434-1-1-1H8L3 3h17c.566 0 1 .434 1 1v17z" /><path d="M11.293 20.707 16 16H9a1 1 0 0 1-1-1V8l-4.707 4.707a1 1 0 0 0-.293.707V20a1 1 0 0 0 1 1h6.586a1 1 0 0 0 .707-.293" /></svg>;
const Memo = memo(IconBrandAmd);
export default Memo;