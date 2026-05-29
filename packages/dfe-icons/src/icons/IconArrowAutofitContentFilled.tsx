import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArrowAutofitContentFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-arrow-autofit-content" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M6.707 3.293a1 1 0 0 1 .083 1.32l-.083.094L5.415 6H10a1 1 0 0 1 .117 1.993L10 8H5.415l1.292 1.293a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.32.083l-.094-.083-3-3a1 1 0 0 1-.097-.112l-.071-.11-.054-.114-.035-.105-.025-.118-.007-.058L2 7l.003-.075.017-.126.03-.111.044-.111.052-.098.064-.092.083-.094 3-3a1 1 0 0 1 1.414 0M18.613 3.21l.094.083 3 3a1 1 0 0 1 .097.112l.071.11.054.114.035.105.03.148L22 7l-.003.075-.017.126-.03.111-.044.111-.052.098-.074.104-.073.082-3 3a1 1 0 0 1-1.497-1.32l.083-.094L18.585 8H14a1 1 0 0 1-.117-1.993L14 6h4.585l-1.292-1.293a1 1 0 0 1-.083-1.32l.083-.094a1 1 0 0 1 1.32-.083M18 13H6a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3" /></svg>;
const Memo = memo(IconArrowAutofitContentFilled);
export default Memo;