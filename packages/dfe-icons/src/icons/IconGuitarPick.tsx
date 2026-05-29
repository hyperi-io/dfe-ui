import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGuitarPick = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-guitar-pick" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M16 18.5C18 16 20 12 20 8c0-2.946-2.084-4.157-4.204-4.654Q14.5 3.001 12 3q-2.5 0-3.796.346C6.084 3.843 4 5.054 4 8c0 3.312 2 8 4 10.5q.445.556.963 1.081l.354.347a3.9 3.9 0 0 0 5.364 0A14 14 0 0 0 16 18.5" /></svg>;
const Memo = memo(IconGuitarPick);
export default Memo;