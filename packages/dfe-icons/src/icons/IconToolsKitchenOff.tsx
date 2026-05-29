import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconToolsKitchenOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-tools-kitchen-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 3h5l-.5 4.5m-.4 3.595L11 12H5l-.875-7.874M7 18h2v3H7zM15.225 11.216C15.645 8.698 16.814 6.039 20 3v12h-1M20 15v1m0 4v1h-1v-2M8 12v6M3 3l18 18" /></svg>;
const Memo = memo(IconToolsKitchenOff);
export default Memo;