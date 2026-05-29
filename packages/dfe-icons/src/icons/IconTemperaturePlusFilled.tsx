import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTemperaturePlusFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-temperature-plus" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M10 2a3 3 0 0 1 3 3v7.965l.075.056a5 5 0 0 1 1.81 5.01l-.055.227a5 5 0 1 1-7.905-5.237L7 12.965V5a3 3 0 0 1 2.824-2.995zm9 3a1 1 0 0 1 1 1v2h2a1 1 0 0 1 0 2h-2v2a1 1 0 0 1-2 0v-2h-2a1 1 0 0 1 0-2h2V6a1 1 0 0 1 1-1m-9-1a1 1 0 0 0-1 1v4h2V5a1 1 0 0 0-1-1" /></svg>;
const Memo = memo(IconTemperaturePlusFilled);
export default Memo;