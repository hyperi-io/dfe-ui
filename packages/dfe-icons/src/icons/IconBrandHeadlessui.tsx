import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandHeadlessui = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-headlessui" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m6.744 4.325 7.82-1.267a4.456 4.456 0 0 1 5.111 3.686l1.267 7.82a4.456 4.456 0 0 1-3.686 5.111l-7.82 1.267a4.456 4.456 0 0 1-5.111-3.686l-1.267-7.82a4.456 4.456 0 0 1 3.686-5.111" /><path d="m7.252 7.704 7.897-1.28a1 1 0 0 1 1.147.828l.36 2.223-9.562 3.51-.67-4.134a1 1 0 0 1 .828-1.147" /></svg>;
const Memo = memo(IconBrandHeadlessui);
export default Memo;