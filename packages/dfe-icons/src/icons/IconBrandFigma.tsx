import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandFigma = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-figma" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0" /><path d="M6 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3 3 3 0 0 1-3 3H9a3 3 0 0 1-3-3" /><path d="M9 9a3 3 0 0 0 0 6h3m-3 0a3 3 0 1 0 3 3V3" /></svg>;
const Memo = memo(IconBrandFigma);
export default Memo;