import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMilitaryAward = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-military-award" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 13a4 4 0 1 0 8 0 4 4 0 1 0-8 0" /><path d="M8.5 10.5 7.5 8H2l2.48 5.788A2 2 0 0 0 6.32 15H8.5M15.5 10.5l1-2.5H22l-2.48 5.788A2 2 0 0 1 17.68 15H15.5" /></svg>;
const Memo = memo(IconMilitaryAward);
export default Memo;