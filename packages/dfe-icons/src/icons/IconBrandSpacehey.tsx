import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandSpacehey = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-spacehey" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M15 6a2 2 0 1 0 4 0 2 2 0 1 0-4 0M14 20h6v-6a3 3 0 0 0-6 0zM11 8v2.5A3.5 3.5 0 0 1 7.5 14H7a3 3 0 0 1 0-6z" /></svg>;
const Memo = memo(IconBrandSpacehey);
export default Memo;