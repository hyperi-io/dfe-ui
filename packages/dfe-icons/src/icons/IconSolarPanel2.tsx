import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSolarPanel2 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-solar-panel-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 2a4 4 0 1 0 8 0M4 3h1M19 3h1M12 9v1M17.2 7.2l.707.707M6.8 7.2l-.7.7M4.28 21h15.44a1 1 0 0 0 .97-1.243l-1.5-6a1 1 0 0 0-.97-.757H5.78a1 1 0 0 0-.97.757l-1.5 6A1 1 0 0 0 4.28 21M4 17h16M10 13l-1 8M14 13l1 8" /></svg>;
const Memo = memo(IconSolarPanel2);
export default Memo;