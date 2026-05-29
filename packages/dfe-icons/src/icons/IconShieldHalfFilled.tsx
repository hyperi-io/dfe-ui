import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconShieldHalfFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-shield-half" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m11.998 2 .032.002.086.005a1 1 0 0 1 .342.104l.105.062.097.076.016.015.247.21a11 11 0 0 0 7.189 2.537l.342-.01a1 1 0 0 1 1.005.717 13 13 0 0 1-9.208 16.25 1 1 0 0 1-.502 0A13 13 0 0 1 2.54 5.718a1 1 0 0 1 1.005-.717 11 11 0 0 0 7.791-2.75l.046-.036.053-.041a1 1 0 0 1 .217-.112l.075-.023.036-.01a1 1 0 0 1 .12-.022l.086-.005zM12 4.296l-.176.135a13 13 0 0 1-7.288 2.572l-.264.006-.064.31a11 11 0 0 0 1.064 7.175l.17.314a11 11 0 0 0 6.49 5.136l.068.019z" /></svg>;
const Memo = memo(IconShieldHalfFilled);
export default Memo;