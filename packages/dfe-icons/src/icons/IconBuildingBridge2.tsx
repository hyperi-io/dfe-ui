import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBuildingBridge2 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-building-bridge-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M6 7h12a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a4 4 0 0 0-8 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a2 2 0 0 1 2-2" /></svg>;
const Memo = memo(IconBuildingBridge2);
export default Memo;