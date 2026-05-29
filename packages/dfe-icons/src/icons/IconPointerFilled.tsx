import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPointerFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-pointer" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M3.039 4.277 6.943 17.84c.185.837.92 1.516 1.831 1.642l.17.016a2.2 2.2 0 0 0 1.982-1.006l.045-.078 1.4-2.072 4.05 4.05a2.067 2.067 0 0 0 2.924 0l1.047-1.047c.388-.388.606-.913.606-1.461l-.008-.182a2.07 2.07 0 0 0-.598-1.28l-4.047-4.048 2.103-1.412c.726-.385 1.18-1.278 1.053-2.189A2.2 2.2 0 0 0 17.8 6.928L4.276 3.038a1 1 0 0 0-1.236 1.24z" /></svg>;
const Memo = memo(IconPointerFilled);
export default Memo;