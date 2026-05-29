import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAtom = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-atom" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 12v.01M19.071 4.929c-1.562-1.562-6 .337-9.9 4.243-3.905 3.905-5.804 8.337-4.242 9.9 1.562 1.561 6-.338 9.9-4.244 3.905-3.905 5.804-8.337 4.242-9.9" /><path d="M4.929 4.929c-1.562 1.562.337 6 4.243 9.9 3.905 3.905 8.337 5.804 9.9 4.242 1.561-1.562-.338-6-4.244-9.9-3.905-3.905-8.337-5.804-9.9-4.242" /></svg>;
const Memo = memo(IconAtom);
export default Memo;