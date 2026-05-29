import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSpadeFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-spade" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M11.327 2.26a1395 1395 0 0 0-4.923 4.504c-.626.6-1.212 1.21-1.774 1.843a6.53 6.53 0 0 0-.314 8.245l.14.177c1.012 1.205 2.561 1.755 4.055 1.574l.246-.037-.706 2.118A1 1 0 0 0 9 22h6l.118-.007a1 1 0 0 0 .83-1.31l-.688-2.065.104.02c1.589.25 3.262-.387 4.32-1.785a6.53 6.53 0 0 0-.311-8.243 32 32 0 0 0-1.76-1.83l-4.938-4.518a1 1 0 0 0-1.348-.001z" /></svg>;
const Memo = memo(IconSpadeFilled);
export default Memo;