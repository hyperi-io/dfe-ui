import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandSharik = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-sharik" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4.281 16.606A8.97 8.97 0 0 1 5.644 5.629a9.03 9.03 0 0 1 11.011-1.346C15.071 8.975 14.24 11.243 12 13c-1.584 1.242-3.836 2.24-7.719 3.606M20.616 9.3c2.113 7.59-4.892 13.361-11.302 11.264 1.931-3.1 3.235-4.606 4.686-6.065 1.705-1.715 3.591-3.23 6.616-5.199" /></svg>;
const Memo = memo(IconBrandSharik);
export default Memo;