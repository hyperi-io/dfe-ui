import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBoxAlignLeft = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-box-align-left" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10.002 20.003v-16h-5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1zM15.002 20.003h-.01M20.003 20.003h-.011M20.003 15.002h-.011M20.003 9.002h-.011M20.003 4.002h-.011M15.002 4.002h-.01" /></svg>;
const Memo = memo(IconBoxAlignLeft);
export default Memo;