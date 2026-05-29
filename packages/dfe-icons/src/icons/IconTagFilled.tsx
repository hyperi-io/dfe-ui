import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTagFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-tag" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M11.172 2a3 3 0 0 1 2.121.879l7.71 7.71a3.41 3.41 0 0 1 0 4.822l-5.592 5.592a3.41 3.41 0 0 1-4.822 0l-7.71-7.71A3 3 0 0 1 2 11.172V6a4 4 0 0 1 4-4zM7.5 5.5a2 2 0 0 0-1.995 1.85L5.5 7.5a2 2 0 1 0 2-2" /></svg>;
const Memo = memo(IconTagFilled);
export default Memo;