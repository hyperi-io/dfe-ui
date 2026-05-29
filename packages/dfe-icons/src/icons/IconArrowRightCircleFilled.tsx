import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArrowRightCircleFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-arrow-right-circle" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M5 15a3 3 0 0 1-3-3l.005-.176A3 3 0 0 1 7.83 11h10.756l-1.292-1.293a1 1 0 0 1-.083-1.32l.083-.094a1 1 0 0 1 1.414 0l3 3 .097.112.071.11.031.062.034.081.024.076.03.148L22 12l-.004.085-.016.116-.03.111-.044.111-.052.098-.074.104-.073.082-3 3a1 1 0 0 1-1.414-1.414L18.585 13H7.829A3 3 0 0 1 5 15" /></svg>;
const Memo = memo(IconArrowRightCircleFilled);
export default Memo;