import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBoxAlignTop = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-box-align-top" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 10.005h16v-5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1zM4 15.005v-.01M4 20.005v-.01M9 20.005v-.01M15 20.005v-.01M20 20.005v-.01M20 15.005v-.01" /></svg>;
const Memo = memo(IconBoxAlignTop);
export default Memo;