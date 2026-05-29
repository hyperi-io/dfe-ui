import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWomanFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-woman" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M14 8c1.91 0 3.79.752 5.625 2.219a1 1 0 1 1-1.25 1.562c-1.019-.815-2.016-1.345-2.997-1.6l1.584 5.544A1 1 0 0 1 16 17h-1v4a1 1 0 0 1-2 0v-4h-2v4a1 1 0 0 1-2 0v-4H8a1 1 0 0 1-.962-1.275l1.584-5.545c-.98.256-1.978.786-2.997 1.601a1 1 0 1 1-1.25-1.562c1.733-1.386 3.506-2.133 5.307-2.212L10.017 8zM12 1a3 3 0 1 1-3 3l.005-.176A3 3 0 0 1 12 1" /></svg>;
const Memo = memo(IconWomanFilled);
export default Memo;