import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconEyeTableFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-eye-table" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M20 2a1 1 0 0 1 0 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a1 1 0 1 1 0-2zM8 17l-.128.007A1 1 0 0 0 7.99 19l.128-.007A1 1 0 0 0 8 17m4 0-.128.007A1 1 0 0 0 11.99 19l.128-.007A1 1 0 0 0 12 17m4 0-.128.007A1 1 0 0 0 15.99 19l.128-.007A1 1 0 0 0 16 17m-6-3H9a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m5 0h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m-1-8h-4a1 1 0 1 0 0 2h1v3a1 1 0 0 0 2 0V8h1a1 1 0 0 0 0-2" /></svg>;
const Memo = memo(IconEyeTableFilled);
export default Memo;