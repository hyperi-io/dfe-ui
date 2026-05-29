import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAccessPoint = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-access-point" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 12v.01M14.828 9.172a4 4 0 0 1 0 5.656M17.657 6.343a8 8 0 0 1 0 11.314M9.168 14.828a4 4 0 0 1 0-5.656M6.337 17.657a8 8 0 0 1 0-11.314" /></svg>;
const Memo = memo(IconAccessPoint);
export default Memo;