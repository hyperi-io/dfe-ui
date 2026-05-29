import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBusFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-bus" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 4c3.4 0 6 3.64 6 8v5a1 1 0 0 1-1 1h-1.171a3.001 3.001 0 0 1-5.658 0H8.829a3.001 3.001 0 0 1-5.658 0H2a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2zM6 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2m12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-.76-9.989L18.308 11h2.636c-.313-2.756-1.895-4.82-3.704-4.989M6 6H3v3h3zm5 0H8v3h3zm4.191 0H13v3h2.834z" /></svg>;
const Memo = memo(IconBusFilled);
export default Memo;