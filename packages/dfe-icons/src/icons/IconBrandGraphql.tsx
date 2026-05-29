import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandGraphql = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-graphql" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m4 8 8-5 8 5v8l-8 5-8-5z" /><path d="m12 4 7.5 12h-15z" /><path d="M11 3a1 1 0 1 0 2 0 1 1 0 0 0-2 0M11 21a1 1 0 1 0 2 0 1 1 0 0 0-2 0M3 8a1 1 0 1 0 2 0 1 1 0 0 0-2 0M3 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M19 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M19 8a1 1 0 1 0 2 0 1 1 0 0 0-2 0" /></svg>;
const Memo = memo(IconBrandGraphql);
export default Memo;