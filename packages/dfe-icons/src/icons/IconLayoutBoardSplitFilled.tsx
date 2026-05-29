import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLayoutBoardSplitFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-layout-board-split" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M5 3h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2M14 3h5a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1M13 11a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1zM14 16h6a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2h-5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1M4 13h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-5a1 1 0 0 1 1-1" /></svg>;
const Memo = memo(IconLayoutBoardSplitFilled);
export default Memo;