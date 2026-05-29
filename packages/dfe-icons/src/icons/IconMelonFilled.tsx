import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMelonFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-melon" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M16.77 2.62a1 1 0 0 1 1.436.055A10.96 10.96 0 0 1 21 10.001C21 16.075 16.075 21 10.001 21a10.97 10.97 0 0 1-7.684-3.127 1 1 0 0 1 .008-1.438l4.343-4.153a1 1 0 0 1 1.352-.027 3 3 0 0 0 4.32-4.133 1 1 0 0 1 .088-1.35z" /></svg>;
const Memo = memo(IconMelonFilled);
export default Memo;