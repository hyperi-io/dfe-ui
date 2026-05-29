import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBoxMultipleFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-box-multiple" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M6 5.667A3.667 3.667 0 0 1 9.667 2h8.666A3.667 3.667 0 0 1 22 5.667v8.666A3.667 3.667 0 0 1 18.333 18H9.667A3.667 3.667 0 0 1 6 14.333z" /><path d="M2 9c0-1.094.533-1.828 1.514-2.374a1 1 0 1 1 .972 1.748C4.088 8.595 4 8.716 4 9v10c0 .548.452 1 1 1h9.998c.32 0 .618-.154.805-.407l.065-.1a1 1 0 1 1 1.738.99A3 3 0 0 1 15 22H5c-1.652 0-3-1.348-3-3z" /></svg>;
const Memo = memo(IconBoxMultipleFilled);
export default Memo;