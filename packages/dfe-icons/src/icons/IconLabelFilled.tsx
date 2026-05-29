import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLabelFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-label" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M16.52 6a2 2 0 0 1 1.561.75l3.7 4.625a1 1 0 0 1 0 1.25l-3.7 4.624A2 2 0 0 1 16.52 18H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" /></svg>;
const Memo = memo(IconLabelFilled);
export default Memo;