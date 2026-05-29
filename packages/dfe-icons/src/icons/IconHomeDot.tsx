import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHomeDot = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-home-dot" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M19 12h2l-9-9-9 9h2v7a2 2 0 0 0 2 2h5M16 19a3 3 0 1 0 6 0 3 3 0 1 0-6 0" /><path d="M9 21v-6a2 2 0 0 1 2-2h2c.641 0 1.212.302 1.578.771" /></svg>;
const Memo = memo(IconHomeDot);
export default Memo;