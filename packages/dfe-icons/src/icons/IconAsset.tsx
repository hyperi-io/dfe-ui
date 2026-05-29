import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAsset = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-asset" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 15a6 6 0 1 0 12 0 6 6 0 1 0-12 0" /><path d="M7 15a2 2 0 1 0 4 0 2 2 0 1 0-4 0M17 5a2 2 0 1 0 4 0 2 2 0 1 0-4 0M14.218 17.975l6.619-12.174M6.079 9.756l12.217-6.631" /><path d="M7 15a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /></svg>;
const Memo = memo(IconAsset);
export default Memo;