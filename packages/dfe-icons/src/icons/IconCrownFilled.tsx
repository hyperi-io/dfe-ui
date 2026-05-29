import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCrownFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-crown" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 19H5c-.5 0-.9-.3-1-.8l-2-10c0-.4.1-.8.5-1.1.4-.2.8-.2 1.1 0l4.1 3.3 3.4-5.1c.4-.6 1.3-.6 1.7 0l3.4 5.1 4.1-3.3c.3-.3.8-.3 1.1 0 .4.2.5.6.5 1.1l-2 10c0 .5-.5.8-1 .8z" /></svg>;
const Memo = memo(IconCrownFilled);
export default Memo;