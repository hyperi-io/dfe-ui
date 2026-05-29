import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAlien = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-alien" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M11 17a2.5 2.5 0 0 0 2 0" /><path d="M12 3C7.336 3 4.604 5.331 4.138 8.595a11.82 11.82 0 0 0 2 8.592 10.8 10.8 0 0 0 3.199 3.064c1.666 1 3.664 1 5.33 0a10.8 10.8 0 0 0 3.199-3.064 11.9 11.9 0 0 0 2-8.592C19.4 5.33 16.668 3 12.004 3zM8 11l2 2M16 11l-2 2" /></svg>;
const Memo = memo(IconAlien);
export default Memo;