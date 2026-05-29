import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandOnedrive = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-onedrive" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M18.456 10.45a6.45 6.45 0 0 0-12-2.151 4.857 4.857 0 0 0-4.44 5.241 4.856 4.856 0 0 0 5.236 4.444h10.751a3.77 3.77 0 0 0 3.99-3.54 3.77 3.77 0 0 0-3.538-3.992z" /></svg>;
const Memo = memo(IconBrandOnedrive);
export default Memo;