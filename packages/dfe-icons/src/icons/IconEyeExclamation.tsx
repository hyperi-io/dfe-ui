import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconEyeExclamation = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-eye-exclamation" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0" /><path d="M15.03 17.478A8.8 8.8 0 0 1 12 18q-5.4 0-9-6 3.6-6 9-6t9 6a21 21 0 0 1-.258.419M19 16v3M19 22v.01" /></svg>;
const Memo = memo(IconEyeExclamation);
export default Memo;