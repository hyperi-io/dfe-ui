import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBoxAlignLeftFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-box-align-left" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M10.002 3.003h-5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5a1 1 0 0 0 1-1v-16a1 1 0 0 0-1-1M15.002 19.003a1 1 0 0 1 .117 1.993l-.127.007a1 1 0 0 1-.117-1.993zM20.003 19.003a1 1 0 0 1 .117 1.993l-.128.007a1 1 0 0 1-.117-1.993zM20.003 14.002a1 1 0 0 1 .117 1.993l-.128.007a1 1 0 0 1-.117-1.993zM20.003 8.002a1 1 0 0 1 .117 1.993l-.128.007a1 1 0 0 1-.117-1.993zM20.003 3.002a1 1 0 0 1 .117 1.993l-.128.007a1 1 0 0 1-.117-1.993zM15.002 3.002a1 1 0 0 1 .117 1.993l-.127.007a1 1 0 0 1-.117-1.993z" /></svg>;
const Memo = memo(IconBoxAlignLeftFilled);
export default Memo;