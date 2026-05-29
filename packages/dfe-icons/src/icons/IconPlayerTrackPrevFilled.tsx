import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPlayerTrackPrevFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-player-track-prev" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m20.341 4.247-8 7a1 1 0 0 0 0 1.506l8 7c.647.565 1.659.106 1.659-.753V5c0-.86-1.012-1.318-1.659-.753M9.341 4.247l-8 7a1 1 0 0 0 0 1.506l8 7C9.988 20.318 11 19.859 11 19V5c0-.86-1.012-1.318-1.659-.753" /></svg>;
const Memo = memo(IconPlayerTrackPrevFilled);
export default Memo;