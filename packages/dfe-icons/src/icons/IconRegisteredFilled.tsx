import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconRegisteredFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-registered" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34M12 8h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1l.117-.007A1 1 0 0 0 11 15v-1h.585l1.708 1.707a1 1 0 0 0 1.414-1.414l-.9-.899A3 3 0 0 0 12 8m0 2a1 1 0 0 1 0 2h-1v-2z" /></svg>;
const Memo = memo(IconRegisteredFilled);
export default Memo;