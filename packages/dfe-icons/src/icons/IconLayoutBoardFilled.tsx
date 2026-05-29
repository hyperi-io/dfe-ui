import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLayoutBoardFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-layout-board" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M5 3h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2M14 3h5a2 2 0 0 1 2 2v8a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1M14 16h6a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2h-5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1M4 10h6a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-8a1 1 0 0 1 1-1" /></svg>;
const Memo = memo(IconLayoutBoardFilled);
export default Memo;