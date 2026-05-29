import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAmpersand = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-ampersand" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M19 20 8.597 9.028a2.95 2.95 0 0 1 0-4.165 2.94 2.94 0 0 1 4.161 0 2.95 2.95 0 0 1 0 4.165l-4.68 4.687a3.685 3.685 0 0 0 0 5.207 3.675 3.675 0 0 0 5.2 0L19 13" /></svg>;
const Memo = memo(IconAmpersand);
export default Memo;