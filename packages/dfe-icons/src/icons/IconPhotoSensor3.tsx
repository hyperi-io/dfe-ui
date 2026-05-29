import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPhotoSensor3 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-photo-sensor-3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M17 4h1a2 2 0 0 1 2 2v1M20 17v1a2 2 0 0 1-2 2h-1M7 20H6a2 2 0 0 1-2-2v-1M4 7V6a2 2 0 0 1 2-2h1M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M12 18v2M4 12h2M12 4v2M20 12h-2" /></svg>;
const Memo = memo(IconPhotoSensor3);
export default Memo;