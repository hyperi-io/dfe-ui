import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBuildingBridge2Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-building-bridge-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M18 6a3 3 0 0 1 3 3v9a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2a3 3 0 0 0-6 0v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3z" /></svg>;
const Memo = memo(IconBuildingBridge2Filled);
export default Memo;