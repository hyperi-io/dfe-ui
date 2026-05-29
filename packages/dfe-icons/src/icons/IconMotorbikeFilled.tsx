import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMotorbikeFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-motorbike" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M15 5a1 1 0 0 1 .894.553l3.225 6.449.08.003A4 4 0 1 1 15 16l.005-.2a4 4 0 0 1 2.111-3.33l-.557-1.115-3.352 3.352A1 1 0 0 1 12.5 15H8.874q.124.481.126 1a4 4 0 1 1-8 0l.005-.2a4 4 0 0 1 6.33-3.049L9.084 11H6a1 1 0 0 1-.993-.883L5 10a1 1 0 0 1 1-1h9.381l-1-2H13a1 1 0 0 1-.993-.883L12 6a1 1 0 0 1 1-1z" /></svg>;
const Memo = memo(IconMotorbikeFilled);
export default Memo;