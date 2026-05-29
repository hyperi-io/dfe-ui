import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconColorSwatch = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-color-swatch" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M19 3h-4a2 2 0 0 0-2 2v12a4 4 0 0 0 8 0V5a2 2 0 0 0-2-2" /><path d="m13 7.35-2-2a2 2 0 0 0-2.828 0L5.344 8.178a2 2 0 0 0 0 2.828l9 9" /><path d="M7.3 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h12M17 17v.01" /></svg>;
const Memo = memo(IconColorSwatch);
export default Memo;