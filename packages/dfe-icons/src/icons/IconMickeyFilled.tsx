import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMickeyFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-mickey" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M18.501 2a4.5 4.5 0 0 1 .878 8.913 8 8 0 1 1-15.374 3.372L4 14l.005-.285a8 8 0 0 1 .615-2.803 4.5 4.5 0 0 1-3.187-6.348 4.5 4.5 0 0 1 3.596-2.539l.225-.018L5.535 2l.244.009a4.5 4.5 0 0 1 4.215 4.247 8 8 0 0 1 4.013 0A4.5 4.5 0 0 1 18.5 2z" /></svg>;
const Memo = memo(IconMickeyFilled);
export default Memo;