import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFileHorizontalFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-file-horizontal" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m22 12-.007-.117a1 1 0 0 0-.876-.876L21 11h-4l-.15-.005a2 2 0 0 1-1.844-1.838L15 9V5l-.007-.117a1 1 0 0 0-.876-.876L14 4H5a3 3 0 0 0-2.995 2.824L2 7v10a3 3 0 0 0 2.824 2.995L5 20h14a3 3 0 0 0 2.995-2.824L22 17z" /><path d="M17 5v4l4.001.001z" /></svg>;
const Memo = memo(IconFileHorizontalFilled);
export default Memo;