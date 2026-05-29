import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBuildingFortress = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-building-fortress" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 21h1a1 1 0 0 0 1-1v-1a3 3 0 0 1 6 0m3 2h1a1 1 0 0 0 1-1V5l-3-2-3 2v6h-4V5L7 3 4 5v15a1 1 0 0 0 1 1h2m8-2v1a1 1 0 0 0 1 1h2M7 7v.01M7 10v.01M7 13v.01M17 7v.01M17 10v.01M17 13v.01" /></svg>;
const Memo = memo(IconBuildingFortress);
export default Memo;