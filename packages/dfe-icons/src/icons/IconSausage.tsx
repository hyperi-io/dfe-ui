import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSausage = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-sausage" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5.5 5.5A2.5 2.5 0 0 0 3 8c0 7.18 5.82 13 13 13a2.5 2.5 0 1 0 0-5 8 8 0 0 1-8-8 2.5 2.5 0 0 0-2.5-2.5" /><path d="M5.195 5.519 3.952 3.53A1 1 0 0 1 4.8 2h1.392a1 1 0 0 1 .848 1.53L5.795 5.52M18.482 18.225l1.989-1.243a1 1 0 0 1 1.53.848v1.392a1 1 0 0 1-1.53.848l-1.991-1.245" /></svg>;
const Memo = memo(IconSausage);
export default Memo;