import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArrowRightRhombusFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-arrow-right-rhombus" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m18.707 8.293 3 3 .097.112.071.11.031.062.034.081.024.076.03.148L22 12l-.004.085-.016.116-.03.111-.044.111-.052.098-.074.104-.073.082-3 3a1 1 0 0 1-1.414-1.414L18.585 13H8.414l-2.207 2.207a1 1 0 0 1-1.414 0l-2.5-2.5a1 1 0 0 1 0-1.414l2.5-2.5a1 1 0 0 1 1.414 0L8.415 11h10.17l-1.292-1.293a1 1 0 0 1-.083-1.32l.083-.094a1 1 0 0 1 1.414 0" /></svg>;
const Memo = memo(IconArrowRightRhombusFilled);
export default Memo;