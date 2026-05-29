import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLanguageOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-language-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m12 20 2.463-5.541m1.228-2.764L16 11l.8 1.8M18 18h-5.1M8.747 8.748C8.087 11.582 6.211 13 4 13M4 6.371h2.371" /><path d="M5 9c0 2.144 2.252 3.908 6 4M3 3l18 18" /></svg>;
const Memo = memo(IconLanguageOff);
export default Memo;