import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGrill = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-grill" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M19 8H5a6 6 0 0 0 6 6h2a6 6 0 0 0 6-5.775zM17 20a2 2 0 1 1 0-4 2 2 0 0 1 0 4M15 14l1 2M9 14l-3 6M15 18H7M15 5V4M12 5V4M9 5V4" /></svg>;
const Memo = memo(IconGrill);
export default Memo;