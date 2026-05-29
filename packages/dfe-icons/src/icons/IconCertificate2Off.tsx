import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCertificate2Off = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-certificate-2-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 12a3 3 0 1 0 3 3M11 7h3" /><path d="M10 18v4l2-1 2 1v-4M10 19H8a2 2 0 0 1-2-2V6m1.18-2.825C7.43 3.063 7.709 3 8 3h8a2 2 0 0 1 2 2v9m-.175 3.82A2 2 0 0 1 16 19h-2M3 3l18 18" /></svg>;
const Memo = memo(IconCertificate2Off);
export default Memo;