import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconInnerShadowBottomFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-inner-shadow-bottom" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M5.144 4.72c3.92-3.695 10.093-3.625 13.927.209 3.905 3.905 3.905 10.237 0 14.142s-10.237 3.905-14.142 0-3.905-10.237 0-14.142zm3.32 10.816A1 1 0 1 0 7.05 16.95a7 7 0 0 0 9.9 0 1 1 0 0 0-1.414-1.414 5 5 0 0 1-7.072 0" /></svg>;
const Memo = memo(IconInnerShadowBottomFilled);
export default Memo;