import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFileNeutralFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-file-neutral" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m12 2 .117.007a1 1 0 0 1 .876.876L13 3v4l.005.15a2 2 0 0 0 1.838 1.844L15 9h4l.117.007a1 1 0 0 1 .876.876L20 10v9a3 3 0 0 1-2.824 2.995L17 22H7a3 3 0 0 1-2.995-2.824L4 19V5a3 3 0 0 1 2.824-2.995L7 2zm2 14h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2m-3.995-4h-.01a1 1 0 0 0 0 2h.01a1 1 0 0 0 0-2m4 0h-.01a1 1 0 0 0 0 2h.01a1 1 0 0 0 0-2" /><path d="M19 7h-4l-.001-4.001z" /></svg>;
const Memo = memo(IconFileNeutralFilled);
export default Memo;