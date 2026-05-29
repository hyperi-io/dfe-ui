import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandTumblrFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-brand-tumblr" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M14 2a1 1 0 0 1 1 1v3h3a1 1 0 0 1 .993.883L19 7v4a1 1 0 0 1-1 1h-3v4h3a1 1 0 0 1 .993.883L19 17v4a1 1 0 0 1-1 1h-4a5 5 0 0 1-5-5v-5H6a1 1 0 0 1-.993-.883L5 11V7a1 1 0 0 1 1-1h1a2 2 0 0 0 2-2V3a1 1 0 0 1 1-1z" /></svg>;
const Memo = memo(IconBrandTumblrFilled);
export default Memo;