import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWashOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-wash-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m3 6 1.721 10.329A2 2 0 0 0 6.694 18h10.612q.314-.001.6-.092m1.521-2.472L21 6" /><path d="M3.486 8.965Q3.738 8.996 4 9c.79.009 1.539-.178 2-.5.461-.32 1.21-.507 2-.5m4.92.919c.428-.083.805-.227 1.08-.418.461-.322 1.21-.508 2-.5.79-.008 1.539.178 2 .5.461.32 1.21.508 2 .5.17 0 .339-.015.503-.035M3 3l18 18" /></svg>;
const Memo = memo(IconWashOff);
export default Memo;