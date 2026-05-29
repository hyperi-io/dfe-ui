import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBuildingBroadcastTower = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-building-broadcast-tower" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M11 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0" /><path d="M16.616 13.924a5 5 0 1 0-9.23 0" /><path d="M20.307 15.469a9 9 0 1 0-16.615 0" /><path d="m9 21 3-9 3 9M10 19h4" /></svg>;
const Memo = memo(IconBuildingBroadcastTower);
export default Memo;