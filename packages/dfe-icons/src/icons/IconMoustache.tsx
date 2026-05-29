import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMoustache = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-moustache" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M15 9a3 3 0 0 1 2.599 1.5c.933 1.333 2.133 1.556 3.126 1.556h.291l.77-.044h.213q-1.444 2.888-6.6 3h-.565a3 3 0 0 1 .165-6z" /><path d="M9 9a3 3 0 0 0-2.599 1.5c-.933 1.333-2.133 1.556-3.126 1.556h-.291l-.77-.044h-.213q1.445 2.888 6.6 3h.565a3 3 0 0 0-.165-6z" /></svg>;
const Memo = memo(IconMoustache);
export default Memo;