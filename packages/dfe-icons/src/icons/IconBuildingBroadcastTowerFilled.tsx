import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBuildingBroadcastTowerFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-building-broadcast-tower" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 10a2 2 0 0 1 1.497 3.327l2.452 7.357a1 1 0 1 1-1.898.632L13.611 20h-3.224l-.438 1.317a1 1 0 0 1-1.152.663l-.113-.03a1 1 0 0 1-.633-1.265l2.452-7.357A2 2 0 0 1 10 12l.005-.15A2 2 0 0 1 12 10" /><path d="M18.093 4.078a10 10 0 0 1 3.137 11.776 1 1 0 0 1-1.846-.77 8 8 0 1 0-14.769 0 1 1 0 0 1-1.846.77A10 10 0 0 1 18.093 4.078" /><path d="M15.657 7.243a6 6 0 0 1 1.882 7.066 1 1 0 1 1-1.846-.77 4 4 0 1 0-7.384 0 1 1 0 1 1-1.846.77 6 6 0 0 1 9.194-7.066" /></svg>;
const Memo = memo(IconBuildingBroadcastTowerFilled);
export default Memo;