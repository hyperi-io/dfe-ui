import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBarbellFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-barbell" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M4 7a1 1 0 0 1 1 1v8a1 1 0 0 1-2 0v-3H2a1 1 0 0 1 0-2h1V8a1 1 0 0 1 1-1M20 7a1 1 0 0 1 1 1v3h1a1 1 0 0 1 0 2h-1v3a1 1 0 0 1-2 0V8a1 1 0 0 1 1-1M16 5a2 2 0 0 1 2 2v10a2 2 0 1 1-4 0v-4h-4v4a2 2 0 1 1-4 0V7a2 2 0 1 1 4 0v4h4V7a2 2 0 0 1 2-2" /></svg>;
const Memo = memo(IconBarbellFilled);
export default Memo;