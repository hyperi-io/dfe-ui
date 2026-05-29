import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHammer = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-hammer" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m11.414 10-7.383 7.418a2.09 2.09 0 0 0 0 2.967 2.11 2.11 0 0 0 2.976 0L14.414 13M18.121 15.293l2.586-2.586a1 1 0 0 0 0-1.414l-7.586-7.586a1 1 0 0 0-1.414 0L9.121 6.293a1 1 0 0 0 0 1.414l7.586 7.586a1 1 0 0 0 1.414 0" /></svg>;
const Memo = memo(IconHammer);
export default Memo;