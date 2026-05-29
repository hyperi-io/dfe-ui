import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTelescope = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-telescope" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m6 21 6-5 6 5M12 13v8M3.294 13.678l.166.281c.52.88 1.624 1.265 2.605.91l14.242-5.165a1.023 1.023 0 0 0 .565-1.456l-2.62-4.705a1.087 1.087 0 0 0-1.447-.42l-.056.032-12.694 7.618c-1.02.613-1.357 1.897-.76 2.905zM14 5l3 5.5" /></svg>;
const Memo = memo(IconTelescope);
export default Memo;