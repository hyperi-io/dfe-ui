import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMoodAngryFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-mood-angry" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a10 10 0 1 1 0-20m0 12a4.5 4.5 0 0 0-3.214 1.35 1 1 0 1 0 1.428 1.4 2.5 2.5 0 0 1 3.572 0 1 1 0 0 0 1.428-1.4A4.5 4.5 0 0 0 12 14M8.447 8.105a1 1 0 0 0-.894 1.788l2 1a1 1 0 0 0 .894-1.788zm8.447.447a1 1 0 0 0-1.341-.447l-2 1a1 1 0 0 0 .894 1.788l2-1a1 1 0 0 0 .447-1.341" /></svg>;
const Memo = memo(IconMoodAngryFilled);
export default Memo;