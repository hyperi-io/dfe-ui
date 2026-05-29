import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconZeppelinFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-zeppelin" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M13.5 3c5.187 0 9.5 3.044 9.5 7 0 3.017-2.508 5.503-6 6.514V20a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-4.046a21 21 0 0 1-2.66-1.411l-.13-.082-1.57 1.308a1 1 0 0 1-1.634-.656L3 15v-2.851l-.31-.25a47 47 0 0 1-.682-.568l-.67-.582a1 1 0 0 1 0-1.498A47 47 0 0 1 2.689 8.1L3 7.85V5a1 1 0 0 1 1.55-.836l.09.068 1.57 1.307.128-.08c2.504-1.553 4.784-2.378 6.853-2.453zm-2.499 13.657L11 19h4l.001-2.086Q14.266 17 13.5 17a9.6 9.6 0 0 1-2.13-.252z" /></svg>;
const Memo = memo(IconZeppelinFilled);
export default Memo;