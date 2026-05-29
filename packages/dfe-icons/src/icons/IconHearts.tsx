import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHearts = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-hearts" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M14.017 18 12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 0 1 8.153 5.784" /><path d="m15.99 20 4.197-4.223a2.81 2.81 0 0 0 0-3.948 2.747 2.747 0 0 0-3.91-.007l-.28.282-.279-.283a2.747 2.747 0 0 0-3.91-.007 2.81 2.81 0 0 0-.007 3.948L15.983 20z" /></svg>;
const Memo = memo(IconHearts);
export default Memo;