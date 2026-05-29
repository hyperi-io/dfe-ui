import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCertificateOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-certificate-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12.876 12.881a3 3 0 0 0 4.243 4.243m.588-3.42a3 3 0 0 0-1.437-1.423" /><path d="M13 17.5V22l2-1.5 2 1.5v-4.5M10 19H5a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2m4 0h10a2 2 0 0 1 2 2v10M6 9h3m4 0h5M6 12h3M6 15h2M3 3l18 18" /></svg>;
const Memo = memo(IconCertificateOff);
export default Memo;