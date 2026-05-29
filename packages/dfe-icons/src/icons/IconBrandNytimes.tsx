import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandNytimes = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-nytimes" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M11.036 5.058a8 8 0 1 0 8.706 9.965" /><path d="M12 21V10l-7.5 4M17.5 3a2.5 2.5 0 1 1 0 5l-11-5a2.5 2.5 0 0 0-.67 4.91M9 12v8M16 13h-.01" /></svg>;
const Memo = memo(IconBrandNytimes);
export default Memo;