import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWorldPause = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-world-pause" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M20.945 12.997a9 9 0 1 0-7.928 7.945M3.6 9h16.8M3.6 15h9.9" /><path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 2.51 10.526M17 17v5M21 17v5" /></svg>;
const Memo = memo(IconWorldPause);
export default Memo;