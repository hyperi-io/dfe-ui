import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBubbleTea = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-bubble-tea" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m17.95 9-1.478 8.69c-.25 1.463-.374 2.195-.936 2.631-1.2.931-6.039.88-7.172 0-.562-.436-.687-1.168-.936-2.632L5.95 9M6 9l.514-1.286a5.908 5.908 0 0 1 10.972 0L18 9M5 9h14M12 9l4-7M10.01 14h.01M11.02 18h.01M13.02 16h.01" /></svg>;
const Memo = memo(IconBubbleTea);
export default Memo;