import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandOpenSourceFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-brand-open-source" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12.283 2.004a10 10 0 0 1 3.736 19.155 1 1 0 0 1-1.332-.551l-2.193-5.602a1 1 0 0 1 .456-1.245 2 2 0 1 0-1.9 0 1 1 0 0 1 .457 1.244l-2.193 5.603a1 1 0 0 1-1.332.552A10 10 0 0 1 12 2z" /></svg>;
const Memo = memo(IconBrandOpenSourceFilled);
export default Memo;