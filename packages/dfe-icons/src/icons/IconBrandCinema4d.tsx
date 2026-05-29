import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandCinema4d = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-cinema-4d" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9.65 6.956a5.39 5.39 0 0 0 7.494 7.495" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /><path d="M17.7 12.137A5.738 5.738 0 1 1 11.963 6.4" /><path d="M17.7 12.338v-1.175c0-.47.171-.92.476-1.253a1.56 1.56 0 0 1 1.149-.52c.827 0 1.523.676 1.62 1.573Q21 11.479 21 12M11.662 6.4h1.175c.47 0 .92-.176 1.253-.49s.52-.74.52-1.184c0-.852-.676-1.57-1.573-1.67A10 10 0 0 0 12 3" /></svg>;
const Memo = memo(IconBrandCinema4d);
export default Memo;