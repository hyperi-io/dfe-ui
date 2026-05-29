import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAtom2 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-atom-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M12 21v.01M3 9v.01M21 9v.01M8 20.1A9 9 0 0 1 3 13M16 20.1a9 9 0 0 0 5-7.1M6.2 5a9 9 0 0 1 11.4 0" /></svg>;
const Memo = memo(IconAtom2);
export default Memo;