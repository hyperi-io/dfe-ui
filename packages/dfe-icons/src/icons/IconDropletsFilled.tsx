import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDropletsFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-droplets" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M6 12.003c.541 0 1.045.273 1.342.727l2.122 3.273a3.999 3.999 0 0 1-6.035 5.063c-1.487-1.248-1.864-3.382-.867-5.11L4.66 12.73A1.6 1.6 0 0 1 6 12.003M18 12.003c.541 0 1.045.273 1.342.727l2.122 3.273a3.999 3.999 0 0 1-6.035 5.063c-1.487-1.248-1.864-3.382-.867-5.11l2.098-3.227a1.6 1.6 0 0 1 1.34-.726M12 2.003c.541 0 1.045.273 1.342.727l2.122 3.273a3.999 3.999 0 0 1-6.035 5.063c-1.487-1.248-1.864-3.382-.867-5.11L10.66 2.73A1.6 1.6 0 0 1 12 2.003" /></svg>;
const Memo = memo(IconDropletsFilled);
export default Memo;