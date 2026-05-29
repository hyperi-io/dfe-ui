import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconApiAppOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-api-app-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 15H5.5a2.5 2.5 0 1 1 0-5H6M15 15v3.5a2.5 2.5 0 1 1-5 0V18M13 9h5.5a2.5 2.5 0 1 1 0 5H18M9 12V9m.042-3.957A2.5 2.5 0 0 1 14 5.5V6M3 3l18 18" /></svg>;
const Memo = memo(IconApiAppOff);
export default Memo;