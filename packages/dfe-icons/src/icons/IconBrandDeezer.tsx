import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandDeezer = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-deezer" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 16.5h2v.5H3zM8 16.5h2.5v.5H8zM16 17h-2.5v-.5H16zM21.5 17H19v-.5h2.5zM21.5 13H19v.5h2.5zM21.5 9.5H19v.5h2.5zM21.5 6H19v.5h2.5zM16 13h-2.5v.5H16zM8 13.5h2.5V13H8zM8 9.5h2.5v.5H8z" /></svg>;
const Memo = memo(IconBrandDeezer);
export default Memo;