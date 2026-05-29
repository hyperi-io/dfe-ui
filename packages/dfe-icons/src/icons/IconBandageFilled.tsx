import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBandageFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-bandage" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M20.207 3.793a5.95 5.95 0 0 1 .179 8.228l-.179.186-8 8a5.95 5.95 0 0 1-8.593-8.228l.179-.186 8-8a5.95 5.95 0 0 1 8.414 0M12 13a1 1 0 0 0-1 1l.007.127A1 1 0 0 0 13 14.01l-.007-.127A1 1 0 0 0 12 13m2-2a1 1 0 0 0-1 1l.007.127A1 1 0 0 0 15 12.01l-.007-.127A1 1 0 0 0 14 11m-4 0a1 1 0 0 0-1 1l.007.127A1 1 0 0 0 11 12.01l-.007-.127A1 1 0 0 0 10 11m2-2a1 1 0 0 0-1 1l.007.127A1 1 0 0 0 13 10.01l-.007-.127A1 1 0 0 0 12 9" /></svg>;
const Memo = memo(IconBandageFilled);
export default Memo;