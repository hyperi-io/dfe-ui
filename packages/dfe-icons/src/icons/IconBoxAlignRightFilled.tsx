import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBoxAlignRightFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-box-align-right" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M18.998 3.003h-5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5a2 2 0 0 0 2-2v-14a2 2 0 0 0-2-2M9.008 19.003a1 1 0 0 1 .117 1.993l-.127.007a1 1 0 0 1-.117-1.993zM4.008 19.003a1 1 0 0 1 .117 1.993l-.128.007a1 1 0 0 1-.117-1.993zM4.008 14.002a1 1 0 0 1 .117 1.993l-.128.007a1 1 0 0 1-.117-1.993zM4.008 8.002a1 1 0 0 1 .117 1.993l-.128.007a1 1 0 0 1-.117-1.993zM4.008 3.002a1 1 0 0 1 .117 1.993l-.128.007a1 1 0 0 1-.117-1.993zM9.008 3.002a1 1 0 0 1 .117 1.993l-.127.007a1 1 0 0 1-.117-1.993z" /></svg>;
const Memo = memo(IconBoxAlignRightFilled);
export default Memo;