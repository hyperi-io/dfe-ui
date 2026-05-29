import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDatabaseEdit = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-database-edit" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3-3.582-3-8-3-8 1.343-8 3" /><path d="M4 6v6c0 1.657 3.582 3 8 3q.718 0 1.402-.046M20 12V6" /><path d="M4 12v6c0 1.526 3.04 2.786 6.972 2.975M18.42 15.61a2.1 2.1 0 0 1 2.97 2.97L18 22h-3v-3z" /></svg>;
const Memo = memo(IconDatabaseEdit);
export default Memo;