import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandWish = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-wish" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m2 6 5.981 2.392-.639 6.037c-.18.893.06 1.819.65 2.514A3 3 0 0 0 10.373 18a4.33 4.33 0 0 0 4.132-3.57c-.18.893.06 1.819.65 2.514A3 3 0 0 0 17.535 18a4.33 4.33 0 0 0 4.132-3.57L22 9.797M14.504 14.429l.334-3" /></svg>;
const Memo = memo(IconBrandWish);
export default Memo;