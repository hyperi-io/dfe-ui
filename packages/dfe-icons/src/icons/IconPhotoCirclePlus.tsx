import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPhotoCirclePlus = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-photo-circle-plus" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M15 8h.01M20.964 12.806A9 9 0 0 0 12 3a9 9 0 0 0-9 9 9 9 0 0 0 9.397 8.991" /><path d="m4 15 4-4c.928-.893 2.072-.893 3 0l4 4" /><path d="m14 14 1-1c.928-.893 2.072-.893 3 0M16 19.33h6M19 16.33v6" /></svg>;
const Memo = memo(IconPhotoCirclePlus);
export default Memo;