import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandKbin = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-kbin" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><g strokeWidth={1.838}><path d="M10.586 9.506h-2.43C7.722 8.574 7.456 8 6.56 8l-2.404.019c-.662 0-1.353.592-1.103 1.487l2.216 9.436C5.755 20.685 6.08 21 6.414 21h.64" /><path d="M14.275 3h5.645c.84 0 1.24.714 1.02 1.287l-4.687 15.109c-.42 1.133-1.159 1.603-2.354 1.603H6.414c.39 0 .76-.618 1.296-2.061l4.457-14.49c.326-.83.76-1.448 2.108-1.448" /></g></svg>;
const Memo = memo(IconBrandKbin);
export default Memo;