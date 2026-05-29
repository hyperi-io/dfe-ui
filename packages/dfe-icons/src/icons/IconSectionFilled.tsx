import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSectionFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-section" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M20.01 19a1 1 0 0 1 .117 1.993L20 21a1 1 0 0 1-.117-1.993zm-16 0a1 1 0 0 1 0 2 1 1 0 0 1-.127-1.993m4 0a1 1 0 0 1 0 2 1 1 0 0 1-.127-1.993m4 0a1 1 0 0 1 .117 1.993l-.127.007a1 1 0 0 1-.117-1.993zm4 0a1 1 0 0 1 .117 1.993l-.127.007a1 1 0 0 1-.117-1.993zm4-16a1 1 0 0 1 .117 1.993l-.127.007a1 1 0 0 1-.117-1.993zm-16 0a1 1 0 1 1 0 2 1 1 0 0 1-.127-1.993m4 0a1 1 0 1 1 0 2 1 1 0 0 1-.127-1.993m4 0a1 1 0 0 1 .117 1.993l-.127.007a1 1 0 0 1-.117-1.993zm3.99 0a1 1 0 0 1 1 1 1 1 0 1 1-2 .01c0-.562.448-1.01 1-1.01m3 4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" /></svg>;
const Memo = memo(IconSectionFilled);
export default Memo;