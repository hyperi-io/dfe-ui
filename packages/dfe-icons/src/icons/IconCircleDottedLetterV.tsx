import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCircleDottedLetterV = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-circle-dotted-letter-v" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m10 8 2 8 2-8M7.5 4.21v.01M4.21 7.5v.01M3 12v.01M4.21 16.5v.01M7.5 19.79v.01M12 21v.01M16.5 19.79v.01M19.79 16.5v.01M21 12v.01M19.79 7.5v.01M16.5 4.21v.01M12 3v.01" /></svg>;
const Memo = memo(IconCircleDottedLetterV);
export default Memo;