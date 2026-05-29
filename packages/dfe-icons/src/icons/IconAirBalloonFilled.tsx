import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAirBalloonFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-air-balloon" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M13 18a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2zM12 1a7 7 0 0 1 7 7c0 4.185-3.297 9-7 9s-7-4.815-7-9a7 7 0 0 1 7-7" /></svg>;
const Memo = memo(IconAirBalloonFilled);
export default Memo;