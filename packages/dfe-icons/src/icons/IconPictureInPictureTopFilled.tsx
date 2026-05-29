import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPictureInPictureTopFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-picture-in-picture-top" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M11 4a1 1 0 0 1 0 2H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 1 2 0v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" /><path d="M20 4a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></svg>;
const Memo = memo(IconPictureInPictureTopFilled);
export default Memo;