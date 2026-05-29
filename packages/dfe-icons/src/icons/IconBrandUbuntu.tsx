import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandUbuntu = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-ubuntu" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 5a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /><path d="M17.723 7.41a8 8 0 0 0-3.74-2.162m-3.971 0a8 8 0 0 0-3.789 2.216m-1.881 3.215A8 8 0 0 0 4 12.999c0 .738.1 1.453.287 2.132m1.96 3.428a8 8 0 0 0 3.759 2.19m4 0a8 8 0 0 0 3.747-2.186m1.962-3.43a8 8 0 0 0 .287-2.131c0-.764-.107-1.503-.307-2.203" /><path d="M3 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M17 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /></svg>;
const Memo = memo(IconBrandUbuntu);
export default Memo;