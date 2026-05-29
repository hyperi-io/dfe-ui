import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWashTemperature5 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-wash-temperature-5" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 15h.01M3 6l1.721 10.329A2 2 0 0 0 6.694 18h10.612a2 2 0 0 0 1.973-1.671L21 6M14 15h.01M15 12h.01M12 12h.01M9 12h.01" /><path d="M3.486 8.965Q3.738 8.996 4 9c.79.009 1.539-.178 2-.5.461-.32 1.21-.507 2-.5.79-.007 1.539.18 2 .5.461.322 1.21.509 2 .5.79.009 1.539-.178 2-.5.461-.32 1.21-.507 2-.5.79-.007 1.539.18 2 .5.461.322 1.21.509 2 .5q.256-.002.503-.034" /></svg>;
const Memo = memo(IconWashTemperature5);
export default Memo;