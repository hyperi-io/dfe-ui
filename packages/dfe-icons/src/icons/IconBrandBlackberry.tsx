import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandBlackberry = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-blackberry" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 6a1 1 0 0 0-1-1H4l-.5 2H6a1 1 0 0 0 1-1M6 12a1 1 0 0 0-1-1H3l-.5 2H5a1 1 0 0 0 1-1M13 12a1 1 0 0 0-1-1h-2l-.5 2H12a1 1 0 0 0 1-1M14 6a1 1 0 0 0-1-1h-2l-.5 2H13a1 1 0 0 0 1-1M12 18a1 1 0 0 0-1-1H9l-.5 2H11a1 1 0 0 0 1-1M20 15a1 1 0 0 0-1-1h-2l-.5 2H19a1 1 0 0 0 1-1M21 9a1 1 0 0 0-1-1h-2l-.5 2H20a1 1 0 0 0 1-1" /></svg>;
const Memo = memo(IconBrandBlackberry);
export default Memo;