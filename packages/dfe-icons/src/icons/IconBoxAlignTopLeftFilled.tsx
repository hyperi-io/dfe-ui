import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBoxAlignTopLeftFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-box-align-top-left" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M10 3H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2M15 3a1 1 0 0 1 .117 1.993L14.99 5a1 1 0 0 1-.117-1.993zM20 3a1 1 0 0 1 .117 1.993L19.99 5a1 1 0 0 1-.117-1.993zM20 8a1 1 0 0 1 .117 1.993L19.99 10a1 1 0 0 1-.117-1.993zM20 14a1 1 0 0 1 .117 1.993L19.99 16a1 1 0 0 1-.117-1.993zM4 14a1 1 0 0 1 .117 1.993L3.99 16a1 1 0 0 1-.117-1.993zM20 19a1 1 0 0 1 .117 1.993L19.99 21a1 1 0 0 1-.117-1.993zM15 19a1 1 0 0 1 .117 1.993L14.99 21a1 1 0 0 1-.117-1.993zM9 19a1 1 0 0 1 .117 1.993L8.99 21a1 1 0 0 1-.117-1.993zM4 19a1 1 0 0 1 .117 1.993L3.99 21a1 1 0 0 1-.117-1.993z" /></svg>;
const Memo = memo(IconBoxAlignTopLeftFilled);
export default Memo;