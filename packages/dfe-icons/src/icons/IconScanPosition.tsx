import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconScanPosition = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-scan-position" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 7V6a2 2 0 0 1 2-2h2M4 17v1a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v1M16 20h2a2 2 0 0 0 2-2v-1M12 17l3-8-8 3 3.5 1.5z" /></svg>;
const Memo = memo(IconScanPosition);
export default Memo;