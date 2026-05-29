import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBoneOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-bone-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m12.5 8.502.38-.38A3 3 0 1 1 18 6a3 3 0 1 1-2.12 5.122l-.372.372M13.5 13.502l-2.378 2.378a3 3 0 1 1-5.117 2.297V18h-.176a3 3 0 1 1 2.298-5.115l2.378-2.378M3 3l18 18" /></svg>;
const Memo = memo(IconBoneOff);
export default Memo;