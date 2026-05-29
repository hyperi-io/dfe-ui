import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDiamondsFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-diamonds" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 2.005c-.777 0-1.508.367-1.971.99L4.667 9.89c-.89 1.136-.89 3.083 0 4.227l5.375 6.911a2.457 2.457 0 0 0 3.93-.017l5.361-6.894c.89-1.136.89-3.083 0-4.227l-5.375-6.911A2.45 2.45 0 0 0 12 2.005" /></svg>;
const Memo = memo(IconDiamondsFilled);
export default Memo;