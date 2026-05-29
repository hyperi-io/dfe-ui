import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFileTypeJson = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-file-type-sql" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M4.5 15.498h3v4.5a1.5 1.5 0 0 1-3 0M10.5 20.748c0 .414.336.75.75.75h1.25a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1.25a.75.75 0 0 1 .75.75" /><path d="m16.502 21.5-.002-6.002 4.038 6v-6" style={{
    fill: "none",
    stroke: "#000",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeDashoffset: 16.5836
  }} /><path stroke="none" d="M0 0h24v24H0Z" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4" /></svg>;
const Memo = memo(IconFileTypeJson);
export default Memo;