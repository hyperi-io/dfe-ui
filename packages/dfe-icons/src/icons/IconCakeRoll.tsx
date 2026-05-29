import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCakeRoll = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-cake-roll" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 15c-4.97 0-9-2.462-9-5.5S7.03 4 12 4s9 2.462 9 5.5-4.03 5.5-9 5.5" /><path d="M12 6.97c3 0 4 1.036 4 1.979 0 2.805-8 2.969-8-.99C8 5.849 9.5 4 12 4" /><path d="M21 9.333v5.334C21 17.612 16.97 20 12 20s-9-2.388-9-5.333V9.333" /></svg>;
const Memo = memo(IconCakeRoll);
export default Memo;