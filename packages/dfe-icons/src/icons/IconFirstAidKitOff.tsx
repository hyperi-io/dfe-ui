import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFirstAidKitOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-first-aid-kit-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8.595 4.577A2 2 0 0 1 10 4h4a2 2 0 0 1 2 2v2M12 8h6a2 2 0 0 1 2 2v6m-.576 3.405A2 2 0 0 1 18 20H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2M10 14h4M12 12v4M3 3l18 18" /></svg>;
const Memo = memo(IconFirstAidKitOff);
export default Memo;