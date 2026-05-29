import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconScubaDivingTankFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-scuba-diving-tank" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 17v2a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-2zM8 2a2 2 0 0 1 1.732 1h1.15a1.496 1.496 0 0 1 2.236 0H15a1 1 0 0 1 0 2l-1.883.001a2 2 0 0 1-.115.116V6.1A5 5 0 0 1 17 11v4H7v-4a5 5 0 0 1 4-4.9v-.983a2 2 0 0 1-.117-.116H9.732A2 2 0 1 1 8 2" /></svg>;
const Memo = memo(IconScubaDivingTankFilled);
export default Memo;