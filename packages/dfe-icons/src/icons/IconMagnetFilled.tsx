import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMagnetFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-magnet" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M21 9v4a9 9 0 0 1-18 0V9h7v4a2 2 0 1 0 4 0V9zm-3-7a3 3 0 0 1 3 3v2h-7V5a3 3 0 0 1 3-3zM7 2a3 3 0 0 1 3 3v2H3V5a3 3 0 0 1 3-3z" /></svg>;
const Memo = memo(IconMagnetFilled);
export default Memo;