import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconEyeglassFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-eyeglass" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M6.5 21A4.5 4.5 0 0 1 2 16.5v-2.518l.004-.071.014-.103.018-.076 3.006-10.02A1 1 0 0 1 6 3h2a1 1 0 1 1 0 2H6.743l-2.4 8H10a1 1 0 0 1 1 1v1h2v-1a1 1 0 0 1 1-1h5.656l-2.4-8H16a1 1 0 0 1-.993-.883L15 4a1 1 0 0 1 1-1h2a1 1 0 0 1 .958.713l3.01 10.036.022.112.008.08L22 16.5a4.5 4.5 0 0 1-8.972.5h-2.056A4.5 4.5 0 0 1 6.5 21" /></svg>;
const Memo = memo(IconEyeglassFilled);
export default Memo;