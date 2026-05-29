import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBinoculars = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-binoculars" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0M14 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0M16.346 9.17l-.729-1.261c-.16-.248-1.056-.203-1.117.091l-.177 1.38" /><path d="m19.761 14.813-2.84-5.133C16.732 9.37 16.329 9 15.5 9c-.828 0-1.5.448-1.5 1v6M7.654 9.17l.729-1.261C8.543 7.66 9.439 7.706 9.5 8l.177 1.38" /><path d="m4.239 14.813 2.84-5.133C7.268 9.37 7.671 9 8.5 9c.828 0 1.5.448 1.5 1v6M10 12h4v2h-4z" /></svg>;
const Memo = memo(IconBinoculars);
export default Memo;