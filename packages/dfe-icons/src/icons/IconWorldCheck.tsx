import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWorldCheck = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-world-check" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M20.946 12.99a9 9 0 1 0-9.46 7.995M3.6 9h16.8M3.6 15h13.9" /><path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 2.311 12.001M15 19l2 2 4-4" /></svg>;
const Memo = memo(IconWorldCheck);
export default Memo;