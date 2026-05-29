import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandZulip = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-zulip" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M6.5 3h11C18.825 3 20 4 20 5.5c0 2-1.705 3.264-2 3.5l-4.5 4 2-5h-9a2.5 2.5 0 0 1 0-5" /><path d="M17.5 21h-11C5.175 21 4 20 4 18.5c0-2 1.705-3.264 2-3.5l4.5-4-2 5h9a2.5 2.5 0 1 1 0 5" /></svg>;
const Memo = memo(IconBrandZulip);
export default Memo;