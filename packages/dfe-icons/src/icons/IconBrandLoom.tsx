import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandLoom = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-loom" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M17.464 6.518a6 6 0 1 0-3.023 7.965" /><path d="M17.482 17.464a6 6 0 1 0-7.965-3.023" /><path d="M6.54 17.482a6 6 0 1 0 3.024-7.965" /><path d="M6.518 6.54a6 6 0 1 0 7.965 3.024" /></svg>;
const Memo = memo(IconBrandLoom);
export default Memo;