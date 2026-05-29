import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconClockHour1Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-clock-hour-1" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34m-5.401 9.576.052.021.08.026.08.019.072.011L12 13l.076-.003.135-.02.082-.02.103-.039.073-.035.078-.046.06-.042.08-.069.083-.088.062-.083 2-3a1 1 0 1 0-1.664-1.11L13 8.696V7a1 1 0 0 0-.883-.993L12 6a1 1 0 0 0-1 1v5.026l.009.105.02.107.04.129.048.102.046.078.042.06.069.08.088.083.083.062.09.053z" /></svg>;
const Memo = memo(IconClockHour1Filled);
export default Memo;