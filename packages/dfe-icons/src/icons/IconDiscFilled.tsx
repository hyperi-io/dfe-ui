import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDiscFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-disc" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34M17 11a1 1 0 0 0-1 1 4 4 0 0 1-4 4 1 1 0 0 0 0 2 6 6 0 0 0 6-6 1 1 0 0 0-1-1m-5-1a2 2 0 0 0-1.995 1.85L10 12a2 2 0 1 0 2-2m0-4a6 6 0 0 0-6 6 1 1 0 0 0 2 0 4 4 0 0 1 4-4 1 1 0 0 0 0-2" /></svg>;
const Memo = memo(IconDiscFilled);
export default Memo;