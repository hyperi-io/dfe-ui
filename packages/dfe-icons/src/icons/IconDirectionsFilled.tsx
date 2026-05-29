import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDirectionsFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-directions" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M10 22a1 1 0 0 1 0-2h1v-2.001L6 18a1 1 0 0 1-.707-.293l-2-2a1 1 0 0 1 0-1.414l2-2A1 1 0 0 1 6 12l5-.001V10H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V3a1 1 0 0 1 2 0v1h6a1 1 0 0 1 .707.293l2 2a1 1 0 0 1 0 1.414l-2 2A1 1 0 0 1 19 10h-6v1.999L14 12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1l-1-.001V20h1a1 1 0 0 1 0 2z" /></svg>;
const Memo = memo(IconDirectionsFilled);
export default Memo;