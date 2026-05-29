import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandDingtalk = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-dingtalk" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0" /><path d="m8 7.5 7.02 2.632a1 1 0 0 1 .567 1.33L14.5 14H16l-5 4 1-4c-3.1.03-3.114-3.139-4-6.5" /></svg>;
const Memo = memo(IconBrandDingtalk);
export default Memo;