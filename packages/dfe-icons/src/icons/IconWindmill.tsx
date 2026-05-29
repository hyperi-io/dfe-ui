import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWindmill = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-windmill" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 12c2.76 0 5-2.01 5-4.5S14.76 3 12 3zM12 12c0 2.76 2.01 5 4.5 5s4.5-2.24 4.5-5zM12 12c-2.76 0-5 2.01-5 4.5S9.24 21 12 21zM12 12c0-2.76-2.01-5-4.5-5S3 9.24 3 12z" /></svg>;
const Memo = memo(IconWindmill);
export default Memo;