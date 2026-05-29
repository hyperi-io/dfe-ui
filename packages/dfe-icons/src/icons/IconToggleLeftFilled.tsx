import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconToggleLeftFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-toggle-left" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M8 9a3 3 0 1 1-3 3l.005-.176A3 3 0 0 1 8 9" /><path d="M16 5a7 7 0 0 1 0 14H8A7 7 0 0 1 8 5zm0 2H8a5 5 0 1 0 0 10h8a5 5 0 0 0 0-10" /></svg>;
const Memo = memo(IconToggleLeftFilled);
export default Memo;